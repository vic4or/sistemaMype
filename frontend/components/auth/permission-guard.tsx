"use client"

import React from 'react'
import { useAuthContext } from '@/contexts/auth-context'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle } from 'lucide-react'

interface PermissionGuardProps {
  children: React.ReactNode
  permission: string
  fallback?: React.ReactNode
}

export default function PermissionGuard({ 
  children, 
  permission, 
  fallback 
}: PermissionGuardProps) {
  const { canAccess } = useAuthContext()

  if (!canAccess(permission)) {
    if (fallback) {
      return <>{fallback}</>
    }

    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Alert className="max-w-md">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos para acceder a esta sección.
          </AlertDescription>
        </Alert>
      </div>
    )
  }

  return <>{children}</>
} 