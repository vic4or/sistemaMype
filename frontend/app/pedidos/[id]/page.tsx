"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, PenSquare, Pencil } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { pedidosApi } from "@/services/api/pedidos"
import { clientesApi } from "@/services/api/clientes"
import { productosApi } from "@/services/api/productos"
import { coloresApi, tallasApi } from "@/services/api/configuracion"
import { StatusBadge } from "@/components/ui/status-badge"
import type { Pedido, PedidoDetalle } from "@/types/order"
import type { Cliente, Color, Talla } from "@/types/api"
import type { Product } from "@/types/product"
import { parseISO, format } from "date-fns"
import { es } from "date-fns/locale"
import { toast } from "sonner"

interface Props {
  params: {
    id: string
  }
}

export default function PedidoPage({ params }: Props) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [pedido, setPedido] = useState<Pedido | null>(null)
  const [colores, setColores] = useState<Color[]>([])
  const [tallas, setTallas] = useState<Talla[]>([])

  useEffect(() => {
    const loadPedido = async () => {
      try {
        setLoading(true)
        const [pedidoData, coloresData, tallasData] = await Promise.all([
          pedidosApi.getById(Number(params.id)),
          coloresApi.getAll(),
          tallasApi.getAll()
        ])
        
        setPedido(pedidoData)
        setColores(coloresData)
        setTallas(tallasData)
      } catch (error) {
        console.error("Error al cargar pedido:", error)
        toast.error("Error al cargar los datos del pedido")
      } finally {
        setLoading(false)
      }
    }
    loadPedido()
  }, [params.id])

  const getEstadoBadge = (estado: string) => {
    const estadoUpper = estado.toUpperCase()
    const estados: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", label: string, className: string } } = {
      "PENDIENTE": { variant: "secondary", label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      "EN_PROCESO": { variant: "default", label: "En Proceso", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      "COMPLETADO": { variant: "outline", label: "Completado", className: "bg-green-100 text-green-800 hover:bg-green-200" },
      "ANULADO": { variant: "destructive", label: "Anulado", className: "bg-red-100 text-red-800 hover:bg-red-200" }
    }
    const estadoInfo = estados[estadoUpper] || { variant: "secondary", label: estadoUpper, className: "" }
    return <Badge variant={estadoInfo.variant} className={estadoInfo.className}>{estadoInfo.label}</Badge>
  }

  const formatTotal = (total: any): string => {
    const totalNumerico = typeof total === 'string' ? parseFloat(total) : Number(total)
    return isNaN(totalNumerico) ? "0.00" : totalNumerico.toFixed(2)
  }

  const formatFecha = (fecha: string) => {
    try {
      return format(parseISO(fecha), "dd/MM/yyyy", { locale: es })
    } catch (error) {
      console.error("Error al formatear fecha:", error)
      return "Fecha inválida"
    }
  }

  const formatPrecio = (precio: string | number | undefined): string => {
    if (precio === undefined || precio === null) return "0.00"
    const precioNum = typeof precio === 'string' ? parseFloat(precio) : precio
    return precioNum.toFixed(2)
  }

  if (loading) {
    return <div>Cargando...</div>
  }

  if (!pedido) {
    return <div>Pedido no encontrado</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/pedidos">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Pedido #{params.id}</h1>
            <p className="text-muted-foreground">
              Estado: {getEstadoBadge(pedido.estado_pedido)}
            </p>
          </div>
        </div>

        {pedido.estado_pedido.toUpperCase() !== "COMPLETADO" && pedido.estado_pedido.toUpperCase() !== "ANULADO" && (
          <Link href={`/pedidos/${params.id}/editar`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Editar Pedido
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Cliente</CardTitle>
            <CardDescription>Datos del cliente que realizó el pedido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Nombre</span>
              <p className="font-medium">{pedido.cli_clientes?.nombre}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">RUC</span>
              <p className="font-medium">{pedido.cli_clientes?.ruc}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Teléfono</span>
              <p className="font-medium">{pedido.cli_clientes?.telefono}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email</span>
              <p className="font-medium">{pedido.cli_clientes?.email}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles del Pedido</CardTitle>
            <CardDescription>Información general del pedido</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Producto</span>
              <p className="font-medium">{pedido.prd_productos?.nombre}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Código</span>
              <p className="font-medium">{pedido.prd_productos?.codigo}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Fecha del Pedido</p>
              <p className="font-medium">{pedido.fecha_pedido.split('T')[0]}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Fecha de Entrega</span>
              <p className="font-medium">{pedido.fecha_entrega.split('T')[0]}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Dirección de Envío</span>
              <p className="font-medium">{pedido.direccion_envio}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detalle de Cantidades</CardTitle>
          <CardDescription>Cantidades por color y talla</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Color</TableHead>
                <TableHead>Talla</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="text-right">Cantidad</TableHead>
                <TableHead className="text-right">Precio Unit.</TableHead>
                <TableHead className="text-right">Subtotal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pedido.ped_pedidos_cliente_det?.map((detalle) => (
                <TableRow key={detalle.ped_cliente_det_id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded border"
                        style={{ backgroundColor: detalle.prd_producto_talla_color?.cfg_colores?.codigo_color }}
                      />
                      {detalle.prd_producto_talla_color?.cfg_colores?.nombre_color || "Color no encontrado"}
                    </div>
                  </TableCell>
                  <TableCell>
                    {detalle.prd_producto_talla_color?.cfg_tallas?.valor_talla || "Talla no encontrada"}
                  </TableCell>
                  <TableCell>
                    {detalle.prd_producto_talla_color?.codigo || "Código no encontrado"}
                  </TableCell>
                  <TableCell className="text-right">{detalle.cantidad_solicitada}</TableCell>
                  <TableCell className="text-right">S/ {formatPrecio(detalle.precio)}</TableCell>
                  <TableCell className="text-right">S/ {formatPrecio(detalle.subtotal)}</TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  S/ {formatPrecio(pedido.total)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 