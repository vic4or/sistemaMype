"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FileDown, Loader2, RefreshCw, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import NuevoMovimientoForm from "@/components/forms/nuevo-movimiento-form"
import { ActionButtons } from "@/components/ui/action-buttons"
import { StatusBadge } from "@/components/ui/status-badge"
import { toast } from "@/hooks/use-toast"
import { movimientosApi, type Movimiento } from "@/services/api/movimientos"
import { formatDate } from "@/lib/utils"
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
export default function MovimientosInventarioPage() {
  const [movimientos, setMovimientos] = useState<Movimiento[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [materialFilter, setMaterialFilter] = useState("all")
  const [tipoFilter, setTipoFilter] = useState("all")
  const [fechaDesde, setFechaDesde] = useState("")
  const [fechaHasta, setFechaHasta] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [movimientoToDelete, setMovimientoToDelete] = useState<number | null>(null)

  // Cargar movimientos al montar el componente
  useEffect(() => {
    loadMovimientos()
  }, [])

  const loadMovimientos = async (showRefreshLoader = false) => {
    try {
      if (showRefreshLoader) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }
      const data = await movimientosApi.getAll()
      setMovimientos(data)
    } catch (error: any) {
      console.error('Error al cargar movimientos:', error)
      toast({
        title: "Error",
        description: error.message || "Error al cargar los movimientos",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  // formatDate viene de lib/utils usando split('T')[0] que funciona correctamente

  // Función para obtener el tipo de movimiento en español para el filtro
  const getTipoForFilter = (tipo: string) => {
    switch (tipo) {
      case 'Entrada': return 'input'
      case 'Salida': return 'output'
      case 'Ajuste': return 'adjustment'
      default: return tipo.toLowerCase()
    }
  }

  // Función para obtener la referencia del movimiento
  const getReferencia = (movimiento: Movimiento) => {
    if (movimiento.cmp_ordenes_compra_det?.cmp_ordenes_compra?.numero_oc) {
      return movimiento.cmp_ordenes_compra_det.cmp_ordenes_compra.numero_oc
    }
    return 'Manual'
  }

  // Función para filtrar movimientos (memoizada para mejor rendimiento)
  const filteredMovimientos = useMemo(() => {
    return movimientos.filter((movimiento) => {
             // Filtro de búsqueda por texto
       const searchMatch = searchTerm === "" || 
         movimiento.mat_materiales.descripcion_material.toLowerCase().includes(searchTerm.toLowerCase()) ||
         movimiento.mat_materiales.codigo_material.toLowerCase().includes(searchTerm.toLowerCase()) ||
         getReferencia(movimiento).toLowerCase().includes(searchTerm.toLowerCase())

      // Filtro por tipo de movimiento
      const tipoForFilter = getTipoForFilter(movimiento.tipo_movimiento)
      const tipoMatch = tipoFilter === "all" || tipoForFilter === tipoFilter
      
      // Filtro por fechas
      const fechaMovimiento = new Date(movimiento.fecha_movimiento)
      const fechaDesdeMatch = fechaDesde === "" || fechaMovimiento >= new Date(fechaDesde)
      const fechaHastaMatch = fechaHasta === "" || fechaMovimiento <= new Date(fechaHasta + "T23:59:59")

      return searchMatch && tipoMatch && fechaDesdeMatch && fechaHastaMatch
    })
  }, [movimientos, searchTerm, tipoFilter, fechaDesde, fechaHasta])

  // Calcular elementos paginados
  const paginatedMovimientos = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredMovimientos.slice(startIndex, endIndex)
  }, [filteredMovimientos, currentPage, itemsPerPage])

  // Calcular información de paginación
  const totalPages = Math.ceil(filteredMovimientos.length / itemsPerPage)
  const startItem = filteredMovimientos.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1
  const endItem = Math.min(currentPage * itemsPerPage, filteredMovimientos.length)

  // Reset página actual cuando cambian los filtros o elementos por página
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, tipoFilter, fechaDesde, fechaHasta, itemsPerPage])

  const handleView = (id: number) => {
    console.log("Ver movimiento:", id)
    // TODO: Implementar vista detallada del movimiento
  }

  const handleEdit = (id: number) => {
    console.log("Editar movimiento:", id)
    // TODO: Implementar edición del movimiento si es necesario
  }

  const handleDelete = () => {
    console.log("Eliminar movimiento:", movimientoToDelete)
    // TODO: Implementar eliminación lógica si es necesario
    setMovimientoToDelete(null)
  }

  // Función para refrescar la tabla después de crear un nuevo movimiento
  const onMovimientoCreated = () => {
    loadMovimientos(true)
  }

  // Función para limpiar filtros
  const clearFilters = () => {
    setSearchTerm("")
    setTipoFilter("all")
    setFechaDesde("")
    setFechaHasta("")
    setCurrentPage(1)
  }

  // Función para exportar datos (placeholder)
  const handleExport = () => {
    // TODO: Implementar exportación
    toast({
      title: "Funcionalidad pendiente",
      description: "La exportación será implementada próximamente",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span>Cargando movimientos...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos de Inventario</h1>
          <p className="text-muted-foreground">
            Gestión de entradas, salidas y ajustes de materiales
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExport}>
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <NuevoMovimientoForm onSuccess={onMovimientoCreated} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Historial de Movimientos</CardTitle>
          <CardDescription>
            Mostrando {startItem}-{endItem} de {filteredMovimientos.length} movimientos
            {filteredMovimientos.length !== movimientos.length && ` (filtrados de ${movimientos.length} total)`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros de búsqueda */}
          <div className="space-y-4 pb-4">
            <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por material, código o referencia..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="input">Entradas</SelectItem>
                <SelectItem value="output">Salidas</SelectItem>
                <SelectItem value="adjustment">Ajustes</SelectItem>
              </SelectContent>
            </Select>
            </div>
            
            {/* Filtros de fecha */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Desde:</label>
                <Input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Hasta:</label>
                <Input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-auto"
                />
              </div>
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium">Mostrar:</label>
                <Select value={itemsPerPage.toString()} onValueChange={() => {}}>
                  <SelectTrigger className="w-[100px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="25">25</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={clearFilters}
                  disabled={searchTerm === "" && tipoFilter === "all" && fechaDesde === "" && fechaHasta === ""}
                >
                  Limpiar filtros
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => loadMovimientos(true)}
                  disabled={refreshing}
                >
                  {refreshing ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="h-4 w-4" />
                  )}
                  {refreshing ? "Actualizando..." : "Actualizar"}
                </Button>
              </div>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead className="text-right">Cantidad</TableHead>
                  <TableHead className="text-right">Stock Anterior</TableHead>
                  <TableHead className="text-right">Stock Nuevo</TableHead>
                  <TableHead>Referencia</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedMovimientos.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      {movimientos.length === 0 
                        ? "No hay movimientos registrados" 
                        : "No se encontraron movimientos con los filtros aplicados"
                      }
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedMovimientos.map((movimiento) => (
                    <TableRow key={movimiento.movimiento_id}>
                      <TableCell>{formatDate(movimiento.fecha_movimiento)}</TableCell>
                      <TableCell>
                        <StatusBadge status={getTipoForFilter(movimiento.tipo_movimiento)} />
                      </TableCell>
                      <TableCell className="font-medium">{movimiento.mat_materiales.codigo_material}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate" title={movimiento.mat_materiales.descripcion_material}>
                          {movimiento.mat_materiales.descripcion_material}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {Number(movimiento.cantidad_movimiento).toFixed(2)}
                      </TableCell>
                    <TableCell className="text-right">
                        {Number(movimiento.stock_anterior).toFixed(2)}
                    </TableCell>
                      <TableCell className="text-right">
                        {Number(movimiento.stock_nuevo).toFixed(2)}
                    </TableCell>
                      <TableCell>{getReferencia(movimiento)}</TableCell>
                    <TableCell>
                      <ActionButtons
                          onView={() => handleView(movimiento.movimiento_id)}
                          onEdit={() => handleEdit(movimiento.movimiento_id)}
                        onDelete={() => setMovimientoToDelete(movimiento.movimiento_id)}
                          useDropdown={false}
                      />
                    </TableCell>
                  </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startItem} a {endItem} de {filteredMovimientos.length} movimientos
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage <= 1}
                >
                  Anterior
                </Button>
                <span className="text-sm">
                  Página {currentPage} de {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de confirmación para eliminar */}
      <AlertDialog open={!!movimientoToDelete} onOpenChange={() => setMovimientoToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Movimiento</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar el movimiento?
              <span className="block mt-2 text-sm">Esta acción puede afectar el stock actual del material.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
