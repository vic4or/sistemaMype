"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, FileDown, Users, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import { ActionButtons } from "@/components/ui/action-buttons"
import EditarMaterialForm from "@/components/forms/editar-material-form"
import NuevoMaterialForm from "@/components/forms/nuevo-material-form"
import { materialesApi } from "@/services/api/materiales"
import { categoriasMaterialApi } from "@/services/api/configuracion"
import { Material, CategoriaMaterial } from "@/types/api"
import { useToast } from "@/hooks/use-toast"

export default function InventarioPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [materiales, setMateriales] = useState<Material[]>([])
  const [categorias, setCategorias] = useState<CategoriaMaterial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null)
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Cargar datos iniciales
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [materialesData, categoriasData] = await Promise.all([
        materialesApi.getAll(),
        categoriasMaterialApi.getAll()
      ])
      setMateriales(materialesData)
      setCategorias(categoriasData)
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los materiales",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // Función para obtener el estado de proveedores
  const getProveedorStatus = (material: Material) => {
    const proveedoresActivos = material.mat_materiales_prov?.filter((p) => p.estado) || []
    if (proveedoresActivos.length === 0) return { label: "Sin Proveedores", variant: "destructive" as const, count: 0 }
    return {
      label: `${proveedoresActivos.length} Proveedor${proveedoresActivos.length > 1 ? "es" : ""}`,
      variant: "default" as const,
      count: proveedoresActivos.length,
    }
  }

  const filteredItems = materiales.filter((item) => {
    const matchesSearch =
      item.descripcion_material?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.codigo_material?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesCategory = categoryFilter === "all" || item.categoria_material_id?.toString() === categoryFilter
    
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "activo" && item.estado) ||
      (statusFilter === "inactivo" && !item.estado)
    
    return matchesSearch && matchesCategory && matchesStatus
  })

  // Paginación
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedItems = filteredItems.slice(startIndex, endIndex)

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, categoryFilter, statusFilter])

  const handleGestionarProveedores = (material: Material) => {
    router.push(`/inventario/${material.material_id}/proveedores`)
  }

  const handleEditMaterial = (material: Material) => {
    setEditingMaterial(material)
  }

  const handleUpdateMaterial = async (updatedMaterial: Material) => {
    try {
      await materialesApi.update(updatedMaterial.material_id, updatedMaterial)
      await loadData() // Recargar datos
      setEditingMaterial(null)
      toast({
        title: "Éxito",
        description: "Material actualizado correctamente"
      })
    } catch (error) {
      console.error("Error al actualizar material:", error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el material",
        variant: "destructive"
      })
    }
  }

  const handleDeleteMaterial = async (materialId: number) => {
    try {
      await materialesApi.delete(materialId)
      await loadData() // Recargar datos
      toast({
        title: "Éxito",
        description: "Material eliminado correctamente"
      })
    } catch (error) {
      console.error("Error al eliminar material:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el material",
        variant: "destructive"
      })
    }
  }

  const onMaterialCreated = async () => {
    await loadData() // Recargar datos cuando se crea un nuevo material
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Cargando materiales...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Inventario</h1>
        <div className="flex gap-2">
          <Button variant="outline">
            <FileDown className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <NuevoMaterialForm onMaterialCreated={onMaterialCreated} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Materiales en Inventario</CardTitle>
          <CardDescription>Gestiona el stock de materiales y sus proveedores para la producción</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 pb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar materiales..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Categoría" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las categorías</SelectItem>
                {categorias.map((categoria) => (
                  <SelectItem key={categoria.categoria_material_id} value={categoria.categoria_material_id.toString()}>
                    {categoria.nombre_categoria}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[140px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="activo">Activos</SelectItem>
                <SelectItem value="inactivo">Inactivos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Proveedores</TableHead>
                  <TableHead className="w-[200px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
                              <TableBody>
                {paginatedItems.map((item) => {
                  const proveedorStatus = getProveedorStatus(item)

                  return (
                    <TableRow key={item.material_id} className={!item.estado ? "opacity-60" : ""}>
                      <TableCell className="font-medium">{item.codigo_material}</TableCell>
                      <TableCell>{item.descripcion_material}</TableCell>
                      <TableCell>{item.cfg_categorias_material?.nombre_categoria}</TableCell>
                      <TableCell className="text-right">
                        {item.stock_actual || '-'} {item.cfg_unidades_medida?.abreviatura}
                      </TableCell>
                      <TableCell>
                        <Badge variant={item.estado ? "default" : "secondary"} 
                               className={item.estado ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300" : ""}>
                          {item.estado ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={proveedorStatus.variant}
                          className={
                            proveedorStatus.variant === "default" && proveedorStatus.count > 0
                              ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300"
                              : proveedorStatus.variant === "destructive"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-300"
                                : ""
                          }
                        >
                          {proveedorStatus.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleGestionarProveedores(item)}
                            className="flex items-center gap-1"
                          >
                            <Users className="h-3 w-3" />
                            Proveedores
                          </Button>
                          <ActionButtons
                            onEdit={() => handleEditMaterial(item)}
                            onDelete={() => handleDeleteMaterial(item.material_id)}
                            deleteLabel="Eliminar"
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
                {paginatedItems.length === 0 && filteredItems.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron materiales
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Paginación */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <div className="text-sm text-muted-foreground">
                Mostrando {startIndex + 1} a {Math.min(endIndex, filteredItems.length)} de {filteredItems.length} materiales
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

      {/* Modal de editar material */}
      <EditarMaterialForm
        material={editingMaterial}
        open={!!editingMaterial}
        onOpenChange={() => setEditingMaterial(null)}
        onUpdate={handleUpdateMaterial}
      />
    </div>
  )
}
