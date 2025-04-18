
import { useState, useEffect, useRef } from 'react';
import { Camera, Pause, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const EmotionTracker = ({ onEmotionDetected }) => {
  const [isTracking, setIsTracking] = useState(false);
  const [currentEmotion, setCurrentEmotion] = useState('neutral');
  const [confidence, setConfidence] = useState(0);
  const [attentionScore, setAttentionScore] = useState(0);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  // Mock emotions for simulation
  const emotions = ['happy', 'neutral', 'surprised', 'sad'];

  useEffect(() => {
    if (isTracking) {
      // Simulation of emotion detection
      const interval = setInterval(() => {
        const newEmotion = emotions[Math.floor(Math.random() * emotions.length)];
        const newConfidence = Math.random() * 0.5 + 0.5; // Random value between 0.5 and 1
        const newAttention = Math.random() * 0.7 + 0.3; // Random value between 0.3 and 1
        
        setCurrentEmotion(newEmotion);
        setConfidence(newConfidence);
        setAttentionScore(newAttention);
        
        if (onEmotionDetected) {
          onEmotionDetected(newEmotion, newConfidence, newAttention);
        }
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [isTracking, onEmotionDetected]);

  const startCamera = async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setIsTracking(true);
        }
      } else {
        console.error("getUserMedia is not supported in this browser");
      }
    } catch (error) {
      console.error("Error accessing camera:", error);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsTracking(false);
  };

  const toggleTracking = () => {
    if (isTracking) {
      stopCamera();
    } else {
      startCamera();
    }
  };

  const getEmotionColor = () => {
    switch (currentEmotion) {
      case 'happy': return 'text-yellow-500';
      case 'sad': return 'text-blue-500';
      case 'angry': return 'text-red-500';
      case 'surprised': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  const getAttentionColor = () => {
    if (attentionScore > 0.7) return 'bg-green-500';
    if (attentionScore > 0.4) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <Card className="p-4 bg-white rounded-xl shadow-md">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">Emotion & Attention</h3>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={toggleTracking}
            className={isTracking ? "bg-red-100 hover:bg-red-200 text-red-600" : "bg-happy-100 hover:bg-happy-200 text-happy-600"}
          >
            {isTracking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </div>
        
        {isTracking && (
          <div className="relative overflow-hidden rounded-lg bg-gray-100 aspect-video">
            <video 
              ref={videoRef} 
              autoPlay 
              playsInline 
              muted 
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {!isTracking && (
          <div 
            className="flex items-center justify-center bg-gray-100 rounded-lg p-10 cursor-pointer hover:bg-gray-200 transition-colors"
            onClick={startCamera}
          >
            <Camera className="h-10 w-10 text-gray-400" />
          </div>
        )}
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Current Emotion:</span>
            <span className={`font-medium capitalize ${getEmotionColor()}`}>{currentEmotion}</span>
          </div>
          
          <div className="space-y-1">
            <div className="flex justify-between text-sm">
              <span>Attention Level:</span>
              <span>{Math.round(attentionScore * 100)}%</span>
            </div>
            <Progress value={attentionScore * 100} className={getAttentionColor()} />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default EmotionTracker;
