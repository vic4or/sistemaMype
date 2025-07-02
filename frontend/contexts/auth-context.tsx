"use client"

import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth } from '@/hooks/use-auth'

export type UserRole = 'administrador' | 'almacen'

interface AuthContextType {
  user: any
  isAuthenticated: boolean
  isLoading: boolean
  hasRole: (role: UserRole) => boolean
  hasAnyRole: (roles: UserRole[]) => boolean
  canAccess: (permission: string) => boolean
  login: (credentials: any) => Promise<any>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Permisos por rol
const rolePermissions: Record<UserRole, string[]> = {
  administrador: ['*'], // Acceso total
  almacen: [
    'dashboard:view',
    'inventario:view',
    'inventario:create', 
    'inventario:edit',
    'movimientos:view',
    'compras:view',
    'proveedores:view',
    'tizados:view',
    'tizados:create',
    'tizados:edit'
  ],
}

// Helper para normalizar strings (quitar acentos y a minúsculas)
const normalizeString = (str: string | undefined | null): string => {
  if (!str) return ''
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const auth = useAuth()

  const hasRole = (role: UserRole): boolean => {
    const userRole = normalizeString(auth.user?.rol)
    return userRole === role
  }

  const hasAnyRole = (roles: UserRole[]): boolean => {
    const userRole = normalizeString(auth.user?.rol)
    return roles.includes(userRole as UserRole)
  }

  const canAccess = (permission: string): boolean => {
    if (!auth.user?.rol) return false
    
    const userRole = normalizeString(auth.user.rol) as UserRole
    const permissions = rolePermissions[userRole] || []
    
    if (permissions.includes('*')) return true
    
    return permissions.includes(permission)
  }

  const value: AuthContextType = {
    ...auth,
    hasRole,
    hasAnyRole,
    canAccess,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuthContext = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuthContext debe ser usado dentro de un AuthProvider')
  }
  return context
} 