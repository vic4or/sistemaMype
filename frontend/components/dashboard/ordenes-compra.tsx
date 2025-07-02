"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ShoppingBag, RefreshCw, Eye } from "lucide-react"
import { useRouter } from "next/navigation"
import { ordenesCompraApi } from "@/services/api/ordenes-compra"
import type { OrdenCompra } from "@/types/ordenes-compra"

export default function OrdenesCompra() {
  const router = useRouter()
  const [ordenes, setOrdenes] = useState<OrdenCompra[]>([])
  const [totalOrdenes, setTotalOrdenes] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarOrdenes = async () => {
      try {
        setLoading(true)
        const data = await ordenesCompraApi.getAll()
        console.log('📊 [Dashboard] Estructura de órdenes:', data[0]) // Debug log
        // Guardar el total y limitar a las últimas 5 órdenes para el dashboard
        setTotalOrdenes(data.length)
        setOrdenes(data.slice(0, 5))
      } catch (error) {
        console.error('Error al cargar órdenes:', error)
        setError('No se pudieron cargar las órdenes de compra')
      } finally {
        setLoading(false)
      }
    }

    cargarOrdenes()
  }, [])

  const handleVerTodas = () => {
    router.push('/compras')
  }

  const formatearFecha = (fechaString: string) => {
    const fechaFormateada = fechaString.split('T')[0]
    const hoy = new Date().toISOString().split('T')[0]
    
    if (fechaFormateada === hoy) {
      // Si es hoy, mostrar "Hoy"
      return `Hoy`
    } else {
      return fechaFormateada
    }
  }

  // Mapear estados para mostrar (igual que en el módulo principal)
  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      PENDIENTE: "bg-yellow-100 text-yellow-800 border-yellow-200",
      APROBADA: "bg-green-100 text-green-800 border-green-200", 
      ENTREGADA: "bg-green-100 text-green-900 border-green-300",
      COMPLETADA: "bg-blue-100 text-blue-800 border-blue-200",
      RECHAZADA: "bg-red-100 text-red-800 border-red-200"
    }
    return colors[status] || "bg-gray-100 text-gray-800 border-gray-200"
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      PENDIENTE: "Pendiente",
      APROBADA: "Aprobada",
      ENTREGADA: "Entregada", 
      COMPLETADA: "Completada",
      RECHAZADA: "Rechazada"
    }
    return texts[status] || status
  }

  // Función helper para formatear moneda
  const formatearMoneda = (monto: string | number) => {
    const montoNum = typeof monto === 'string' ? parseFloat(monto) : monto
    return montoNum.toLocaleString('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Últimas Órdenes de Compra
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Cargando órdenes...
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
            <ShoppingBag className="h-5 w-5" />
            Últimas Órdenes de Compra
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
            <ShoppingBag className="h-5 w-5" />
            Últimas Órdenes de Compra
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalOrdenes}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {ordenes.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">
                No hay órdenes de compra registradas
              </p>
            </div>
          ) : (
            <>
              {ordenes.map((orden) => (
                <div key={orden.orden_compra_id} className="flex items-start gap-2 p-2 border rounded hover:bg-muted/30 transition-colors">
                  <div className="flex-shrink-0 mt-0.5">
                    <ShoppingBag className="h-3 w-3 text-blue-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium truncate">{orden.pro_proveedores.razon_social}</p>
                        <p className="text-xs text-muted-foreground">
                          {orden.numero_oc} • {orden.cmp_ordenes_compra_det.length} materiales
                        </p>
                      </div>
                      <div className="text-right ml-2">
                        <Badge className={`text-xs ${getStatusColor(orden.estado_oc)}`}>
                          {getStatusText(orden.estado_oc)}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <div className="text-xs">
                        <span className="font-medium">S/ {formatearMoneda(orden.monto_total_oc)}</span>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {formatearFecha(orden.fecha_esperada)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              
              <div className="pt-1 border-t mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleVerTodas}
                  className="w-full h-8 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Todas las Órdenes
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 