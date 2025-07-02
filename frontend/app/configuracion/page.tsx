"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Search, Edit, UserX, UserCheck, Filter, Palette, Ruler, TrendingUp, Shuffle, Trash2 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import ColorForm from "@/components/forms/color-form"
import TallaForm from "@/components/forms/talla-form"
import UnidadMedidaForm from "@/components/forms/unidad-medida-form"
import CategoriaForm from "@/components/forms/categoria-form"
import { categoriasMaterialApi, coloresApi, tallasApi, unidadesMedidaApi } from "@/services/api/configuracion"
import type { CategoriaMaterial, Color, Talla, UnidadMedida } from "@/types/api"

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("colores")

  const [colores, setColores] = useState<Color[]>([])
  const [tallas, setTallas] = useState<Talla[]>([])
  const [unidadesMedida, setUnidadesMedida] = useState<UnidadMedida[]>([])
  const [categorias, setCategorias] = useState<CategoriaMaterial[]>([])

  const [searchTerms, setSearchTerms] = useState({ colores: "", tallas: "", unidades: "", categorias: "" })
  const [statusFilters, setStatusFilters] = useState({
    colores: "activos" as "todos" | "activos" | "inactivos",
    tallas: "activos" as "todos" | "activos" | "inactivos",
    unidades: "activos" as "todos" | "activos" | "inactivos",
    categorias: "activos" as "todos" | "activos" | "inactivos",
  })

  const [itemToToggle, setItemToToggle] = useState<any>(null)
  const [itemToEdit, setItemToEdit] = useState<any>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)

  // Cargar datos
  const loadData = async () => {
    try {
      const coloresData = await coloresApi.getAll();
      console.log("Colores de la API:", coloresData);
      setColores(coloresData || []);

      const tallasData = await tallasApi.getAll();
      console.log("Tallas de la API:", tallasData);
      setTallas(tallasData || []);

      const unidadesData = await unidadesMedidaApi.getAll();
      console.log("Unidades de la API:", unidadesData);
      setUnidadesMedida(unidadesData || []);

      const categoriasData = await categoriasMaterialApi.getAll();
      console.log("Categorías de la API:", categoriasData);
      setCategorias(categoriasData || []);
    } catch (error) {
      console.error("Error al cargar los catálogos:", error)
    }
  }

  useEffect(() => { loadData() }, [])

  // Filtrado robusto y tipado
  function getFilteredItems(type: "colores" | "tallas" | "unidades" | "categorias") {
    let items: any[] = []
    let searchTerm = ""
    let statusFilter: "todos" | "activos" | "inactivos" = "activos"

    switch (type) {
      case "colores":
        items = colores
        searchTerm = searchTerms.colores
        statusFilter = statusFilters.colores
        break
      case "tallas":
        items = tallas
        searchTerm = searchTerms.tallas
        statusFilter = statusFilters.tallas
        break
      case "unidades":
        items = unidadesMedida
        searchTerm = searchTerms.unidades
        statusFilter = statusFilters.unidades
        break
      case "categorias":
        items = categorias
        searchTerm = searchTerms.categorias
        statusFilter = statusFilters.categorias
        break
    }

    return items.filter((item) => {
      if (!item) return false
      let nombre = ""
      switch (type) {
        case "colores": nombre = item.nombre_color || ""; break
        case "tallas": nombre = item.valor_talla || ""; break
        case "unidades": nombre = item.nombre_unidad || ""; break
        case "categorias": nombre = item.nombre_categoria || ""; break
      }
      const matchesSearch = nombre.toLowerCase().includes(searchTerm.toLowerCase()) || searchTerm === ""
      const matchesStatus =
        statusFilter === "todos" ||
        (statusFilter === "activos" && item.estado) ||
        (statusFilter === "inactivos" && !item.estado)
      return matchesSearch && matchesStatus
    })
  }

  // Crear item (tipado)
  async function handleCreateItem(itemData: any, type: "colores" | "tallas" | "unidades" | "categorias") {
    try {
      const processedData = { ...itemData, estado: Boolean(itemData.estado) }
      switch (type) {
        case "colores": await coloresApi.create(processedData); break
        case "tallas": await tallasApi.create(processedData); break
        case "unidades": await unidadesMedidaApi.create(processedData); break
        case "categorias": await categoriasMaterialApi.create(processedData); break
      }
      await loadData()
    } catch (error) {
      console.error("Error al crear el item:", error)
    }
    setShowCreateForm(false)
  }

  // Editar item (tipado)
  async function handleEditItem(itemData: any, type: "colores" | "tallas" | "unidades" | "categorias") {
    if (!itemToEdit) return
    try {
      const processedData = { ...itemData, estado: Boolean(itemData.estado) }
      switch (type) {
        case "colores": await coloresApi.update(itemToEdit.color_id, processedData); break
        case "tallas": await tallasApi.update(itemToEdit.talla_id, processedData); break
        case "unidades": await unidadesMedidaApi.update(itemToEdit.unidad_medida_id, processedData); break
        case "categorias": await categoriasMaterialApi.update(itemToEdit.categoria_material_id, processedData); break
      }
      await loadData()
    } catch (error) {
      console.error("Error al editar el item:", error)
    }
    setItemToEdit(null)
  }

  // Cambiar estado
  async function handleToggleStatus(item: any, type: "colores" | "tallas" | "unidades" | "categorias") {
    try {
      switch (type) {
        case "colores": await coloresApi.update(item.color_id, { estado: !item.estado }); break
        case "tallas": await tallasApi.update(item.talla_id, { estado: !item.estado }); break
        case "unidades": await unidadesMedidaApi.update(item.unidad_medida_id, { estado: !item.estado }); break
        case "categorias": await categoriasMaterialApi.toggleStatus(item.categoria_material_id); break
      }
      await loadData()
    } catch (error) {
      console.error("Error al cambiar el estado:", error)
    }
    setItemToToggle(null)
  }

  // Renderizado de tabla robusto
  const renderTabContent = (type: "colores" | "tallas" | "unidades" | "categorias", title: string) => {
    const filteredItems = getFilteredItems(type)
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">{title}</h3>
          <Button onClick={() => setShowCreateForm(true)}>
            {type === "colores"
              ? "Nuevo Color"
              : type === "tallas"
              ? "Nueva Talla"
              : type === "unidades"
              ? "Nueva Unidad"
              : "Nueva Categoría"}
          </Button>
        </div>
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar ${title.toLowerCase()}...`}
              className="pl-8"
              value={searchTerms[type]}
              onChange={(e) => setSearchTerms((prev) => ({ ...prev, [type]: e.target.value }))}
            />
          </div>
          <Select
            value={statusFilters[type]}
            onValueChange={(value: any) => setStatusFilters((prev) => ({ ...prev, [type]: value }))}
          >
            <SelectTrigger className="w-full md:w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="activos">Solo Activos</SelectItem>
              <SelectItem value="inactivos">Solo Inactivos</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                {(type === "colores" || type === "unidades") && (
                  <TableHead>{type === "colores" ? "Color" : "Abreviatura"}</TableHead>
                )}
                {type === "categorias" && <TableHead>Descripción</TableHead>}
                {type === "categorias" && <TableHead>Configuración BOM</TableHead>}
                <TableHead>Estado</TableHead>
                <TableHead className="w-[120px]">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={type === "categorias" ? 5 : type === "tallas" ? 3 : 4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    No se encontraron {title.toLowerCase()}
                  </TableCell>
                </TableRow>
              ) : (
                filteredItems.map((item) => (
                  <TableRow key={item.color_id || item.talla_id || item.unidad_medida_id || item.categoria_material_id}>
                    <TableCell className="font-medium">
                      {type === "colores" && item.nombre_color}
                      {type === "tallas" && item.valor_talla}
                      {type === "unidades" && item.nombre_unidad}
                      {type === "categorias" && item.nombre_categoria}
                    </TableCell>
                    {type === "colores" && (
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded border" style={{ backgroundColor: item.codigo_color }}></div>
                          <span className="font-mono text-sm">{item.codigo_color}</span>
                        </div>
                      </TableCell>
                    )}
                    {type === "unidades" && <TableCell className="font-mono">{item.abreviatura}</TableCell>}
                    {type === "categorias" && (
                      <TableCell className="max-w-[200px] truncate">{item.descripcion}</TableCell>
                    )}
                    {type === "categorias" && (
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {item.tiene_color && (
                            <Badge variant="outline" className="text-xs bg-red-50">
                              <Palette className="w-3 h-3 mr-1" />
                              Color
                            </Badge>
                          )}
                          {item.tiene_talla && (
                            <Badge variant="outline" className="text-xs bg-blue-50">
                              <Ruler className="w-3 h-3 mr-1" />
                              Talla
                            </Badge>
                          )}
                          {item.varia_cantidad_por_talla && (
                            <Badge variant="outline" className="text-xs bg-green-50">
                              <TrendingUp className="w-3 h-3 mr-1" />
                              Varía/Talla
                            </Badge>
                          )}
                          {item.varia_insumo_por_color && (
                            <Badge variant="outline" className="text-xs bg-purple-50">
                              <Shuffle className="w-3 h-3 mr-1" />
                              Varía/Color
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    )}
                    <TableCell>
                      <Badge
                        variant={item.estado ? "default" : "secondary"}
                        className={
                          item.estado ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300" : ""
                        }
                      >
                        {item.estado ? "Activo" : "Inactivo"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setItemToEdit({ ...item, type: activeTab })}
                          className="h-8 px-2"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setItemToToggle({ ...item, type: activeTab })}
                          className={`h-8 px-2 ${
                            item.estado
                              ? "text-destructive hover:text-destructive"
                              : "text-green-600 hover:text-green-600"
                          }`}
                        >
                          {item.estado ? <Trash2 className="h-3 w-3" /> : <UserCheck className="h-3 w-3" />}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
          <p className="text-muted-foreground">Administre los catálogos maestros del sistema</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Catálogos Maestros</CardTitle>
          <CardDescription>Gestione colores, tallas, unidades de medida y categorías de materiales</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="colores">Colores</TabsTrigger>
              <TabsTrigger value="tallas">Tallas</TabsTrigger>
              <TabsTrigger value="unidades">Unidades</TabsTrigger>
              <TabsTrigger value="categorias">Categorías</TabsTrigger>
            </TabsList>

            <TabsContent value="colores" className="py-4">
              {renderTabContent("colores", "Colores")}
            </TabsContent>

            <TabsContent value="tallas" className="py-4">
              {renderTabContent("tallas", "Tallas")}
            </TabsContent>

            <TabsContent value="unidades" className="py-4">
              {renderTabContent("unidades", "Unidades de Medida")}
            </TabsContent>

            <TabsContent value="categorias" className="py-4">
              {renderTabContent("categorias", "Categorías")}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Modal de confirmación para cambio de estado */}
      <AlertDialog open={!!itemToToggle} onOpenChange={() => setItemToToggle(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {itemToToggle?.item?.estado ? "Inactivar" : "Activar"} {activeTab.slice(0, -1)}
            </AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea {itemToToggle?.item?.estado ? "inactivar" : "activar"}{" "}
              <strong>{itemToToggle?.item?.nombre}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => itemToToggle && handleToggleStatus(itemToToggle.item, itemToToggle.type)}
              className={itemToToggle?.item?.estado ? "bg-destructive hover:bg-destructive/90" : ""}
            >
              {itemToToggle?.item?.estado ? "Inactivar" : "Activar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modales para crear/editar */}
      {activeTab === "colores" && (
        <>
          <ColorForm
            open={showCreateForm}
            onOpenChange={setShowCreateForm}
            onSubmit={(data) => handleCreateItem(data, "colores")}
            title="Nuevo Color"
            description="Complete la información del color"
          />
          <ColorForm
            open={!!itemToEdit}
            onOpenChange={() => setItemToEdit(null)}
            onSubmit={(data) => handleEditItem(data, "colores")}
            initialData={itemToEdit}
            title="Editar Color"
            description="Modifique la información del color"
          />
        </>
      )}

      {activeTab === "tallas" && (
        <>
          <TallaForm
            open={showCreateForm}
            onOpenChange={setShowCreateForm}
            onSubmit={(data) => handleCreateItem(data, "tallas")}
            title="Nueva Talla"
            description="Complete la información de la talla"
          />
          <TallaForm
            open={!!itemToEdit}
            onOpenChange={() => setItemToEdit(null)}
            onSubmit={(data) => handleEditItem(data, "tallas")}
            initialData={itemToEdit}
            title="Editar Talla"
            description="Modifique la información de la talla"
          />
        </>
      )}

      {activeTab === "unidades" && (
        <>
          <UnidadMedidaForm
            open={showCreateForm}
            onOpenChange={setShowCreateForm}
            onSubmit={(data) => handleCreateItem(data, "unidades")}
            title="Nueva Unidad de Medida"
            description="Complete la información de la unidad"
          />
          <UnidadMedidaForm
            open={!!itemToEdit}
            onOpenChange={() => setItemToEdit(null)}
            onSubmit={(data) => handleEditItem(data, "unidades")}
            initialData={itemToEdit}
            title="Editar Unidad de Medida"
            description="Modifique la información de la unidad"
          />
        </>
      )}

      {activeTab === "categorias" && (
        <>
          <CategoriaForm
            open={showCreateForm}
            onOpenChange={setShowCreateForm}
            onSubmit={(data) => handleCreateItem(data, "categorias")}
            title="Nueva Categoría"
            description="Complete la información de la categoría"
          />
          <CategoriaForm
            open={!!itemToEdit}
            onOpenChange={() => setItemToEdit(null)}
            onSubmit={(data) => handleEditItem(data, "categorias")}
            initialData={itemToEdit}
            title="Editar Categoría"
            description="Modifique la información de la categoría"
          />
        </>
      )}
    </div>
  )
}
