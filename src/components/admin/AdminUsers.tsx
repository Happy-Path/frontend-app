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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";

type Role = "student" | "parent" | "teacher" | "admin";
type RoleFilter = Role | "all";

interface UsersResponse {
  items: any[];
  total: number;
  page: number;
  pages: number;
}

export default function AdminUsers() {
  const qc = useQueryClient();
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [open, setOpen] = useState(false);

  // ✅ Properly typed query
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
          (res as UsersResponse) ?? { items: [], total: 0, page: 1, pages: 0 }
      );
    },
    placeholderData: (prev) =>
        prev ?? { items: [], total: 0, page: 1, pages: 0 },
    gcTime: 1000 * 60 * 5,
  });

  // ✅ Mutations
  const createMutation = useMutation({
    mutationFn: adminService.createUser,
    onSuccess: () => {
      toast.success("User created");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
      setOpen(false);
    },
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: Role }) =>
        adminService.updateRole(id, role),
    onSuccess: () => {
      toast.success("Role updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const activeMutation = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
        adminService.toggleActive(id, isActive),
    onSuccess: () => {
      toast.success("Account status updated");
      qc.invalidateQueries({ queryKey: ["admin-users"] });
    },
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
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full">Create User</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Create User</DialogTitle>
                </DialogHeader>
                <CreateUserForm
                    onSubmit={(payload) => createMutation.mutate(payload)}
                    isSubmitting={createMutation.isPending}
                />
              </DialogContent>
            </Dialog>
          </div>
        </Card>

        {/* Users list */}
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
                        className="grid grid-cols-1 md:grid-cols-5 items-center gap-3 border rounded-lg p-3"
                    >
                      <div className="md:col-span-2">
                        <div className="font-semibold">{u.name}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                      </div>

                      <div>
                        <Label className="text-xs">Role</Label>
                        <Select
                            value={(u.role as Role) ?? "student"}
                            onValueChange={(val: Role) =>
                                roleMutation.mutate({ id: u._id, role: val })
                            }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="student">Student</SelectItem>
                            <SelectItem value="parent">Parent</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-xs">Active</Label>
                        <div className="mt-2">
                          <Switch
                              checked={u.isActive !== false}
                              onCheckedChange={(checked) =>
                                  activeMutation.mutate({ id: u._id, isActive: checked })
                              }
                          />
                        </div>
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
      </div>
  );
}

function CreateUserForm({
                          onSubmit,
                          isSubmitting,
                        }: {
  onSubmit: (p: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) => void;
  isSubmitting: boolean;
}) {
  const [form, setForm] = useState<{
    name: string;
    email: string;
    password: string;
    role: Role;
  }>({
    name: "",
    email: "",
    password: "",
    role: "student",
  });

  return (
      <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit(form);
          }}
      >
        <div>
          <Label>Name</Label>
          <Input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
          />
        </div>
        <div>
          <Label>Email</Label>
          <Input
              type="email"
              value={form.email}
              onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
              required
          />
        </div>
        <div>
          <Label>Password</Label>
          <Input
              type="password"
              value={form.password}
              onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
              required
          />
        </div>
        <div>
          <Label>Role</Label>
          <Select
              value={form.role}
              onValueChange={(val: Role) =>
                  setForm((f) => ({ ...f, role: val }))
              }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="student">Student</SelectItem>
              <SelectItem value="parent">Parent</SelectItem>
              <SelectItem value="teacher">Teacher</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Creating…" : "Create"}
        </Button>
      </form>
  );
}
