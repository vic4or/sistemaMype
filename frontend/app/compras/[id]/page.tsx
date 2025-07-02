"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowLeft, Pencil } from "lucide-react"
import Link from "next/link"
import { getOrdenCompraById } from "@/services/api/ordenes-compra"
import { toast } from "sonner"
import { formatDate } from "@/lib/utils"
import type { OrdenCompra } from "@/types/ordenes-compra"

interface Props {
  params: {
    id: string
  }
}

export default function OrdenCompraPage({ params }: Props) {
  const [loading, setLoading] = useState(true)
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

  const getEstadoBadge = (estado: string) => {
    const estadoUpper = estado.toUpperCase()
    const estados: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", label: string, className: string } } = {
      "PENDIENTE": { variant: "secondary", label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      "APROBADA": { variant: "default", label: "Aprobada", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      "ENTREGADA": { variant: "outline", label: "Entregada", className: "bg-green-100 text-green-800 hover:bg-green-200" },
      "RECHAZADA": { variant: "destructive", label: "Rechazada", className: "bg-red-100 text-red-800 hover:bg-red-200" }
    }
    const estadoInfo = estados[estadoUpper] || { variant: "secondary", label: estadoUpper, className: "" }
    return <Badge variant={estadoInfo.variant} className={estadoInfo.className}>{estadoInfo.label}</Badge>
  }

  // formatDate viene de lib/utils

  const formatCurrency = (amount: string | number) => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (!numericAmount) return "S/ 0.00"
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2
    }).format(numericAmount)
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
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Orden #{orden.numero_oc}</h1>
            <p className="text-muted-foreground">
              Estado: {getEstadoBadge(orden.estado_oc)}
            </p>
          </div>
        </div>

        {orden.estado_oc.toUpperCase() !== "ENTREGADA" && orden.estado_oc.toUpperCase() !== "RECHAZADA" && (
          <Link href={`/compras/${params.id}/editar`}>
            <Button>
              <Pencil className="mr-2 h-4 w-4" />
              Editar Orden
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Información del Proveedor</CardTitle>
            <CardDescription>Datos del proveedor de la orden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Razón Social</span>
              <p className="font-medium">{orden.pro_proveedores.razon_social}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">RUC</span>
              <p className="font-medium">{orden.pro_proveedores.ruc}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Dirección</span>
              <p className="font-medium">{orden.pro_proveedores.direccion}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Teléfono</span>
              <p className="font-medium">{orden.pro_proveedores.telefono}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Email</span>
              <p className="font-medium">{orden.pro_proveedores.email}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Lead Time</span>
              <p className="font-medium">{orden.pro_proveedores.lead_time_dias} días</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detalles de la Orden</CardTitle>
            <CardDescription>Información general de la orden</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <span className="text-sm text-muted-foreground">Número OC</span>
              <p className="font-medium">{orden.numero_oc}</p>
            </div>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
              <p className="font-medium">{formatDate(orden.fecha_emision_oc)}</p>
            </div>
            <div>
              <span className="text-sm text-muted-foreground">Fecha Esperada</span>
              <p className="font-medium">{formatDate(orden.fecha_esperada)}</p>
            </div>
            {orden.nota && (
              <div>
                <span className="text-sm text-muted-foreground">Nota</span>
                <p className="font-medium">{orden.nota}</p>
              </div>
            )}
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
              {orden.cmp_ordenes_compra_det.map((item) => (
                <TableRow key={item.oc_detalle_id}>
                  <TableCell className="font-medium">
                    {item.mat_materiales.codigo_material}
                  </TableCell>
                  <TableCell>
                    {item.mat_materiales.descripcion_material}
                  </TableCell>
                  <TableCell className="text-center">{item.cantidad_pedida}</TableCell>
                  <TableCell className="text-center">{item.cantidad_recibida}</TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.precio_unitario)}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatCurrency(item.subtotal)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow>
                <TableCell colSpan={5} className="text-right font-bold">
                  Total
                </TableCell>
                <TableCell className="text-right font-bold">
                  {formatCurrency(orden.monto_total_oc)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 