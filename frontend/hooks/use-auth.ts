"use client"

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { authService, LoginRequest, LoginResponse } from '@/services/api/auth'
import { useToast } from '@/hooks/use-toast'
import api from '@/lib/api'

// Definimos el tipo User basado en la respuesta de Login
type User = LoginResponse['user']

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const initializeAuth = useCallback(async () => {
    // El interceptor de Axios ya maneja el token, aquí solo recuperamos los datos del usuario
    const userStr = localStorage.getItem("user")
    if (userStr) {
      try {
        const userData: User = JSON.parse(userStr)
        setUser(userData)
        setIsAuthenticated(true)
      } catch (error) {
        // Limpiamos todo si hay un error al parsear
        localStorage.removeItem("token")
        localStorage.removeItem("refreshToken")
        localStorage.removeItem("user")
      }
    }
    setIsLoading(false)
  }, [])

  useEffect(() => {
    initializeAuth()
  }, [initializeAuth])

  const login = async (values: LoginRequest) => {
    setIsLoading(true)
    const response = await authService.login(values)

    if (response.success && response.data) {
      const { user, token, refreshToken } = response.data
      
      localStorage.setItem("token", token)
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken)
      localStorage.setItem("user", JSON.stringify(user))
      
      setUser(user)
      setIsAuthenticated(true)
      setIsLoading(false)

      toast({
        title: "¡Bienvenido!",
        description: `Hola ${user.nombre}, has accedido al sistema.`,
      })
      
      return response
    } else {
      setIsLoading(false)
      toast({
        title: "Error de autenticación",
        description: response.message,
        variant: "destructive",
      })
      throw new Error(response.message)
    }
  }

  const logout = useCallback(() => {
    authService.logout() // Llama a la API para invalidar el token en el backend
    localStorage.removeItem("token")
    localStorage.removeItem("refreshToken")
    localStorage.removeItem("user")
    setUser(null)
    setIsAuthenticated(false)
    router.push("/login")
  }, [router])

  const refreshAuth = useCallback(async () => {
    const refreshToken = localStorage.getItem('refreshToken')
    if (!refreshToken) {
      logout()
      return false
    }
    
    try {
      const response = await authService.refreshToken(refreshToken)
      if (response.success && response.data) {
        localStorage.setItem('token', response.data.token)
        return true
      } else {
        logout()
        return false
      }
    } catch (error) {
      console.error('Error refrescando token:', error)
      logout()
      return false
    }
  }, [logout])

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    refreshAuth,
  }
} 