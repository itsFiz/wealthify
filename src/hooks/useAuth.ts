'use client'

import React from 'react'
import { useSession } from 'next-auth/react'
import { UserRole } from '@prisma/client'
import { 
  hasPermission, 
  hasRoleLevel, 
  isPremiumUser, 
  isAdmin, 
  isSuperAdmin,
  getUserPermissions,
  canAccessResource,
  type Permission,
  type User as RBACUser 
} from '@/lib/rbac'

export interface AuthUser extends RBACUser {
  name?: string | null
  email?: string | null
  image?: string | null
}

export function useAuth() {
  const { data: session, status } = useSession()
  
  // Convert session user to RBAC user format
  const user: AuthUser | null = session?.user ? {
    id: session.user.id || '',
    name: session.user.name,
    email: session.user.email,
    image: session.user.image,
    role: (session.user as any).role || UserRole.USER,
    permissions: (session.user as any).permissions || [],
    isActive: (session.user as any).isActive ?? true,
  } : null

  return {
    user,
    isLoading: status === 'loading',
    isAuthenticated: !!session,
    
    // Permission checking functions
    hasPermission: function(permission: Permission) {
      return user ? hasPermission(user, permission) : false
    },
    
    hasRoleLevel: function(minimumRole: UserRole) {
      return user ? hasRoleLevel(user, minimumRole) : false
    },
    
    isPremiumUser: function() {
      return user ? isPremiumUser(user) : false
    },
    
    isAdmin: function() {
      return user ? isAdmin(user) : false
    },
    
    isSuperAdmin: function() {
      return user ? isSuperAdmin(user) : false
    },
    
    canAccessResource: function(action: 'read' | 'write' | 'delete', resource: 'finance' | 'user' | 'analytics' | 'admin') {
      return user ? canAccessResource(user, action, resource) : false
    },
    
    getUserPermissions: function() {
      return user ? getUserPermissions(user) : []
    },
  }
}

// Hook for checking specific permissions with loading states
export function usePermission(permission: Permission) {
  const { hasPermission, isLoading } = useAuth()
  
  return {
    hasPermission: hasPermission(permission),
    isLoading,
  }
}

// Hook for checking role levels
export function useRole(minimumRole: UserRole) {
  const { hasRoleLevel, isLoading, user } = useAuth()
  
  return {
    hasRole: hasRoleLevel(minimumRole),
    currentRole: user?.role,
    isLoading,
  }
} 