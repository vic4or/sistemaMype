"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Clock, RefreshCw, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { pedidosApi } from "@/services/api/pedidos"
import type { Pedido } from "@/types/order"

export default function PedidosPendientes() {
  const router = useRouter()
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarPedidosPendientes = async () => {
      try {
        setLoading(true)
        const data = await pedidosApi.getAll()
        
        // Filtrar solo pedidos pendientes
        const pendientes = data.filter((p: Pedido) => p.estado_pedido === 'PENDIENTE')
        setPedidos(pendientes.slice(0, 5)) // Limitar a 5 para el dashboard
        
      } catch (error) {
        console.error('Error al cargar pedidos pendientes:', error)
        setError('No se pudieron cargar los pedidos')
      } finally {
        setLoading(false)
      }
    }

    cargarPedidosPendientes()
  }, [])

  const handleVerTodos = () => {
    router.push('/pedidos?estado=pendiente')
  }

  const formatearFecha = (fecha: string) => {
    return fecha.split('T')[0]
  }

  const getNombreCliente = (pedido: Pedido) => {
    return pedido.cli_clientes?.nombre || 'Cliente sin nombre'
  }

  const formatearMoneda = (valor?: number) => {
    return (valor || 0).toLocaleString()
  }

  const getCodigoPedido = (pedido: Pedido) => {
    return `PED-${pedido.pedido_cliente_id.toString().padStart(4, '0')}`
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pedidos Pendientes
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
            <Clock className="h-5 w-5" />
            Pedidos Pendientes
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
            <Clock className="h-5 w-5" />
            Pedidos Pendientes
          </CardTitle>
          <Badge variant="destructive" className="text-xs">
            {pedidos.length}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {pedidos.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-green-600 mb-1 text-sm">✅</div>
              <p className="text-xs text-muted-foreground">
                No hay pedidos pendientes
              </p>
            </div>
          ) : (
            <>
              {pedidos.map((pedido) => (
                <div key={pedido.pedido_cliente_id} className="flex items-center justify-between p-2 border rounded hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{getNombreCliente(pedido)}</p>
                    <p className="text-xs text-muted-foreground">
                      {getCodigoPedido(pedido)} • {formatearFecha(pedido.fecha_entrega)}
                    </p>
                  </div>
                  <div className="text-right ml-2">
                    <div className="text-xs font-medium">S/. {formatearMoneda(pedido.total)}</div>
                    <Badge className="text-xs bg-orange-50 text-orange-700 border-orange-200">
                      PENDIENTE
                    </Badge>
                  </div>
                </div>
              ))}
              
              <div className="pt-1 border-t mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleVerTodos}
                  className="w-full h-8 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Todos los Pendientes
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 