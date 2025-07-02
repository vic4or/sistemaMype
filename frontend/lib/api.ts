import axios from 'axios'

// Configuración base de Axios
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
})

// Variable para evitar múltiples requests de refresh
let isRefreshing = false
let failedQueue: any[] = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

// Interceptor para requests (agregar token si existe)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para responses (manejo de errores globales y refresh token)
api.interceptors.response.use(
  response => response,
  error => {
    // Si el error tiene una respuesta del servidor
    if (error.response) {
      // Log del error para debugging
      console.error('Error de API:', {
        status: error.response.status,
        data: error.response.data,
        headers: error.response.headers,
        config: {
          url: error.config.url,
          method: error.config.method,
          baseURL: error.config.baseURL
        }
      })

      // Manejar errores específicos
      switch (error.response.status) {
        case 400:
          error.message = error.response.data.message || 'Datos inválidos'
          break
        case 401:
          error.message = 'No autorizado'
          // TODO: Redirigir al login o refrescar token
          break
        case 403:
          error.message = 'Acceso denegado'
          break
        case 404:
          error.message = error.response.data.message || 'Recurso no encontrado'
          break
        case 422:
          error.message = error.response.data.message || 'Error de validación'
          break
        case 500:
          error.message = 'Error interno del servidor'
          break
        default:
          error.message = 'Error desconocido'
      }
    } else if (error.request) {
      // La petición fue hecha pero no se recibió respuesta
      console.error('Error de red:', {
        request: {
          url: error.config?.url,
          method: error.config?.method,
          baseURL: error.config?.baseURL
        },
        message: error.message
      })
      error.message = 'Error de red - No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet y que el servidor esté en funcionamiento.'
    } else {
      // Algo sucedió al configurar la petición
      console.error('Error de configuración:', {
        error: error.message,
        config: error.config
      })
      error.message = 'Error al procesar la solicitud. Por favor, inténtalo de nuevo más tarde.'
    }

    return Promise.reject(error)
  }
)

export default api


// Placeholder para evitar errores de importación
//export default {}
