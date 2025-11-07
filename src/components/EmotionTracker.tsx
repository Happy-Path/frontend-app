import { useState, useEffect, useRef } from "react";
import Webcam from "react-webcam";
import { Camera, Pause, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmotionResult {
  success: boolean;
  emotion?: string;
  confidence?: number;
  faces_count?: number;
  predictions?: Array<{
    face_id: number;
    emotion: string;
    confidence: number;
    coordinates: { x: number; y: number; width: number; height: number };
    all_probabilities: Record<string, number>;
  }>;
  all_probabilities?: Record<string, number>;
  message?: string;
}

interface EmotionTrackerProps {
  onEmotionDetected?: (emotion: string, confidence?: number, attentionScore?: number) => void;
  onTrackingChange?: (running: boolean) => void; // NEW
}

const EmotionTracker = ({ onEmotionDetected, onTrackingChange }: EmotionTrackerProps) => {
  const webcamRef = useRef<Webcam>(null);

  const [isTracking, setIsTracking] = useState(false);
  const [emotion, setEmotion] = useState<string>("Not Found");
  const [confidence, setConfidence] = useState<number>(0);
  const [attentionScore, setAttentionScore] = useState(0);
  const [faceDetected, setFaceDetected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const startTracking = () => {
    setIsTracking(true);
    onTrackingChange?.(true); // notify parent
    setError(null);
    // optional: clear old values at start too
    setEmotion("Not Found");
    setConfidence(0);
    setAttentionScore(0);
    setFaceDetected(false);
  };

  const stopTracking = () => {
    setIsTracking(false);
    onTrackingChange?.(false); // notify parent
    setIsProcessing(false);
    // ✅ Clear any previous readings so nothing stale shows
    setEmotion("Not Found");
    setConfidence(0);
    setAttentionScore(0);
    setFaceDetected(false);
  };

  const toggleTracking = () => (isTracking ? stopTracking() : startTracking());

  const calculateAttentionScore = (emotion: string, confidence: number): number => {
    const attentionMap: Record<string, number> = {
      happy: 0.8,
      surprise: 0.9,
      neutral: 0.7,
      fear: 0.6,
      angry: 0.5,
      sad: 0.4,
      disgust: 0.3,
    };
    const baseScore = attentionMap[emotion.toLowerCase()] || 0.5;
    return Math.min(baseScore * (confidence / 100), 1.0);
  };

  const captureAndSend = async () => {
    if (!webcamRef.current || isProcessing) return;

    setIsProcessing(true);
    setError(null);

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) {
        setError("Failed to capture image");
        return;
      }

      const response = await fetch(imageSrc);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append("file", blob, "frame.jpg");

      const apiResponse = await fetch("http://localhost:8000/predict-emotion/", {
        method: "POST",
        body: formData,
      });

      if (!apiResponse.ok) throw new Error(`API Error: ${apiResponse.status}`);

      const data: EmotionResult = await apiResponse.json();

      if (data.success) {
        let detectedEmotion = "neutral";
        let detectedConfidence = 0;

        if (data.predictions && data.predictions.length > 0) {
          const firstFace = data.predictions[0];
          detectedEmotion = firstFace.emotion.toLowerCase();
          detectedConfidence = firstFace.confidence;
          setFaceDetected(true);
        } else if (data.emotion) {
          detectedEmotion = data.emotion.toLowerCase();
          detectedConfidence = data.confidence || 0;
          setFaceDetected(true);
        } else {
          setFaceDetected(false);
          setError("No faces detected");
        }

        if (detectedEmotion !== "neutral" || detectedConfidence > 0) {
          setEmotion(detectedEmotion);
          setConfidence(detectedConfidence);

          const calculatedAttentionScore = calculateAttentionScore(detectedEmotion, detectedConfidence);
          setAttentionScore(calculatedAttentionScore);

          onEmotionDetected?.(detectedEmotion, detectedConfidence, calculatedAttentionScore);
        }
      } else {
        setFaceDetected(false);
        setError(data.message || "Failed to detect emotion");
      }
    } catch (err) {
      console.error("Error sending frame:", err);
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setFaceDetected(false);
    } finally {
      setIsProcessing(false);
    }
  };

  useEffect(() => {
    if (!isTracking) return;
    // Initial + interval capture only when tracking
    captureAndSend();
    const interval = setInterval(captureAndSend, 3000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTracking]);

  // Safety: ensure parent knows we're not tracking if component unmounts while running
  useEffect(() => {
    return () => {
      if (isTracking) onTrackingChange?.(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEmotionColor = (emotionType: string = emotion): string => {
    const colorMap: Record<string, string> = {
      happy: "text-yellow-500",
      sad: "text-blue-500",
      angry: "text-red-500",
      surprise: "text-purple-500",
      fear: "text-orange-500",
      disgust: "text-green-600",
      neutral: "text-gray-500",
    };
    return colorMap[emotionType.toLowerCase()] || "text-gray-500";
  };

  const getAttentionColor = (): string => {
    if (attentionScore > 0.7) return "bg-green-500";
    if (attentionScore > 0.4) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getEmotionEmoji = (emotionType: string = emotion): string => {
    const emojiMap: Record<string, string> = {
      happy: "😊",
      sad: "😢",
      angry: "😠",
      surprise: "😮",
      fear: "😨",
      disgust: "🤢",
      neutral: "😐",
    };
    return emojiMap[emotionType.toLowerCase()] || "😐";
  };

  return (
      <Card className="p-4 bg-white rounded-xl shadow-md">
        <div className="flex flex-col gap-4">
          {/* Header / Controls */}
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Emotion & Attention Tracker</h3>
            <div className="flex items-center gap-2">
              {isProcessing && <div className="animate-pulse text-sm text-blue-500">Processing...</div>}
              <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleTracking}
                  className={
                    isTracking
                        ? "bg-red-100 hover:bg-red-200 text-red-600"
                        : "bg-green-100 hover:bg-green-200 text-green-600"
                  }
              >
                {isTracking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Webcam */}
          {isTracking ? (
              <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-video">
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-full object-cover transform -scale-x-100"
                />
                <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                  {faceDetected ? <span className="text-green-300">✓ Face Detected</span> : <span className="text-red-300">⚠ No Face</span>}
                </div>
              </div>
          ) : (
              <div
                  className="flex items-center justify-center bg-gray-100 rounded-lg p-10 cursor-pointer hover:bg-gray-200 transition-colors"
                  onClick={startTracking}
              >
                <div className="text-center">
                  <Camera className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Click to start tracking</p>
                </div>
              </div>
          )}

          {/* Error */}
          {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md text-sm">
                ⚠ {error}
              </div>
          )}

          {/* ✅ Emotion & Attention Display — only when tracking */}
          {isTracking && (
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Current Emotion:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getEmotionEmoji()}</span>
                    <span className={`font-medium capitalize ${getEmotionColor()}`}>{emotion}</span>
                    {confidence > 0 && <span className="text-xs text-gray-500">({confidence.toFixed(1)}%)</span>}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium">Attention Level:</span>
                    <span className="font-mono">{Math.round(attentionScore * 100)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className={`h-2 rounded-full transition-all duration-300 ${getAttentionColor()}`}
                        style={{ width: `${attentionScore * 100}%` }}
                    />
                  </div>
                </div>
              </div>
          )}
        </div>
      </Card>
  );
};

export default EmotionTracker;
