"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingCart, Clock, CheckCircle, AlertCircle, RefreshCw, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface Pedido {
  pedido_id: number
  codigo_pedido: string
  cliente: {
    nombre_cliente?: string
    razon_social?: string
  }
  estado_pedido: string
  total_pedido?: number
  fecha_entrega: string
  fecha_creacion: string
}

interface EstadoPedido {
  estado: string
  cantidad: number
  valor: number
  icon: React.ReactNode
}

export default function PedidosPorEstado() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [estadisticas, setEstadisticas] = useState<EstadoPedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarPedidos = async () => {
      try {
        setLoading(true)
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
        const response = await fetch(`${baseURL}/pedidos`)
        
        if (!response.ok) {
          throw new Error('Error al cargar pedidos')
        }
        
        const data = await response.json()
        console.log('📊 [Dashboard] Estructura de pedidos:', data[0]) // Debug log
        setPedidos(data.slice(0, 10)) // Limitar para el dashboard
        
        // Calcular estadísticas por estado
        const estadosPosibles = ['pendiente', 'en_proceso', 'completado', 'atrasado']
        const estadisticasCalculadas: EstadoPedido[] = []
        
        estadosPosibles.forEach(estado => {
          const pedidosDelEstado = data.filter((p: Pedido) => p.estado_pedido === estado)
          if (pedidosDelEstado.length > 0) {
            estadisticasCalculadas.push({
              estado: formatearEstado(estado),
              cantidad: pedidosDelEstado.length,
              valor: pedidosDelEstado.reduce((sum: number, p: Pedido) => sum + (p.total_pedido || 0), 0),
              icon: getIconoEstado(estado)
            })
          }
        })
        
        setEstadisticas(estadisticasCalculadas)
        
      } catch (error) {
        console.error('Error al cargar pedidos:', error)
        setError('No se pudieron cargar los pedidos')
      } finally {
        setLoading(false)
      }
    }

    cargarPedidos()
  }, [])

  const formatearEstado = (estado: string) => {
    const estados: Record<string, string> = {
      pendiente: 'Pendiente',
      en_proceso: 'En Proceso',
      completado: 'Completado',
      atrasado: 'Atrasado'
    }
    return estados[estado] || estado
  }

  const getIconoEstado = (estado: string) => {
    switch (estado) {
      case 'pendiente': return <Clock className="h-4 w-4" />
      case 'en_proceso': return <RefreshCw className="h-4 w-4" />
      case 'completado': return <CheckCircle className="h-4 w-4" />
      case 'atrasado': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleVerTodos = () => {
    router.push('/pedidos')
  }

  const handleVerPorEstado = (estado: string) => {
    router.push(`/pedidos?estado=${encodeURIComponent(estado.toLowerCase())}`)
  }

  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente': return 'bg-orange-50 text-orange-700 border-orange-200'
      case 'en proceso': return 'bg-blue-50 text-blue-700 border-blue-200'
      case 'completado': return 'bg-green-50 text-green-700 border-green-200'
      case 'atrasado': return 'bg-red-50 text-red-700 border-red-200'
      default: return 'bg-gray-50 text-gray-700 border-gray-200'
    }
  }

  const formatearFecha = (fecha: string) => {
    return fecha.split('T')[0]
  }

  const getNombreCliente = (cliente: any) => {
    return cliente?.nombre_cliente || cliente?.razon_social || 'Cliente sin nombre'
  }

  const formatearMoneda = (valor?: number) => {
    return (valor || 0).toLocaleString()
  }

  const totalPedidos = estadisticas.reduce((sum, est) => sum + est.cantidad, 0)
  const totalValor = estadisticas.reduce((sum, est) => sum + est.valor, 0)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pedidos por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Cargando pedidos...
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pedidos por Estado
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-6 text-destructive">{error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Pedidos por Estado
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalPedidos} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Resumen por estado */}
          {estadisticas.length > 0 && (
            <div className="grid grid-cols-2 gap-2">
              {estadisticas.map((estado) => (
                <div
                  key={estado.estado}
                  className="p-3 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer"
                  onClick={() => handleVerPorEstado(estado.estado)}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {estado.icon}
                      <span className="text-sm font-medium">{estado.estado}</span>
                    </div>
                    <Badge className={`text-xs ${getEstadoColor(estado.estado)}`}>
                      {estado.cantidad}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    S/. {formatearMoneda(estado.valor)}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pedidos recientes destacados */}
          {pedidos.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-muted-foreground">Recientes</h4>
              {pedidos.slice(0, 3).map((pedido) => (
                <div key={pedido.pedido_id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{getNombreCliente(pedido.cliente)}</p>
                    <p className="text-xs text-muted-foreground">
                      {pedido.codigo_pedido} • Entrega: {formatearFecha(pedido.fecha_entrega)}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-sm font-medium">S/. {formatearMoneda(pedido.total_pedido)}</div>
                    <Badge className={`text-xs ${getEstadoColor(formatearEstado(pedido.estado_pedido))}`}>
                      {formatearEstado(pedido.estado_pedido)}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resumen total */}
          <div className="pt-2 border-t">
            {totalPedidos > 0 ? (
              <div className="flex justify-between items-center mb-3">
                <div className="text-sm">
                  <span className="font-medium">{totalPedidos}</span>
                  <span className="text-muted-foreground ml-1">pedidos activos</span>
                </div>
                <div className="text-sm font-medium">
                  S/. {formatearMoneda(totalValor)}
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No hay pedidos registrados</p>
              </div>
            )}
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleVerTodos}
              className="w-full"
            >
              <Eye className="h-4 w-4 mr-2" />
              Ver Todos los Pedidos
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 