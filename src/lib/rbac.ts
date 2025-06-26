import { UserRole } from '@prisma/client'

// Define all possible permissions in the system
export const PERMISSIONS = {
  // User management
  USER_READ: 'user:read',
  USER_WRITE: 'user:write',
  USER_DELETE: 'user:delete',
  
  // Analytics and reporting
  ANALYTICS_READ: 'analytics:read',
  ANALYTICS_WRITE: 'analytics:write',
  ADVANCED_ANALYTICS: 'advanced:analytics',
  
  // Premium features
  PREMIUM_ACCESS: 'premium:access',
  PREMIUM_GOALS: 'premium:goals',
  PREMIUM_INSIGHTS: 'premium:insights',
  
  // Admin features
  ADMIN_PANEL: 'admin:panel',
  SYSTEM_CONFIG: 'system:config',
  SUPPORT_WRITE: 'support:write',
  
  // Financial data
  FINANCE_READ: 'finance:read',
  FINANCE_WRITE: 'finance:write',
  FINANCE_DELETE: 'finance:delete',
} as const

export type Permission = typeof PERMISSIONS[keyof typeof PERMISSIONS]

// Role hierarchy (higher number = more permissions)
export const ROLE_HIERARCHY = {
  [UserRole.READONLY]: 1,
  [UserRole.USER]: 2,
  [UserRole.PREMIUM_USER]: 3,
  [UserRole.ADMIN]: 4,
  [UserRole.SUPER_ADMIN]: 5,
} as const

// Default permissions for each role
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.READONLY]: [
    PERMISSIONS.FINANCE_READ,
  ],
  [UserRole.USER]: [
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.ANALYTICS_READ,
  ],
  [UserRole.PREMIUM_USER]: [
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.PREMIUM_ACCESS,
    PERMISSIONS.PREMIUM_GOALS,
    PERMISSIONS.PREMIUM_INSIGHTS,
    PERMISSIONS.ADVANCED_ANALYTICS,
  ],
  [UserRole.ADMIN]: [
    PERMISSIONS.FINANCE_READ,
    PERMISSIONS.FINANCE_WRITE,
    PERMISSIONS.FINANCE_DELETE,
    PERMISSIONS.ANALYTICS_READ,
    PERMISSIONS.ANALYTICS_WRITE,
    PERMISSIONS.USER_READ,
    PERMISSIONS.USER_WRITE,
    PERMISSIONS.ADMIN_PANEL,
    PERMISSIONS.SUPPORT_WRITE,
    PERMISSIONS.PREMIUM_ACCESS,
    PERMISSIONS.PREMIUM_GOALS,
    PERMISSIONS.PREMIUM_INSIGHTS,
    PERMISSIONS.ADVANCED_ANALYTICS,
  ],
  [UserRole.SUPER_ADMIN]: [
    // Super admin has all permissions (represented by '*')
    ...Object.values(PERMISSIONS),
  ],
}

export interface User {
  id: string
  role: UserRole
  permissions: string[]
  isActive: boolean
}

/**
 * Check if user has a specific permission
 */
export function hasPermission(user: User, permission: Permission): boolean {
  if (!user.isActive) return false
  
  // Super admin wildcard check
  if (user.permissions.includes('*')) return true
  
  // Check explicit permissions
  if (user.permissions.includes(permission)) return true
  
  // Check role-based permissions
  const rolePermissions = ROLE_PERMISSIONS[user.role] || []
  return rolePermissions.includes(permission)
}

/**
 * Check if user has any of the specified permissions
 */
export function hasAnyPermission(user: User, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission))
}

/**
 * Check if user has all of the specified permissions
 */
export function hasAllPermissions(user: User, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission))
}

/**
 * Check if user has a role at or above the specified level
 */
export function hasRoleLevel(user: User, minimumRole: UserRole): boolean {
  if (!user.isActive) return false
  
  const userLevel = ROLE_HIERARCHY[user.role] || 0
  const requiredLevel = ROLE_HIERARCHY[minimumRole] || 0
  
  return userLevel >= requiredLevel
}

/**
 * Check if user can access premium features
 */
export function isPremiumUser(user: User): boolean {
  return hasPermission(user, PERMISSIONS.PREMIUM_ACCESS)
}

/**
 * Check if user is an admin (admin or super admin)
 */
export function isAdmin(user: User): boolean {
  return hasRoleLevel(user, UserRole.ADMIN)
}

/**
 * Check if user is super admin
 */
export function isSuperAdmin(user: User): boolean {
  return user.role === UserRole.SUPER_ADMIN && user.isActive
}

/**
 * Get all permissions for a user (role-based + explicit)
 */
export function getUserPermissions(user: User): Permission[] {
  if (!user.isActive) return []
  
  // Super admin gets all permissions
  if (user.permissions.includes('*')) {
    return Object.values(PERMISSIONS)
  }
  
  const rolePermissions = ROLE_PERMISSIONS[user.role] || []
  const explicitPermissions = user.permissions.filter(p => 
    Object.values(PERMISSIONS).includes(p as Permission)
  ) as Permission[]
  
  // Combine and deduplicate
  return Array.from(new Set([...rolePermissions, ...explicitPermissions]))
}

/**
 * Check if user can perform action on resource
 * This can be extended for resource-level permissions
 */
export function canAccessResource(
  user: User, 
  action: 'read' | 'write' | 'delete', 
  resource: 'finance' | 'user' | 'analytics' | 'admin'
): boolean {
  const permission = `${resource}:${action}` as Permission
  return hasPermission(user, permission)
}

/**
 * Role display names for UI
 */
export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  [UserRole.SUPER_ADMIN]: 'Super Administrator',
  [UserRole.ADMIN]: 'Administrator',
  [UserRole.PREMIUM_USER]: 'Premium User',
  [UserRole.USER]: 'User',
  [UserRole.READONLY]: 'Read Only',
}

/**
 * Get user role display name
 */
export function getRoleDisplayName(role: UserRole): string {
  return ROLE_DISPLAY_NAMES[role] || 'Unknown'
}

/**
 * Check if role upgrade is valid
 */
export function canUpgradeRole(currentRole: UserRole, targetRole: UserRole): boolean {
  const currentLevel = ROLE_HIERARCHY[currentRole] || 0
  const targetLevel = ROLE_HIERARCHY[targetRole] || 0
  
  // Can only upgrade to higher level roles
  return targetLevel > currentLevel
}

/**
 * Get available upgrade roles for a user
 */
export function getAvailableUpgrades(currentRole: UserRole): UserRole[] {
  return Object.keys(UserRole)
    .filter(role => canUpgradeRole(currentRole, role as UserRole))
    .map(role => role as UserRole)
} 