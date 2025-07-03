"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileDown, Eye, Edit, Trash2, Download, Loader2, RefreshCw, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import NuevaOrdenForm from "@/components/forms/nueva-orden-form"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination"
import { useOrdenesCompra } from "@/hooks/use-ordenes-compra"
import type { OrdenCompra } from "@/types/ordenes-compra"
import { useRouter } from "next/navigation"
import { formatDate } from "@/lib/utils"
import { useAuthContext } from "@/contexts/auth-context"

export default function ComprasPage() {
  const router = useRouter()
  const {
    ordenes,
    proveedores,
    loading,
    error,
    deleting,
    filters,
    updateFilters,
    deleteOrden,
    downloadPDF,
    refresh: refreshOrdenes,
  } = useOrdenesCompra()

  const [orderToDelete, setOrderToDelete] = useState<OrdenCompra | null>(null)
  const [detalleOrdenOpen, setDetalleOrdenOpen] = useState(false)
  const [ordenSeleccionada, setOrdenSeleccionada] = useState<OrdenCompra | null>(null)
  const [nuevaOrdenOpen, setNuevaOrdenOpen] = useState(false)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Autenticación y permisos
  const { hasRole } = useAuthContext()
  const isAlmacen = hasRole('almacen')

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    if (!amount) return "S/ 0.00"
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2
    }).format(amount)
  }

  const getEstadoBadge = (estado: string) => {
    const estadoUpper = estado.toUpperCase()
    
    // Caso especial para COMPLETADO - usar estilos inline para forzar el color verde
    if (estadoUpper === "COMPLETADO") {
      return (
        <div 
          className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
          style={{
            backgroundColor: '#dcfce7', // bg-green-100
            color: '#166534', // text-green-800
            borderColor: '#bbf7d0' // border-green-200
          }}
        >
          Completado
        </div>
      )
    }
    
    const estados: { [key: string]: { variant: "default" | "secondary" | "destructive" | "outline", label: string, className: string } } = {
      "PENDIENTE": { variant: "secondary", label: "Pendiente", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-200" },
      "APROBADA": { variant: "default", label: "Aprobada", className: "bg-blue-100 text-blue-800 hover:bg-blue-200" },
      "ENTREGADA": { variant: "secondary", label: "Entregada", className: "bg-indigo-100 text-indigo-800 hover:bg-indigo-200" },
      "RECHAZADA": { variant: "destructive", label: "Rechazada", className: "bg-red-100 text-red-800 hover:bg-red-200" }
    }
    const estadoInfo = estados[estadoUpper] || { variant: "secondary", label: estadoUpper, className: "" }
    return <Badge variant={estadoInfo.variant} className={estadoInfo.className}>{estadoInfo.label}</Badge>
  }

  const handleView = (order: OrdenCompra) => {
    setOrdenSeleccionada(order)
    setDetalleOrdenOpen(true)
  }

  const handleEdit = (id: number) => {
    window.location.href = `/compras/${id}/editar`
  }

  const handleDelete = async () => {
    if (orderToDelete) {
      try {
        await deleteOrden(orderToDelete.orden_compra_id)
        setOrderToDelete(null)
      } catch (error) {
        // Error ya manejado en el hook
      }
    }
  }

  const handleDownloadOC = async (orden: OrdenCompra) => {
    try {
      await downloadPDF(orden.orden_compra_id, orden.numero_oc)
    } catch (error) {
      console.error('Error al descargar OC:', error)
    }
  }

  const handleSearch = (value: string) => {
    updateFilters({ search: value })
  }

  const handleStatusFilter = (value: string) => {
    updateFilters({ estado: value })
  }

  const handleProveedorFilter = (value: string) => {
    const proveedor_id = value === "todos" ? undefined : parseInt(value)
    updateFilters({ proveedor_id })
  }

  const handleExport = async () => {
    // TODO: Implementar exportación
    console.log("Exportar órdenes de compra")
  }

  const handleNuevaOrdenSuccess = () => {
    setNuevaOrdenOpen(false)
    refreshOrdenes()
  }

  // Paginación - usar ordenes filtradas directamente del hook
  const totalPages = Math.ceil(ordenes.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOrdenes = ordenes.slice(startIndex, endIndex)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [filters.search, filters.estado, filters.proveedor_id])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Órdenes de Compra</h1>
        {!isAlmacen && (
          <Button onClick={() => setNuevaOrdenOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Orden
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Órdenes de Compra</CardTitle>
          <CardDescription>
            Mostrando {startIndex + 1}-{Math.min(endIndex, ordenes.length)} de {ordenes.length} órdenes de compra
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código o proveedor..."
                className="pl-8"
                value={filters.search}
                onChange={e => handleSearch(e.target.value)}
              />
            </div>
            <Select value={filters.estado} onValueChange={handleStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                <SelectItem value="APROBADA">Aprobada</SelectItem>
                <SelectItem value="ENTREGADA">Entregada</SelectItem>
                <SelectItem value="COMPLETADO">Completado</SelectItem>
                <SelectItem value="RECHAZADA">Rechazada</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.proveedor_id?.toString() || "todos"} onValueChange={handleProveedorFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por proveedor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los proveedores</SelectItem>
                {proveedores.map(proveedor => (
                  <SelectItem key={proveedor.proveedor_id} value={proveedor.proveedor_id.toString()}>
                    {proveedor.razon_social}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Fecha Entrega</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                  </TableCell>
                </TableRow>
              ) : ordenes.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">No hay órdenes de compra</TableCell>
                </TableRow>
              ) : (
                paginatedOrdenes.map((orden) => (
                  <TableRow key={orden.orden_compra_id}>
                    <TableCell className="font-medium">{orden.numero_oc}</TableCell>
                    <TableCell>{orden.pro_proveedores.razon_social}</TableCell>
                    <TableCell>{formatDate(orden.fecha_emision_oc)}</TableCell>
                    <TableCell>{formatDate(orden.fecha_esperada)}</TableCell>
                    <TableCell>{formatCurrency(parseFloat(orden.monto_total_oc))}</TableCell>
                    <TableCell>{getEstadoBadge(orden.estado_oc)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleView(orden)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                                        {!isAlmacen && (
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(orden.orden_compra_id)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                )}
                                                  {!isAlmacen && (
                            <Button variant="ghost" size="icon" onClick={() => handleDownloadOC(orden)}>
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setOrderToDelete(orden)}
                          disabled={orden.estado_oc !== "PENDIENTE"}
                          className={
                            orden.estado_oc === "PENDIENTE" 
                              ? "text-destructive hover:text-destructive" 
                              : "opacity-0 pointer-events-none"
                          }
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, ordenes.length)} de {ordenes.length} órdenes de compra
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para ver detalle de orden */}
      <Dialog open={detalleOrdenOpen} onOpenChange={setDetalleOrdenOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Detalle de Orden de Compra</span>
              {!isAlmacen && ordenSeleccionada && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownloadOC(ordenSeleccionada)}
                  className="ml-4"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Descargar OC
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>
          {ordenSeleccionada && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Código OC</p>
                  <p className="font-medium">{ordenSeleccionada.numero_oc}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Proveedor</p>
                  <p>{ordenSeleccionada.pro_proveedores.razon_social}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha Emisión</p>
                  <p>{formatDate(ordenSeleccionada.fecha_emision_oc)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Fecha Entrega</p>
                  <p>{formatDate(ordenSeleccionada.fecha_esperada)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Estado</p>
                  {getEstadoBadge(ordenSeleccionada.estado_oc)}
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total</p>
                  <p className="text-lg font-bold">{formatCurrency(parseFloat(ordenSeleccionada.monto_total_oc))}</p>
                </div>
                {ordenSeleccionada.nota && (
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">Nota</p>
                    <p>{ordenSeleccionada.nota}</p>
                  </div>
                )}
              </div>

              {ordenSeleccionada.cmp_ordenes_compra_det && ordenSeleccionada.cmp_ordenes_compra_det.length > 0 && (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-3">Detalle de Items</h3>
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
                      {ordenSeleccionada.cmp_ordenes_compra_det.map((item) => (
                                              <TableRow key={item.oc_detalle_id}>
                        <TableCell className="font-medium">
                          {item.mat_materiales?.codigo_material || "-"}
                        </TableCell>
                        <TableCell>
                          {item.mat_materiales?.descripcion_material || "-"}
                        </TableCell>
                        <TableCell className="text-center">{item.cantidad_pedida}</TableCell>
                        <TableCell className="text-center">{item.cantidad_recibida || "0"}</TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(parseFloat(item.precio_unitario))}
                        </TableCell>
                        <TableCell className="text-right">
                          {formatCurrency(parseFloat(item.subtotal))}
                        </TableCell>
                      </TableRow>
                      ))}
                      <TableRow className="border-t-2">
                        <TableCell colSpan={5} className="font-bold text-right">
                          TOTAL
                        </TableCell>
                        <TableCell className="text-right font-bold">
                          {formatCurrency(parseFloat(ordenSeleccionada.monto_total_oc))}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog open={!!orderToDelete} onOpenChange={() => setOrderToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Orden de Compra</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar la orden <strong>{orderToDelete?.numero_oc}</strong>?
              <span className="block mt-2 text-sm">Esta acción eliminará también todos los items asociados.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDelete} 
              className="bg-destructive hover:bg-destructive/90"
            >
              "Eliminar"
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Nueva Orden */}
      <Dialog open={nuevaOrdenOpen} onOpenChange={setNuevaOrdenOpen}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <NuevaOrdenForm onSuccess={handleNuevaOrdenSuccess} standalone={false} />
        </DialogContent>
      </Dialog>
    </div>
  )
}
