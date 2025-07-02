"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save } from "lucide-react"
import { pedidosApi } from "@/services/api/pedidos"
import { productosApi } from "@/services/api/productos"
import type { Pedido } from "@/types/order"
import type { ProductoTallaColor } from "@/types/product"
import { toast } from "sonner"

export default function NuevoDetallePage() {
  const params = useParams()
  const router = useRouter()
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [combinaciones, setCombinaciones] = useState<ProductoTallaColor[]>([])
  const [loading, setLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    producto_tal_col_id: "",
    cantidad_solicitada: "",
  })

  useEffect(() => {
    if (params.id) {
      loadData()
    }
  }, [params.id])

  const loadData = async () => {
    try {
      setLoading(true)
      const pedidoData = await pedidosApi.getById(Number(params.id))
      setPedido(pedidoData)

      // Cargar las combinaciones disponibles del producto
      if (pedidoData.producto_id) {
        const combinacionesData = await productosApi.getCombinaciones(pedidoData.producto_id)
        setCombinaciones(combinacionesData)
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!formData.producto_tal_col_id || !formData.cantidad_solicitada) {
      toast.error("Por favor complete todos los campos")
      return
    }

    setIsSubmitting(true)
    try {
      await pedidosApi.addDetalle(Number(params.id), {
        producto_tal_col_id: Number(formData.producto_tal_col_id),
        cantidad_solicitada: Number(formData.cantidad_solicitada),
      })
      toast.success("Detalle agregado correctamente")
      router.push(`/pedidos/${params.id}`)
    } catch (error) {
      console.error("Error al guardar:", error)
      toast.error("Error al guardar el detalle")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Cargando datos...</p>
        </div>
      </div>
    )
  }

  if (!pedido) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">Pedido no encontrado</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push("/pedidos")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Pedidos
          </Button>
        </div>
      </div>
    )
  }

  if (pedido.estado_pedido === "COMPLETADO" || pedido.estado_pedido === "ANULADO") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground">No se puede modificar un pedido {pedido.estado_pedido.toLowerCase()}</p>
          <Button variant="outline" className="mt-4" onClick={() => router.push(`/pedidos/${pedido.pedido_cliente_id}`)}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver al Detalle
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={() => router.push(`/pedidos/${params.id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Agregar Detalle al Pedido #{params.id}</h1>
          <p className="text-muted-foreground">Agrega un nuevo detalle al pedido existente</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nuevo Detalle</CardTitle>
          <CardDescription>Seleccione la combinación y la cantidad</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="combinacion">Combinación *</Label>
              <Select
                value={formData.producto_tal_col_id}
                onValueChange={(value) => setFormData((prev) => ({ ...prev, producto_tal_col_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar combinación" />
                </SelectTrigger>
                <SelectContent>
                  {combinaciones.map((combinacion) => (
                    <SelectItem
                      key={combinacion.producto_tal_col_id}
                      value={combinacion.producto_tal_col_id.toString()}
                    >
                      {combinacion.codigo} - {combinacion.cfg_colores?.nombre_color} - {combinacion.cfg_tallas?.valor_talla}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="cantidad">Cantidad *</Label>
              <Input
                id="cantidad"
                type="number"
                min="1"
                placeholder="Ingrese la cantidad"
                value={formData.cantidad_solicitada}
                onChange={(e) => setFormData((prev) => ({ ...prev, cantidad_solicitada: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
              <Save className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 