"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Save, Plus, Ban } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { getOrdenCompraById, updateOrdenCompra, changeOrdenCompraStatus, ordenesCompraApi } from "@/services/api/ordenes-compra"
import type { OrdenCompra, UpdateOrdenCompraDto } from "@/types/ordenes-compra"

interface OperacionDetalle {
  tipo: 'crear' | 'actualizar' | 'eliminar'
  detalle_id?: number
  datos?: {
    material_id: number
    cantidad: string
    precio_unitario: string
  }
}

export default function EditarOrdenCompraPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [orden, setOrden] = useState<OrdenCompra | null>(null)

  useEffect(() => {
    const loadOrden = async () => {
      try {
        setLoading(true)
        const ordenData = await getOrdenCompraById(Number(params.id))
        setOrden(ordenData)
      } catch (error) {
        console.error("Error al cargar orden:", error)
        toast.error("Error al cargar los datos de la orden")
      } finally {
        setLoading(false)
      }
    }
    loadOrden()
  }, [params.id])

  const handleSave = async () => {
    if (!orden) return
    try {
      setSaving(true)
      
      console.log('=== INICIANDO ACTUALIZACIÓN GRANULAR DE ORDEN DE COMPRA ===')
      
      // PASO 1: Actualizar solo la cabecera de la orden (campos que pueden cambiar)
      const datosCabecera = {
        fecha_esperada: orden.fecha_esperada,
        nota: orden.nota,
        monto_total_oc: orden.monto_total_oc
      }

      console.log('1. Actualizando cabecera:', datosCabecera)
      await updateOrdenCompra(orden.orden_compra_id, datosCabecera)

      // PASO 2: Obtener la orden actualizada para obtener los detalles actuales
      console.log('2. Obteniendo detalles actuales para comparación...')
      const ordenActual = await getOrdenCompraById(orden.orden_compra_id)
      const detallesActuales = ordenActual.cmp_ordenes_compra_det
      const detallesNuevos = orden.cmp_ordenes_compra_det

      console.log('3. Detalles actuales en BD:', detallesActuales)
      console.log('4. Detalles nuevos del formulario:', detallesNuevos)

      // PASO 3: Comparar y determinar operaciones necesarias
      const operacionesDetalles: OperacionDetalle[] = []

      // Identificar detalles para actualizar (los que tienen oc_detalle_id)
      for (const detalleNuevo of detallesNuevos) {
        if (detalleNuevo.oc_detalle_id) {
          // Es un detalle existente, verificar si cambió
          const detalleActual = detallesActuales.find(d => d.oc_detalle_id === detalleNuevo.oc_detalle_id)
          
          if (detalleActual) {
            const cantidadCambio = detalleActual.cantidad_pedida !== detalleNuevo.cantidad_pedida
            const precioCambio = parseFloat(detalleActual.precio_unitario) !== parseFloat(detalleNuevo.precio_unitario)
            
            if (cantidadCambio || precioCambio) {
              console.log(`📝 Detalle ${detalleNuevo.oc_detalle_id} necesita actualización`)
              
              operacionesDetalles.push({
                tipo: 'actualizar',
                detalle_id: detalleNuevo.oc_detalle_id,
                datos: {
                  material_id: detalleNuevo.material_id,
                  cantidad: detalleNuevo.cantidad_pedida,
                  precio_unitario: detalleNuevo.precio_unitario
                }
              })
            }
          }
        } else {
          // Es un detalle nuevo (no tiene oc_detalle_id)
          console.log('➕ Nuevo detalle para crear:', detalleNuevo)
          
          operacionesDetalles.push({
            tipo: 'crear',
            datos: {
              material_id: detalleNuevo.material_id,
              cantidad: detalleNuevo.cantidad_pedida,
              precio_unitario: detalleNuevo.precio_unitario
            }
          })
        }
      }

      // Identificar detalles para eliminar (los que están en BD pero no en el formulario)
      for (const detalleActual of detallesActuales) {
        const existeEnFormulario = detallesNuevos.find(d => d.oc_detalle_id === detalleActual.oc_detalle_id)
        
        if (!existeEnFormulario) {
          console.log(`🗑️ Detalle ${detalleActual.oc_detalle_id} será eliminado`)
          
          operacionesDetalles.push({
            tipo: 'eliminar',
            detalle_id: detalleActual.oc_detalle_id
          })
        }
      }

      console.log('5. Operaciones de detalles a realizar:', operacionesDetalles)

      // PASO 4: Ejecutar todas las operaciones de detalles
      if (operacionesDetalles.length > 0) {
        const promesasDetalles = operacionesDetalles.map(async (operacion: OperacionDetalle) => {
          try {
            switch (operacion.tipo) {
              case 'crear':
                if (!operacion.datos) throw new Error('Datos requeridos para crear detalle')
                console.log('➕ Creando detalle:', operacion.datos)
                return await ordenesCompraApi.addDetalleByOrden(orden.orden_compra_id, operacion.datos)
                
              case 'actualizar':
                if (!operacion.detalle_id || !operacion.datos) {
                  throw new Error('ID de detalle y datos requeridos para actualizar')
                }
                console.log(`📝 Actualizando detalle ${operacion.detalle_id}:`, operacion.datos)
                return await ordenesCompraApi.updateDetalleByOrden(
                  orden.orden_compra_id, 
                  operacion.detalle_id, 
                  operacion.datos
                )
                
              case 'eliminar':
                if (!operacion.detalle_id) {
                  throw new Error('ID de detalle requerido para eliminar')
                }
                console.log(`🗑️ Eliminando detalle ${operacion.detalle_id}`)
                return await ordenesCompraApi.deleteDetalleByOrden(orden.orden_compra_id, operacion.detalle_id)
                
              default:
                throw new Error(`Tipo de operación desconocido: ${operacion.tipo}`)
            }
          } catch (error) {
            console.error(`Error en operación ${operacion.tipo}:`, error)
            throw error
          }
        })

        console.log('6. Ejecutando operaciones de detalles en paralelo...')
        await Promise.all(promesasDetalles)
      } else {
        console.log('ℹ️ No hay cambios en detalles que procesar')
      }
      
      console.log('=== ✅ Actualización granular completada con éxito ===')
      toast.success("Orden de compra actualizada correctamente")
      router.push("/compras")
      
    } catch (error: any) {
      console.error('💥 Error en actualización granular:', error)
      const errorMessage = error.message || "Error al actualizar la orden de compra"
      toast.error(errorMessage)
    } finally {
      setSaving(false)
    }
  }

  const handleAnular = async () => {
    if (!orden) return
    try {
      setSaving(true)
      await changeOrdenCompraStatus(orden.orden_compra_id, "ANULADO")
      toast.success("Orden anulada correctamente")
      router.push("/compras")
    } catch (error) {
      console.error("Error al anular orden:", error)
      toast.error("Error al anular la orden")
    } finally {
      setSaving(false)
    }
  }

  const updateCantidad = (index: number, cantidad: string) => {
    if (!orden) return
    const newDetalles = [...orden.cmp_ordenes_compra_det]
    newDetalles[index] = {
      ...newDetalles[index],
      cantidad_pedida: cantidad,
      subtotal: (parseFloat(cantidad) * parseFloat(newDetalles[index].precio_unitario)).toString()
    }

    // Recalcular total
    const nuevoTotal = newDetalles.reduce((acc, item) => {
      return acc + parseFloat(item.subtotal)
    }, 0)

    setOrden({
      ...orden,
      cmp_ordenes_compra_det: newDetalles,
      monto_total_oc: nuevoTotal.toString()
    })
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!orden) {
    return <div>Orden no encontrada</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/compras">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">Editar Orden #{orden.numero_oc}</h1>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleAnular} variant="destructive" disabled={saving}>
            <Ban className="mr-2 h-4 w-4" />
            Anular Orden
          </Button>
                     <Button onClick={handleSave} disabled={saving}>
             <Save className="mr-2 h-4 w-4" />
             Guardar Cambios
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Proveedor</CardTitle>
            <CardDescription>Datos del proveedor de la orden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <Label>Razón Social</Label>
              <p className="font-medium">{orden.pro_proveedores.razon_social}</p>
            </div>
            <div>
              <Label>RUC</Label>
              <p className="font-medium">{orden.pro_proveedores.ruc}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Orden</CardTitle>
            <CardDescription>Información general de la orden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Número OC</Label>
              <p className="font-medium">{orden.numero_oc}</p>
            </div>
            <div>
              <Label>Fecha de Emisión</Label>
              <p className="font-medium">{orden.fecha_emision_oc.split('T')[0]}</p>
            </div>
            <div>
              <Label>Fecha Esperada</Label>
              <p className="font-medium">{orden.fecha_esperada.split('T')[0]}</p>
            </div>
            <div>
              <Label>Nota</Label>
              <p className="font-medium">{orden.nota || "-"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Items</CardTitle>
          <CardDescription>Materiales incluidos en la orden</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center">Cantidad</TableHead>
                <TableHead className="text-center">Recibido</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orden.cmp_ordenes_compra_det.map((item, index) => (
                <TableRow key={item.oc_detalle_id}>
                  <TableCell className="font-medium">
                    {item.mat_materiales.codigo_material}
                  </TableCell>
                  <TableCell>
                    {item.mat_materiales.descripcion_material}
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={item.cantidad_pedida}
                      onChange={(e) => updateCantidad(index, e.target.value)}
                      className="w-24 text-center mx-auto"
                    />
                  </TableCell>
                  <TableCell className="text-center">
                    {item.cantidad_recibida || "0"}
                  </TableCell>
                  <TableCell className="text-right">
                    S/ {parseFloat(item.precio_unitario).toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right">
                    S/ {parseFloat(item.subtotal).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  S/ {parseFloat(orden.monto_total_oc).toFixed(2)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
