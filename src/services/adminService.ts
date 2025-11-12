// src/services/adminService.ts
import { api } from './api'; // your configured axios instance with auth header

export const adminService = {
  createUser(data: { name: string; email: string; password: string; role: 'student'|'parent'|'teacher'|'admin' }) {
    return api.post('/admin/users', data).then(res => res.data);
  },
  listUsers(params?: { role?: string; q?: string; page?: number; limit?: number }) {
    return api.get('/admin/users', { params }).then(res => res.data);
  },
  updateRole(id: string, role: 'student'|'parent'|'teacher'|'admin') {
    return api.patch(`/admin/users/${id}/role`, { role }).then(res => res.data);
  },
  toggleActive(id: string, isActive: boolean) {
    return api.patch(`/admin/users/${id}/active`, { isActive }).then(res => res.data);
  }
};
