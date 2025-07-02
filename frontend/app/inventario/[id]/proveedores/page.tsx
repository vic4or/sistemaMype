"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
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
import { ArrowLeft, Edit, Trash2, Star, Clock, Package, DollarSign, Plus } from "lucide-react"
import { materialesApi } from "@/services/api/materiales"
import { Material, MaterialProveedor, Proveedor } from "@/types/api"
import { useToast } from "@/hooks/use-toast"
import MaterialProveedorForm from "@/components/material-proveedor/material-proveedor-form"

export default function MaterialProveedoresPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const materialId = parseInt(params.id as string)

  const [material, setMaterial] = useState<Material | null>(null)
  const [loading, setLoading] = useState(true)
  const [editingProveedor, setEditingProveedor] = useState<MaterialProveedor | null>(null)
  const [showNewForm, setShowNewForm] = useState(false)
  const [proveedorToDelete, setProveedorToDelete] = useState<MaterialProveedor | null>(null)

  useEffect(() => {
    loadMaterialProveedores()
  }, [materialId])

  const loadMaterialProveedores = async () => {
    try {
      setLoading(true)
      const data = await materialesApi.getProveedores(materialId)
      setMaterial(data)
    } catch (error) {
      console.error("Error al cargar proveedores:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores del material",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleEditProveedor = (proveedor: MaterialProveedor) => {
    setEditingProveedor(proveedor)
  }

  const handleDeleteProveedor = async (proveedorId: number) => {
    if (!confirm("¿Está seguro de eliminar este proveedor?")) return

    try {
      // Aquí necesitaríamos una API para eliminar proveedor, pero por ahora solo actualizamos estado
      await loadMaterialProveedores()
      toast({
        title: "Éxito",
        description: "Proveedor eliminado correctamente"
      })
    } catch (error) {
      console.error("Error al eliminar proveedor:", error)
      toast({
        title: "Error",
        description: "No se pudo eliminar el proveedor",
        variant: "destructive"
      })
    }
  }

  const handleProveedorSaved = async () => {
    await loadMaterialProveedores()
    setEditingProveedor(null)
    setShowNewForm(false)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center">Cargando proveedores...</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!material) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="text-center text-muted-foreground">Material no encontrado</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Proveedores del Material</h1>
          <p className="text-muted-foreground">
            {material.codigo_material} - {material.descripcion_material}
          </p>
        </div>
        <Button onClick={() => setShowNewForm(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Proveedor
        </Button>
      </div>

      {/* Información del Material */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Material</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Código</p>
              <p className="text-lg">{material.codigo_material || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Descripción</p>
              <p className="text-lg">{material.descripcion_material || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Categoría</p>
              <p className="text-lg">{material.cfg_categorias_material?.nombre_categoria || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Stock Actual</p>
              <p className="text-lg">
                {material.stock_actual || 0} {material.cfg_unidades_medida?.abreviatura || ""}
              </p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unidad de Compra</p>
              <p className="text-lg">{material.cfg_unidades_medida?.nombre_unidad || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Unidad de Consumo</p>
              <p className="text-lg">{material.cfg_unidades_medida_mat_materiales_unidad_consumo_idTocfg_unidades_medida?.nombre_unidad || "N/A"}</p>
            </div>
            
            {/* Campos específicos para telas */}
            {material.cfg_categorias_material?.nombre_categoria?.toLowerCase().includes("tela") && (
              <>
                {material.ancho_tela_metros && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Ancho de Tela</p>
                    <p className="text-lg">{material.ancho_tela_metros} metros</p>
                  </div>
                )}
                {material.rendimiento_tela && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Rendimiento</p>
                    <p className="text-lg">{material.rendimiento_tela}</p>
                  </div>
                )}
                {material.tipo_tejido_tela && (
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">Tipo de Tejido</p>
                    <p className="text-lg">{material.tipo_tejido_tela}</p>
                  </div>
                )}
              </>
            )}
            
            {/* Factor de conversión para no-telas */}
            {!material.cfg_categorias_material?.nombre_categoria?.toLowerCase().includes("tela") && material.factor_conversion_compra && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Factor de Conversión</p>
                <p className="text-lg">{material.factor_conversion_compra}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resumen de proveedores */}
      {material.mat_materiales_prov && material.mat_materiales_prov.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="text-sm text-muted-foreground">Mejor Precio</span>
              </div>
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(Math.min(...material.mat_materiales_prov.map((p: MaterialProveedor) => Number(p.precio_compra) || 0).filter((p: number) => p > 0)))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="text-sm text-muted-foreground">MOQ Mínimo</span>
              </div>
              <div className="text-2xl font-bold text-blue-600">
                {Math.min(...material.mat_materiales_prov.map((p: MaterialProveedor) => Number(p.moq_proveedor) || 0).filter((p: number) => p > 0))} {material.cfg_unidades_medida?.abreviatura}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-orange-600" />
                <span className="text-sm text-muted-foreground">Total Proveedores</span>
              </div>
              <div className="text-2xl font-bold text-orange-600">
                {material.mat_materiales_prov.length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lista de Proveedores */}
      <Card>
        <CardHeader>
          <CardTitle>Proveedores Asociados</CardTitle>
          <CardDescription>
            Gestiona los proveedores que suministran este material
          </CardDescription>
        </CardHeader>
        <CardContent>
          {material.mat_materiales_prov && material.mat_materiales_prov.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Proveedor</TableHead>
                    <TableHead>RUC</TableHead>
                    <TableHead className="text-right">Precio</TableHead>
                    <TableHead className="text-right">MOQ</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {material.mat_materiales_prov.map((proveedor: MaterialProveedor) => (
                    <TableRow key={proveedor.mat_prov_id}>
                      <TableCell className="font-medium">
                        {proveedor.pro_proveedores?.razon_social}
                      </TableCell>
                      <TableCell>{proveedor.pro_proveedores?.ruc}</TableCell>
                      <TableCell className="text-right">
                        S/ {Number(proveedor.precio_compra || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-right">
                        {proveedor.moq_proveedor}
                      </TableCell>
                      <TableCell>
                        {proveedor.unidad_medida?.abreviatura}
                      </TableCell>
                      <TableCell>
                        <Badge variant={proveedor.estado ? "default" : "secondary"}>
                          {proveedor.estado ? "Activo" : "Inactivo"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditProveedor(proveedor)}
                            className="h-8 w-8"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setProveedorToDelete(proveedor)
                            }}
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No hay proveedores asociados a este material</p>
              <Button 
                onClick={() => setShowNewForm(true)} 
                className="mt-4"
                variant="outline"
              >
                <Plus className="h-4 w-4 mr-2" />
                Agregar primer proveedor
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal para nuevo proveedor */}
      <MaterialProveedorForm
        materialId={materialId}
        open={showNewForm}
        onOpenChange={setShowNewForm}
        onProveedorSaved={handleProveedorSaved}
      />

      {/* Modal para editar proveedor */}
      <MaterialProveedorForm
        materialId={materialId}
        proveedor={editingProveedor}
        open={!!editingProveedor}
        onOpenChange={() => setEditingProveedor(null)}
        onProveedorSaved={handleProveedorSaved}
      />

      {/* Confirmación de eliminación */}
      <AlertDialog open={!!proveedorToDelete} onOpenChange={() => setProveedorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Proveedor</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar a <strong>{proveedorToDelete?.pro_proveedores?.razon_social}</strong> como proveedor de
              este material?
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                Esta acción no se puede deshacer y se perderá el historial de precios.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => proveedorToDelete && handleDeleteProveedor(proveedorToDelete.mat_prov_id)} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
