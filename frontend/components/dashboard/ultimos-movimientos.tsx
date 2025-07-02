"use client"

import { useState, useEffect } from "react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ArrowUp, ArrowDown, RefreshCw, Eye } from "lucide-react"
import { useRouter } from "next/navigation"

interface MovimientoInventario {
  movimiento_id: number
  tipo_movimiento: 'entrada' | 'salida'
  material_id?: number
  descripcion_material?: string
  codigo_material?: string
  cantidad: number
  unidad_medida?: string
  fecha_movimiento: string
  concepto?: string
  usuario_creacion?: string
  // Estructura alternativa si viene con relaciones
  mat_materiales?: {
    descripcion_material: string
    codigo_material: string
  }
  cfg_unidades_medida?: {
    abreviatura: string
  }
}

export default function UltimosMovimientos() {
  const router = useRouter()
  const [movimientos, setMovimientos] = useState<MovimientoInventario[]>([])
  const [totalMovimientos, setTotalMovimientos] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const cargarMovimientos = async () => {
      try {
        setLoading(true)
        const baseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
        const response = await fetch(`${baseURL}/movimientos`)
        
        if (!response.ok) {
          throw new Error('Error al cargar movimientos')
        }
        
        const data = await response.json()
        console.log('📊 [Dashboard] Estructura de movimientos:', data[0]) // Debug log
        // Guardar el total y limitar a los últimos 5 movimientos para el dashboard
        setTotalMovimientos(data.length)
        setMovimientos(data.slice(0, 5))
      } catch (error) {
        console.error('Error al cargar movimientos:', error)
        setError('No se pudieron cargar los movimientos')
      } finally {
        setLoading(false)
      }
    }

    cargarMovimientos()
  }, [])

  const handleVerTodos = () => {
    router.push('/inventario/movimientos')
  }

  const formatearFecha = (fechaString: string) => {
    const fechaFormateada = fechaString.split('T')[0]
    const hoy = new Date().toISOString().split('T')[0]
    
    if (fechaFormateada === hoy) {
      // Si es hoy, mostrar "Hoy" con la hora
      const fecha = new Date(fechaString)
      return `Hoy ${fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`
    } else {
      return fechaFormateada
    }
  }

  const getTipoIcon = (tipo: 'entrada' | 'salida') => {
    return tipo === 'entrada' ? (
      <ArrowUp className="h-3 w-3 text-green-600" />
    ) : (
      <ArrowDown className="h-3 w-3 text-red-600" />
    )
  }

  const getTipoBadge = (tipo: 'entrada' | 'salida') => {
    return tipo === 'entrada' ? (
      <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
        Entrada
      </Badge>
    ) : (
      <Badge variant="outline" className="text-xs bg-red-50 text-red-700 border-red-200">
        Salida
      </Badge>
    )
  }

  // Función helper para obtener datos del material de forma segura
  const getMaterialData = (movimiento: MovimientoInventario) => {
    return {
      descripcion: movimiento.mat_materiales?.descripcion_material || 
                   movimiento.descripcion_material || 
                   'Material sin descripción',
      codigo: movimiento.mat_materiales?.codigo_material || 
              movimiento.codigo_material || 
              'Sin código',
      unidad: movimiento.cfg_unidades_medida?.abreviatura || 
              movimiento.unidad_medida || 
              'ud'
    }
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowUpDown className="h-5 w-5" />
            Últimos Movimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-6">
            <RefreshCw className="h-4 w-4 animate-spin mr-2" />
            Cargando movimientos...
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
            <ArrowUpDown className="h-5 w-5" />
            Últimos Movimientos
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
            <ArrowUpDown className="h-5 w-5" />
            Últimos Movimientos
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            {totalMovimientos}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-2">
          {movimientos.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-xs text-muted-foreground">
                No hay movimientos registrados
              </p>
            </div>
          ) : (
            <>
              {movimientos.map((movimiento) => {
                const materialData = getMaterialData(movimiento)
                
                return (
                  <div key={movimiento.movimiento_id} className="flex items-start gap-2 p-2 border rounded hover:bg-muted/30 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      {getTipoIcon(movimiento.tipo_movimiento)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="text-sm font-medium truncate">{materialData.descripcion}</p>
                          <p className="text-xs text-muted-foreground">
                            {materialData.codigo} • {movimiento.concepto || 'Sin concepto'}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          {getTipoBadge(movimiento.tipo_movimiento)}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-1">
                        <div className="text-xs">
                          <span className="font-medium">{movimiento.cantidad}</span>
                          <span className="text-muted-foreground ml-1">{materialData.unidad}</span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatearFecha(movimiento.fecha_movimiento)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
              
              <div className="pt-1 border-t mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleVerTodos}
                  className="w-full h-8 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  Ver Todos los Movimientos
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 