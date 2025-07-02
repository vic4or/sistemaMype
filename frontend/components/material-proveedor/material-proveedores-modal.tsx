"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
import { Plus, Edit, Trash2, Star, Clock, Package, DollarSign } from "lucide-react"
import type { MaterialConProveedores, MaterialProveedorDetalle } from "@/types/material-proveedor"
import MaterialProveedorForm from "./material-proveedor-form"

interface MaterialProveedoresModalProps {
  material: MaterialConProveedores | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onUpdate: (material: MaterialConProveedores) => void
}

export default function MaterialProveedoresModal({
  material,
  open,
  onOpenChange,
  onUpdate,
}: MaterialProveedoresModalProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingProveedor, setEditingProveedor] = useState<MaterialProveedorDetalle | null>(null)
  const [proveedorToDelete, setProveedorToDelete] = useState<MaterialProveedorDetalle | null>(null)

  if (!material) return null

  const proveedoresActivos = material.proveedores.filter((p) => p.activo)

  const handleAddProveedor = (proveedorData: Omit<MaterialProveedorDetalle, "id" | "materialProveedorId">) => {
    const newProveedor: MaterialProveedorDetalle = {
      ...proveedorData,
      id: Math.max(0, ...material.proveedores.map((p) => p.id)) + 1,
      materialProveedorId: Math.max(0, ...material.proveedores.map((p) => p.materialProveedorId)) + 1,
    }

    const updatedMaterial = {
      ...material,
      proveedores: [...material.proveedores, newProveedor],
    }

    onUpdate(updatedMaterial)
    setShowForm(false)
  }

  const handleEditProveedor = (proveedorData: Omit<MaterialProveedorDetalle, "id" | "materialProveedorId">) => {
    if (!editingProveedor) return

    const updatedMaterial = {
      ...material,
      proveedores: material.proveedores.map((p) =>
        p.id === editingProveedor.id
          ? { ...proveedorData, id: editingProveedor.id, materialProveedorId: editingProveedor.materialProveedorId }
          : p,
      ),
    }

    onUpdate(updatedMaterial)
    setEditingProveedor(null)
  }

  const handleDeleteProveedor = () => {
    if (!proveedorToDelete) return

    const updatedMaterial = {
      ...material,
      proveedores: material.proveedores.filter((p) => p.id !== proveedorToDelete.id),
    }

    onUpdate(updatedMaterial)
    setProveedorToDelete(null)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-PE", {
      style: "currency",
      currency: "PEN",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Proveedores para {material.name}
            </DialogTitle>
            <DialogDescription>
              Gestione los proveedores, precios y condiciones de compra para este material
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Información del material */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">Información del Material</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Código:</span>
                    <div className="font-medium">{material.code}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Categoría:</span>
                    <div className="font-medium">{material.category}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stock Actual:</span>
                    <div className="font-medium">
                      {material.stock} {material.unit}
                    </div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Stock Mínimo:</span>
                    <div className="font-medium">
                      {material.minimum} {material.unit}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Resumen de proveedores */}
            {proveedoresActivos.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-muted-foreground">Mejor Precio</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600">
                      {formatCurrency(Math.min(...proveedoresActivos.map((p) => p.precio)))}
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
                      {Math.min(...proveedoresActivos.map((p) => p.moq))} {material.unit}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-orange-600" />
                      <span className="text-sm text-muted-foreground">Menor Lead Time</span>
                    </div>
                    <div className="text-2xl font-bold text-orange-600">
                      {Math.min(...proveedoresActivos.map((p) => p.leadTime))} días
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Lista de proveedores */}
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle>Proveedores Configurados</CardTitle>
                    <CardDescription>
                      {proveedoresActivos.length} proveedor{proveedoresActivos.length !== 1 ? "es" : ""} activo
                      {proveedoresActivos.length !== 1 ? "s" : ""}
                    </CardDescription>
                  </div>
                  <Button onClick={() => setShowForm(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Agregar Proveedor
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {proveedoresActivos.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="mx-auto h-12 w-12 text-muted-foreground/50" />
                    <h3 className="mt-4 text-lg font-medium">Sin proveedores configurados</h3>
                    <p className="text-muted-foreground">
                      Agregue proveedores para poder realizar compras de este material
                    </p>
                    <Button className="mt-4" onClick={() => setShowForm(true)}>
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar Primer Proveedor
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Proveedor</TableHead>
                          <TableHead className="text-right">Precio Unitario</TableHead>
                          <TableHead className="text-right">MOQ</TableHead>
                          <TableHead className="text-right">Lead Time</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="w-[120px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proveedoresActivos.map((proveedor) => (
                          <TableRow key={proveedor.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div>
                                  <div className="font-medium flex items-center gap-1">
                                    {proveedor.proveedorNombre}
                                    {proveedor.preferido && <Star className="h-4 w-4 text-yellow-500 fill-current" />}
                                  </div>
                                  <div className="text-sm text-muted-foreground">RUC: {proveedor.proveedorRuc}</div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(proveedor.precio)}</TableCell>
                            <TableCell className="text-right">
                              {proveedor.moq} {material.unit}
                            </TableCell>
                            <TableCell className="text-right">{proveedor.leadTime} días</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                {proveedor.preferido && (
                                  <Badge variant="default" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                    Preferido
                                  </Badge>
                                )}
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Activo
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setEditingProveedor(proveedor)}
                                  className="h-8 w-8"
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setProveedorToDelete(proveedor)}
                                  className="h-8 w-8 text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </DialogContent>
      </Dialog>

      {/* Formulario para agregar proveedor */}
      <MaterialProveedorForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleAddProveedor}
        material={material}
        title="Agregar Proveedor"
        description="Configure las condiciones de compra para este proveedor"
      />

      {/* Formulario para editar proveedor */}
      <MaterialProveedorForm
        open={!!editingProveedor}
        onOpenChange={() => setEditingProveedor(null)}
        onSubmit={handleEditProveedor}
        material={material}
        initialData={editingProveedor}
        title="Editar Proveedor"
        description="Modifique las condiciones de compra"
      />

      {/* Confirmación de eliminación */}
      <AlertDialog open={!!proveedorToDelete} onOpenChange={() => setProveedorToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar Proveedor</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Está seguro que desea eliminar a <strong>{proveedorToDelete?.proveedorNombre}</strong> como proveedor de
              este material?
              <br />
              <span className="text-sm text-muted-foreground mt-2 block">
                Esta acción no se puede deshacer y se perderá el historial de precios.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProveedor} className="bg-destructive hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
