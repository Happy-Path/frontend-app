// src/components/teacher/TeacherMicroBreakManager.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { microBreakService, MicroBreakItem } from "@/services/microBreakService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2, Play, Video } from "lucide-react";
import { toast } from "sonner";

/** Extract a YouTube video ID from common URL formats */
function getYoutubeId(url: string): string | null {
    if (!url) return null;
    try {
        const u = new URL(url);
        // youtu.be/<id>
        if (u.hostname === "youtu.be") {
            return u.pathname.slice(1) || null;
        }
        // www.youtube.com/watch?v=<id>
        if (u.hostname.includes("youtube.com")) {
            const v = u.searchParams.get("v");
            if (v) return v;
            // /embed/<id> or /v/<id>
            const parts = u.pathname.split("/");
            const maybeId = parts[parts.length - 1];
            return maybeId || null;
        }
    } catch {
        // fall through
    }
    return null;
}

const TeacherMicroBreakManager = () => {
    const qc = useQueryClient();

    const { data: items = [], isLoading } = useQuery<MicroBreakItem[]>({
        queryKey: ["micro-breaks", "teacher"],
        queryFn: microBreakService.list,
    });

    const [form, setForm] = useState({
        title: "",
        youtubeUrl: "",
        boosterText: "",
    });
    const [editingId, setEditingId] = useState<string | null>(null);

    const resetForm = () => {
        setForm({ title: "", youtubeUrl: "", boosterText: "" });
        setEditingId(null);
    };

    const createMutation = useMutation({
        mutationFn: microBreakService.create,
        onSuccess: () => {
            toast.success("Micro-break content added");
            qc.invalidateQueries({ queryKey: ["micro-breaks", "teacher"] });
            qc.invalidateQueries({ queryKey: ["micro-breaks", "public"] });
            resetForm();
        },
        onError: (err: any) => {
            toast.error(err?.message || "Failed to add content");
        },
    });

    const updateMutation = useMutation({
        mutationFn: (payload: { id: string; data: Partial<MicroBreakItem> }) =>
            microBreakService.update(payload.id, payload.data),
        onSuccess: () => {
            toast.success("Micro-break content updated");
            qc.invalidateQueries({ queryKey: ["micro-breaks", "teacher"] });
            qc.invalidateQueries({ queryKey: ["micro-breaks", "public"] });
            resetForm();
        },
        onError: (err: any) => {
            toast.error(err?.message || "Failed to update content");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: microBreakService.remove,
        onSuccess: () => {
            toast.success("Micro-break content deleted");
            qc.invalidateQueries({ queryKey: ["micro-breaks", "teacher"] });
            qc.invalidateQueries({ queryKey: ["micro-breaks", "public"] });
        },
        onError: (err: any) => {
            toast.error(err?.message || "Failed to delete content");
        },
    });

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = {
            title: form.title.trim(),
            youtubeUrl: form.youtubeUrl.trim(),
            boosterText: form.boosterText.trim(),
        };
        if (!trimmed.title || !trimmed.youtubeUrl || !trimmed.boosterText) {
            toast.error("Please fill all fields");
            return;
        }

        if (editingId) {
            updateMutation.mutate({ id: editingId, data: trimmed });
        } else {
            createMutation.mutate(trimmed);
        }
    };

    const startEdit = (item: MicroBreakItem) => {
        setEditingId(item.id);
        setForm({
            title: item.title,
            youtubeUrl: item.youtubeUrl,
            boosterText: item.boosterText,
        });
    };

    const handleDelete = (id: string) => {
        if (!window.confirm("Delete this micro-break item?")) return;
        deleteMutation.mutate(id);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1.2fr)] gap-6">
            {/* LEFT: Add / Edit form */}
            <Card className="p-6 space-y-4">
                <div>
                    <h2 className="text-xl font-bold mb-1">Manage Micro-Break Content</h2>
                    <p className="text-sm text-muted-foreground">
                        Create short calming clips with a positive message that students see
                        during their micro-breaks.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Title for this micro-break
                        </label>
                        <Input
                            value={form.title}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, title: e.target.value }))
                            }
                            placeholder="A short friendly title"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            YouTube video link
                        </label>
                        <Input
                            value={form.youtubeUrl}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, youtubeUrl: e.target.value }))
                            }
                            placeholder="YouTube URL"
                        />
                        <p className="mt-1 text-[11px] text-muted-foreground">
                            Any standard YouTube link is fine (e.g. watch, share, or short
                            link).
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Positive booster message
                        </label>
                        <Textarea
                            value={form.boosterText}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, boosterText: e.target.value }))
                            }
                            placeholder="A short, kind message (shown under the video.)"
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-1">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingId ? "Save changes" : "+ Add micro-break"}
                        </Button>
                        {editingId && (
                            <Button
                                type="button"
                                variant="outline"
                                onClick={resetForm}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                        )}
                    </div>
                </form>
            </Card>

            {/* RIGHT: Library */}
            <Card className="p-6 space-y-4">
                <div>
                    <h2 className="text-xl font-bold mb-1">Content Library</h2>
                    <p className="text-sm text-muted-foreground">
                        These items are randomly shown during micro-breaks.
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-sm text-muted-foreground">Loading…</div>
                ) : items.length === 0 ? (
                    <div className="text-sm text-muted-foreground">
                        No micro-break content yet. Add your first calming video on the
                        left.
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1">
                        {items.map((item) => {
                            const videoId = getYoutubeId(item.youtubeUrl);
                            const thumbUrl = videoId
                                ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
                                : null;

                            return (
                                <div
                                    key={item.id}
                                    className="flex items-start gap-3 rounded-xl border bg-white/80 px-4 py-3 shadow-xs"
                                >
                                    {/* Thumbnail / preview */}
                                    <div className="h-20 w-32 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0 relative">
                                        {thumbUrl ? (
                                            <>
                                                <img
                                                    src={thumbUrl}
                                                    alt={item.title}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/10" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <Play className="h-6 w-6 text-white drop-shadow-[0_0_4px_rgba(0,0,0,0.4)]" />
                                                </div>
                                            </>
                                        ) : (
                                            <div className="w-full h-full flex flex-col items-center justify-center text-[11px] text-slate-500 gap-1">
                                                <Video className="h-5 w-5" />
                                                <span>Preview not available</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Text content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between gap-2">
                                            <h3 className="text-sm font-semibold truncate">
                                                {item.title}
                                            </h3>
                                        </div>
                                        <p className="text-xs text-slate-700 mt-1 line-clamp-2">
                                            “{item.boosterText}”
                                        </p>
                                        <p className="text-[10px] text-slate-400 mt-1 break-all">
                                            {item.youtubeUrl}
                                        </p>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col items-center gap-2 ml-1">
                                        <button
                                            type="button"
                                            onClick={() => startEdit(item)}
                                            className="p-1.5 rounded-full hover:bg-slate-100 transition-colors"
                                            title="Edit"
                                        >
                                            <Pencil className="h-4 w-4 text-slate-600" />
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => handleDelete(item.id)}
                                            className="p-1.5 rounded-full hover:bg-red-50 transition-colors"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4 text-red-500" />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TeacherMicroBreakManager;
