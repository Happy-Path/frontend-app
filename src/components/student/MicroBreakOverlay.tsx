// src/components/student/MicroBreakOverlay.tsx
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type MicroBreakContentLite = {
    id: string;
    title: string;
    youtubeUrl: string;
    boosterText: string;
};

/**
 * Robust YouTube video ID extractor for:
 * - Full URLs (with or without protocol)
 * - youtu.be short links
 * - /watch?v=ID
 * - /embed/ID
 * - /shorts/ID
 * - Raw video IDs (dQw4w9WgXcQ)
 */
function extractVideoId(raw: string): string | null {
    if (!raw) return null;

    const trimmed = raw.trim();

    // If it's likely just a raw video ID (11-ish chars, no spaces)
    if (/^[a-zA-Z0-9_-]{10,15}$/.test(trimmed)) {
        return trimmed;
    }

    // Ensure we have a protocol so new URL() doesn't throw
    let normalized = trimmed;
    if (!/^https?:\/\//i.test(normalized)) {
        normalized = `https://${normalized}`;
    }

    try {
        const u = new URL(normalized);

        // youtu.be/<id>
        if (u.hostname.includes("youtu.be")) {
            const pathId = u.pathname.replace("/", "").trim();
            if (pathId) return pathId;
        }

        if (u.hostname.includes("youtube.com")) {
            // https://www.youtube.com/watch?v=<id>
            const vParam = u.searchParams.get("v");
            if (vParam) return vParam;

            // /embed/<id>, /shorts/<id>, /live/<id>, etc.
            const parts = u.pathname.split("/").filter(Boolean);
            const lastSegment = parts[parts.length - 1];
            if (lastSegment) return lastSegment;
        }

        return null;
    } catch (e) {
        console.warn("Invalid YouTube URL for micro-break:", raw, e);
        return null;
    }
}

interface MicroBreakOverlayProps {
    open: boolean;
    content?: MicroBreakContentLite | null;
    onContinue: () => void;
    onSmallBreak: () => void;
}

const MicroBreakOverlay = ({
                               open,
                               content,
                               onContinue,
                               onSmallBreak,
                           }: MicroBreakOverlayProps) => {
    if (!open || !content) return null;

    const videoId = extractVideoId(content.youtubeUrl);
    const embedSrc = videoId
        ? `https://www.youtube.com/embed/${videoId}?autoplay=1&playsinline=1&rel=0`
        : "";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 backdrop-blur-sm">
            <Card className="w-full max-w-xl rounded-3xl bg-white text-gray-900 p-5 md:p-6 shadow-2xl border border-gray-100">
                {/* Video */}
                <div className="rounded-3xl overflow-hidden bg-gray-200 mb-4">
                    {embedSrc ? (
                        <iframe
                            src={embedSrc}
                            title={content.title}
                            className="w-full aspect-video"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                        />
                    ) : (
                        <div className="w-full aspect-video flex items-center justify-center text-sm text-gray-500">
                            Video preview not available
                        </div>
                    )}
                </div>

                {/* Text */}
                <div className="text-center space-y-1 mb-4">
                    <h2 className="text-xl md:text-2xl font-semibold">
                        You’re doing really well <span className="align-middle">🌟</span>
                    </h2>
                    <p className="text-sm md:text-base text-gray-700">
                        Let’s try the next part together.
                    </p>
                    <p className="text-xs md:text-sm text-gray-500">
                        Remember: It’s okay to take it slow.
                    </p>
                </div>

                {/* Booster message from library */}
                <div className="text-center text-sm md:text-base text-gray-800 mb-4">
                    “{content.boosterText}”
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                    <Button
                        onClick={onContinue}
                        className="flex-1 rounded-full font-semibold"
                    >
                        Okay, continue
                    </Button>
                    <Button
                        variant="outline"
                        onClick={onSmallBreak}
                        className="flex-1 rounded-full"
                    >
                        I want a small break
                    </Button>
                </div>
            </Card>
        </div>
    );
};

export default MicroBreakOverlay;
