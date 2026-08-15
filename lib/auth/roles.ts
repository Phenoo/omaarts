import type { UserRole } from '@/lib/types';

export function isStaffRole(role: UserRole | string | undefined | null) {
  return role === 'staff' || role === 'admin' || role === 'super_admin' || role === 'super_Admin';
}

export function isAdminRole(role: UserRole | string | undefined | null) {
  return role === 'admin' || role === 'super_admin' || role === 'super_Admin';
}
