"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Filter, PlusCircle } from "lucide-react"
import { useRouter } from "next/navigation"
import { ActionButtons } from "@/components/ui/action-buttons"
import { StatusBadge } from "@/components/ui/status-badge"
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
import { useToast } from "@/hooks/use-toast"
import { productosApi } from "@/services/api/productos"
import type { Product } from "@/types/product"
import { useAuthContext } from "@/contexts/auth-context"
import PermissionGuard from "@/components/auth/permission-guard"

export default function ProductosPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { canAccess } = useAuthContext()

  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<"todos" | "activos" | "inactivos">("activos")
  const [productos, setProductos] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [productoToDelete, setProductoToDelete] = useState<number | null>(null)

  const loadProductos = async () => {
    try {
      setLoading(true)
      const data = await productosApi.getAll()
      setProductos(data)
      setError(null)
    } catch (err) {
      setError("Error al cargar productos")
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProductos()
  }, [])

  const handleDeleteConfirm = async () => {
    if (!productoToDelete) return

    try {
      await productosApi.delete(productoToDelete)
      await loadProductos()
      toast({
        title: "Éxito",
        description: "Producto eliminado correctamente",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setProductoToDelete(null)
    }
  }

  const handleToggleStatus = async (id: number) => {
    try {
      await productosApi.toggleStatus(id)
      await loadProductos()
      toast({
        title: "Éxito",
        description: "Estado del producto actualizado",
      })
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    }
  }

  const getCategoriaLabel = (categoria: string | undefined) => {
    if (!categoria) return "Sin categoría"
    
    // Los valores ahora vienen capitalizados desde los formularios
    const labels: Record<string, string> = {
      // Soporte para valores antiguos en minúsculas (backward compatibility)
      polos: "Polos",
      joggers: "Joggers",
      cafarenas: "Cafarenas",
      pantalones: "Pantalones",
      shorts: "Shorts",
      blusas: "Blusas",
      vestidos: "Vestidos",
      // Valores nuevos capitalizados
      Polos: "Polos",
      Joggers: "Joggers",
      Cafarenas: "Cafarenas",
      Pantalones: "Pantalones",
      Shorts: "Shorts",
      Blusas: "Blusas",
      Vestidos: "Vestidos",
    }
    return labels[categoria] || categoria
  }

  const getEstacionLabel = (estacion: string | undefined) => {
    if (!estacion) return "Sin estación"
    
    // Los valores ahora vienen capitalizados desde los formularios
    const labels: Record<string, string> = {
      // Soporte para valores antiguos en minúsculas (backward compatibility)
      verano: "Verano",
      invierno: "Invierno",
      otoño: "Otoño",
      primavera: "Primavera",
      "todo-año": "Todo el año",
      // Valores nuevos capitalizados
      Verano: "Verano",
      Invierno: "Invierno",
      Otoño: "Otoño",
      Primavera: "Primavera",
      "Todo el año": "Todo el año",
    }
    return labels[estacion] || estacion
  }

  const getLineaLabel = (linea: string | undefined) => {
    if (!linea) return "Sin línea"
    
    // Los valores ahora vienen capitalizados desde los formularios
    const labels: Record<string, string> = {
      // Soporte para valores antiguos en minúsculas (backward compatibility)
      superior: "Superior",
      inferior: "Inferior",
      completa: "Completa",
      // Valores nuevos capitalizados
      Superior: "Superior",
      Inferior: "Inferior",
      Completa: "Completa",
    }
    return labels[linea] || linea
  }

  const filteredProductos = productos.filter((producto) => {
    const matchesSearch =
      (producto.codigo?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (producto.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (producto.categoria?.toLowerCase().includes(searchTerm.toLowerCase()) || false)

    const matchesStatus =
      statusFilter === "todos" ||
      (statusFilter === "activos" && producto.estado) ||
      (statusFilter === "inactivos" && !producto.estado)

    return matchesSearch && matchesStatus
  })

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-destructive">Error al cargar productos: {error}</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <PermissionGuard permission="productos:view">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
            <p className="text-muted-foreground">Gestiona tu catálogo de productos de confección</p>
          </div>
          {canAccess('productos:create') && (
            <Button onClick={() => router.push("/productos/nuevo")}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Nuevo Producto
            </Button>
          )}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Catálogo de Productos</CardTitle>
            <CardDescription>
              {filteredProductos.length} producto{filteredProductos.length !== 1 ? "s" : ""}
              {statusFilter !== "todos" && ` ${statusFilter}`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Filtros y búsqueda */}
            <div className="flex flex-col md:flex-row gap-4 pb-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por código, nombre o categoría..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Filtrar por estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="activos">Solo Activos</SelectItem>
                  <SelectItem value="inactivos">Solo Inactivos</SelectItem>
                  <SelectItem value="todos">Todos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tabla de productos */}
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Nombre</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Línea</TableHead>
                    <TableHead>Estación</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                          <span className="ml-2">Cargando productos...</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : filteredProductos.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                        No se encontraron productos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredProductos.map((producto) => (
                      <TableRow key={producto.producto_id}>
                        <TableCell className="font-medium">{producto.codigo || "Sin código"}</TableCell>
                        <TableCell>{producto.nombre || "Sin nombre"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {getCategoriaLabel(producto.categoria)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getLineaLabel(producto.linea)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {getEstacionLabel(producto.estacion)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={producto.estado ? "active" : "inactive"} />
                        </TableCell>
                        <TableCell className="text-right">
                          <ActionButtons
                            onView={() => router.push(`/productos/${producto.producto_id}`)}
                            onEdit={canAccess('productos:edit') ? () => router.push(`/productos/${producto.producto_id}/editar`) : undefined}
                            onDelete={canAccess('productos:delete') ? () => setProductoToDelete(producto.producto_id) : undefined}
                            useDropdown={false}
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Dialog de confirmación de eliminación */}
        <AlertDialog open={!!productoToDelete} onOpenChange={() => setProductoToDelete(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
              <AlertDialogDescription>
                Esta acción no se puede deshacer. Esto eliminará permanentemente el producto.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancelar</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                Eliminar
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </PermissionGuard>
  )
}
