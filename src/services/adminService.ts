// src/services/adminService.ts
import { api } from "./api";

type Role = "student" | "parent" | "teacher" | "admin";

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: Role;
  createdAt?: string;
  updatedAt?: string;
  lastLoginAt?: string;
}

export interface ParentStudentAssignment {
  _id: string;
  parentId: {
    _id: string;
    name: string;
    email: string;
    role: "parent";
  };
  studentId: {
    _id: string;
    name: string;
    email: string;
    role: "student";
  };
  assignedBy?: {
    _id: string;
    name: string;
    email: string;
  };
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export const adminService = {
  async createUser(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
  }) {
    return api.post<{ message: string; user: AdminUser }>("/admin/users", data);
  },

  async listUsers(params?: {
    role?: string;
    q?: string;
    page?: number;
    limit?: number;
  }) {
    const query = new URLSearchParams();
    if (params?.role) query.set("role", params.role);
    if (params?.q) query.set("q", params.q);
    if (params?.page) query.set("page", String(params.page));
    if (params?.limit) query.set("limit", String(params.limit));

    const path = `/admin/users${
        query.toString() ? `?${query.toString()}` : ""
    }`;
    const res = await api.get<{
      items: AdminUser[];
      total: number;
      page: number;
      pages: number;
    }>(path);
    return res ?? { items: [], total: 0, page: 1, pages: 0 };
  },

  // Update user details (name/email/isActive)
  async updateUser(
      id: string,
      payload: { name?: string; email?: string; isActive?: boolean }
  ) {
    return api.patch<{ message: string; user: AdminUser }>(
        `/admin/users/${id}`,
        payload
    );
  },

  async toggleActive(id: string, isActive: boolean) {
    return api.patch<{ message: string; user: AdminUser }>(
        `/admin/users/${id}/active`,
        { isActive }
    );
  },

  async resetPassword(id: string) {
    return api.patch<{ message: string }>(
        `/admin/users/${id}/reset-password`,
        {}
    );
  },

  async updateRole(id: string, role: Role) {
    return api.patch<{ message: string; user: AdminUser }>(
        `/admin/users/${id}/role`,
        { role }
    );
  },

  // ---------- Parent–Student Assignments ----------

  async listAssignments(params?: { parentId?: string; studentId?: string }) {
    const qs = new URLSearchParams();
    if (params?.parentId) qs.set("parentId", params.parentId);
    if (params?.studentId) qs.set("studentId", params.studentId);
    const suffix = qs.toString() ? `?${qs.toString()}` : "";
    return api.get<ParentStudentAssignment[]>(
        `/admin/assignments${suffix}`
    );
  },

  async assignStudentsToParent(input: {
    parentId: string;
    studentIds: string[];
    note?: string;
  }) {
    return api.post<{
      inserted: number;
      items: ParentStudentAssignment[];
      conflicts?: string[];
      message?: string;
    }>("/admin/assignments", input);
  },

  async deleteAssignment(id: string) {
    return api.delete<{ message: string }>(`/admin/assignments/${id}`);
  },

  // ---------- User searches (via /api/users) ----------

  async searchParents(q: string) {
    const qs = new URLSearchParams();
    qs.set("role", "parent");
    if (q) qs.set("q", q);
    qs.set("limit", "20");
    return api.get<AdminUser[]>(`/users?${qs.toString()}`);
  },

  async searchStudents(q: string) {
    const qs = new URLSearchParams();
    qs.set("role", "student");
    if (q) qs.set("q", q);
    qs.set("limit", "50");
    return api.get<AdminUser[]>(`/users?${qs.toString()}`);
  },
};
