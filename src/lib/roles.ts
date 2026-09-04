// Fixed role → permission map: one source of truth, so the permissions
// matrix and its enforcement can't drift apart (see db/schema.sql: app_user.role
// is a free-text column validated against this list at the application layer).
export const ROLES = ['super_admin', 'editor', 'viewer'] as const
export type Role = (typeof ROLES)[number]

export const PERMISSIONS = [
  'enquiries.view',
  'enquiries.manage',
  'content.manage',
  'settings.manage',
  'users.manage',
] as const
export type Permission = (typeof PERMISSIONS)[number]

const rolePermissions: Record<Role, Permission[]> = {
  super_admin: ['enquiries.view', 'enquiries.manage', 'content.manage', 'settings.manage', 'users.manage'],
  editor: ['enquiries.view', 'enquiries.manage', 'content.manage'],
  viewer: ['enquiries.view'],
}

export function can(role: string, permission: Permission): boolean {
  return rolePermissions[role as Role]?.includes(permission) ?? false
}

export function isValidRole(role: string): role is Role {
  return (ROLES as readonly string[]).includes(role)
}
