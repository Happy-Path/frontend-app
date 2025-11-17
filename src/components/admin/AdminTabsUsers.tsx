// src/components/admin/AdminTabsUsers.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { adminService } from "@/services/adminService";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Pencil } from "lucide-react";

import CreateUserDialog from "@/components/admin/CreateUserDialog";
import EditUserDialog from "@/components/admin/EditUserDialog";

type Role = "student" | "parent" | "teacher" | "admin";
type RoleFilter = Role | "all";

interface UsersResponse {
    items: any[];
    total: number;
    page: number;
    pages: number;
}

export default function AdminTabsUsers() {
    const qc = useQueryClient();
    const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
    const [query, setQuery] = useState("");
    const [page, setPage] = useState(1);

    const [createOpen, setCreateOpen] = useState(false);
    const [editUser, setEditUser] = useState<any | null>(null);

    // ✅ fixed typed useQuery for React Query v5
    const {
        data = { items: [], total: 0, page: 1, pages: 0 },
        isLoading,
        isError,
        error,
    } = useQuery<UsersResponse>({
        queryKey: ["admin-users", roleFilter, query, page] as const,
        queryFn: async (): Promise<UsersResponse> => {
            const params = {
                role: roleFilter === "all" ? undefined : roleFilter,
                q: query || undefined,
                page,
                limit: 10,
            };
            const res = await adminService.listUsers(params);
            return (
                (res as UsersResponse) ?? {
                    items: [],
                    total: 0,
                    page: 1,
                    pages: 0,
                }
            );
        },
        placeholderData: (prev) =>
            prev ?? { items: [], total: 0, page: 1, pages: 0 },
    });

    // ✅ Mutations
    const createMutation = useMutation({
        mutationFn: adminService.createUser,
        onSuccess: () => {
            toast.success("User created");
            qc.invalidateQueries({ queryKey: ["admin-users"] });
            setCreateOpen(false);
        },
        onError: (err: any) => toast.error(err?.message || "Create failed"),
    });

    const updateUserMutation = useMutation({
        mutationFn: ({
                         id,
                         payload,
                     }: {
            id: string;
            payload: { name?: string; email?: string; isActive?: boolean };
        }) => adminService.updateUser(id, payload),
        onSuccess: () => {
            toast.success("User updated");
            qc.invalidateQueries({ queryKey: ["admin-users"] });
            setEditUser(null);
        },
        onError: (err: any) => toast.error(err?.message || "Update failed"),
    });

    const resetPasswordMutation = useMutation({
        mutationFn: (id: string) => adminService.resetPassword(id),
        onSuccess: () => {
            toast.success('Password reset to "password123"');
        },
        onError: (err: any) => toast.error(err?.message || "Reset password failed"),
    });

    return (
        <div className="space-y-6">
            {/* Filters + Create */}
            <Card className="p-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                    <Label>Search</Label>
                    <Input
                        placeholder="name or email…"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                </div>

                <div>
                    <Label>Role</Label>
                    <Select
                        value={roleFilter}
                        onValueChange={(val: RoleFilter) => setRoleFilter(val)}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="All roles" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All</SelectItem>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-end">
                    <Button className="w-full" onClick={() => setCreateOpen(true)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Create an User
                    </Button>
                </div>
            </Card>

            {/* List */}
            <Card className="p-4">
                {isLoading ? (
                    <div>Loading…</div>
                ) : isError ? (
                    <div className="text-red-600">
                        Failed to load users: {(error as Error)?.message}
                    </div>
                ) : (
                    <div className="space-y-3">
                        {data.items.map((u: any) => (
                            <div
                                key={u._id}
                                className="grid grid-cols-1 md:grid-cols-6 items-center gap-3 border rounded-lg p-3"
                            >
                                <div className="md:col-span-2">
                                    <div className="font-semibold">{u.name}</div>
                                    <div className="text-sm text-gray-500">{u.email}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <Label className="text-xs">Role</Label>
                                    <Badge variant="secondary" className="capitalize">
                                        {u.role}
                                    </Badge>
                                </div>

                                <div className="text-sm text-gray-500">
                                    <div>
                                        Created:{" "}
                                        {u.createdAt
                                            ? new Date(u.createdAt).toLocaleDateString()
                                            : "—"}
                                    </div>
                                    {u.lastLoginAt && (
                                        <div>
                                            Last login: {new Date(u.lastLoginAt).toLocaleString()}
                                        </div>
                                    )}
                                </div>

                                <div className="flex justify-end">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        title="Edit"
                                        onClick={() => setEditUser(u)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}

                        {data.pages > 1 && (
                            <div className="flex gap-2 justify-end">
                                <Button
                                    variant="outline"
                                    disabled={page <= 1}
                                    onClick={() => setPage((p) => p - 1)}
                                >
                                    Prev
                                </Button>
                                <Button
                                    variant="outline"
                                    disabled={page >= data.pages}
                                    onClick={() => setPage((p) => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </Card>

            {/* Create Dialog */}
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
                <CreateUserDialog
                    open={createOpen}
                    onOpenChange={setCreateOpen}
                    isSubmitting={createMutation.isPending}
                    onCreate={(payload) => createMutation.mutate(payload)}
                />
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={!!editUser} onOpenChange={(open) => setEditUser(open ? editUser : null)}>
                {editUser && (
                    <EditUserDialog
                        open={!!editUser}
                        onOpenChange={(open) => setEditUser(open ? editUser : null)}
                        user={editUser}
                        isSubmitting={updateUserMutation.isPending || resetPasswordMutation.isPending}
                        onResetPassword={() => resetPasswordMutation.mutate(editUser._id)}
                        onUpdate={(payload) => updateUserMutation.mutate({ id: editUser._id, payload })}
                    />
                )}
            </Dialog>
        </div>
    );
}
