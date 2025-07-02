import api from '@/lib/api'

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: {
    id: number
    email: string
    nombre: string
    rol: string
    iniciales: string
  }
  token: string
  refreshToken?: string
}

export interface ApiResponse<T> {
  success: boolean
  data: T | null
  message: string
}

export const authService = {
  async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    try {
      const response = await api.post('/auth/login', credentials)
      return {
        success: true,
        data: response.data,
        message: 'Login exitoso'
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Error en el login'
      }
    }
  },

  async logout(): Promise<ApiResponse<null>> {
    try {
      await api.post('/auth/logout')
      return {
        success: true,
        data: null,
        message: 'Logout exitoso'
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Error en el logout'
      }
    }
  },

  async refreshToken(refreshToken: string): Promise<ApiResponse<{ token: string }>> {
    try {
      const response = await api.post('/auth/refresh', { refreshToken })
      return {
        success: true,
        data: response.data,
        message: 'Token refrescado exitosamente'
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Error al refrescar token'
      }
    }
  },

  async getProfile(): Promise<ApiResponse<LoginResponse['user']>> {
    try {
      const response = await api.get('/auth/profile')
      return {
        success: true,
        data: response.data,
        message: 'Perfil obtenido exitosamente'
      }
    } catch (error: any) {
      return {
        success: false,
        data: null,
        message: error.response?.data?.message || 'Error al obtener perfil'
      }
    }
  }
} 