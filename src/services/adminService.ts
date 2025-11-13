import { api } from './api';

type Role = 'student' | 'parent' | 'teacher' | 'admin';

export const adminService = {
  async createUser(data: { name: string; email: string; password: string; role: Role }) {
    const res = await api.post('/admin/users', data);
    return res;
  },

  async listUsers(params?: { role?: string; q?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params?.role) query.set('role', params.role);
    if (params?.q) query.set('q', params.q);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));

    const res = await api.get(`/admin/users${query.toString() ? `?${query.toString()}` : ''}`);
    return res ?? { items: [], total: 0, page: 1, pages: 0 };
  },

  // NEW: update user details (name/email/isActive)
  async updateUser(id: string, payload: { name?: string; email?: string; isActive?: boolean }) {
    const res = await api.patch(`/admin/users/${id}`, payload);
    return res;
  },

  async toggleActive(id: string, isActive: boolean) {
    const res = await api.patch(`/admin/users/${id}/active`, { isActive });
    return res;
  },

  async resetPassword(id: string) {
    const res = await api.patch(`/admin/users/${id}/reset-password`, {});
    return res;
  },

  async updateRole(id: string, role: Role) {
    const res = await api.patch(`/admin/users/${id}/role`, { role });
    return res;
  },

};
