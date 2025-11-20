// src/components/teacher/TeacherMicroBreakManager.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { microBreakService, MicroBreakItem } from "@/services/microBreakService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

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
                    <p className="text-sm text-gray-500">
                        Add or update the mood-fixing video and booster message that appear
                        during micro-breaks for students.
                    </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Title (for teachers)
                        </label>
                        <Input
                            value={form.title}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, title: e.target.value }))
                            }
                            placeholder="Relaxing Music for Stress Relief"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            YouTube Video Link
                        </label>
                        <Input
                            value={form.youtubeUrl}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, youtubeUrl: e.target.value }))
                            }
                            placeholder="https://www.youtube.com/watch?v=..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Positive Emotion Booster
                        </label>
                        <Textarea
                            value={form.boosterText}
                            onChange={(e) =>
                                setForm((f) => ({ ...f, boosterText: e.target.value }))
                            }
                            placeholder="This message will appear below the video…"
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-1">
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={createMutation.isPending || updateMutation.isPending}
                        >
                            {editingId ? "Save Changes" : "Add Content"}
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
                    <h2 className="text-xl font-bold mb-1">Current Content Library</h2>
                    <p className="text-sm text-gray-500">
                        These items are used randomly during micro-breaks for students.
                    </p>
                </div>

                {isLoading ? (
                    <div className="text-sm text-gray-500">Loading…</div>
                ) : items.length === 0 ? (
                    <div className="text-sm text-gray-500">
                        No micro-break content yet. Add your first calming video on the
                        left.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {items.map((item) => (
                            <div
                                key={item.id}
                                className="flex items-start gap-3 rounded-lg border bg-gray-50 px-4 py-3"
                            >
                                <div className="h-16 w-28 rounded-md overflow-hidden bg-gray-200 flex-shrink-0">
                                    {/* simple thumbnail placeholder (no external calls) */}
                                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-600">
                                        Video
                                    </div>
                                </div>

                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <h3 className="text-sm font-semibold truncate">
                                            {item.title}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                        “{item.boosterText}”
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-1 break-all">
                                        {item.youtubeUrl}
                                    </p>
                                </div>

                                <div className="flex flex-col items-center gap-2 ml-1">
                                    <button
                                        type="button"
                                        onClick={() => startEdit(item)}
                                        className="p-1 rounded-full hover:bg-gray-200"
                                        title="Edit"
                                    >
                                        <Pencil className="h-4 w-4 text-gray-600" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(item.id)}
                                        className="p-1 rounded-full hover:bg-red-50"
                                        title="Delete"
                                    >
                                        <Trash2 className="h-4 w-4 text-red-500" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TeacherMicroBreakManager;
