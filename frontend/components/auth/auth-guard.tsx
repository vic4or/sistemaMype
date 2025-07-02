"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import { Loader2, Building2 } from "lucide-react"
import { useAuthContext } from "@/contexts/auth-context"

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading, user } = useAuthContext()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated && user) {
        // Si está en login y ya está autenticado, redirigir al dashboard
        if (pathname === "/login") {
          router.replace("/")
        }
      } else {
        // Si no está autenticado y no está en login, redirigir a login
        if (pathname !== "/login") {
          router.replace("/login")
        }
      }
    }
  }, [isAuthenticated, isLoading, user, pathname, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
              <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600 dark:text-gray-400 font-medium">ConfecMRP</p>
          <p className="text-sm text-gray-500 dark:text-gray-500">Verificando autenticación...</p>
        </div>
      </div>
    )
  }

  // Si está en la página de login, pero ya está autenticado, no mostrar nada
  // mientras el useEffect redirige.
  if (pathname === "/login" && isAuthenticated) {
    return null
  }
  
  // Si no está autenticado y no está en la página de login, no mostrar nada
  // mientras el useEffect redirige.
  if (!isAuthenticated && pathname !== "/login") {
    return null
  }

  return <>{children}</>
}
