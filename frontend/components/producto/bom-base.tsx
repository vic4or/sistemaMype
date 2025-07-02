"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Save, Trash2, Edit } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import BOMBaseForm from "./bom-base-form"
import Package from "lucide-react" // Declared the Package variable

interface Material {
  id: number
  codigo: string
  nombre: string
  unidad: string
  categoria: string
}

interface BOMBaseItem {
  id: number
  materialId: number
  material: Material
  cantidad: number
}

interface BOMBaseProps {
  bomBase: BOMBaseItem[]
  setBomBase: (items: BOMBaseItem[]) => void
  materiales: Material[]
  producto: any
}

export default function BOMBase({ bomBase, setBomBase, materiales, producto }: BOMBaseProps) {
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<BOMBaseItem | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const handleAddItem = (itemData: Omit<BOMBaseItem, "id">) => {
    const newItem: BOMBaseItem = {
      ...itemData,
      id: Math.max(0, ...bomBase.map((item) => item.id)) + 1,
    }
    setBomBase([...bomBase, newItem])
    setShowForm(false)
  }

  const handleEditItem = (itemData: Omit<BOMBaseItem, "id">) => {
    if (!editingItem) return

    const updatedItems = bomBase.map((item) =>
      item.id === editingItem.id ? { ...itemData, id: editingItem.id } : item,
    )
    setBomBase(updatedItems)
    setEditingItem(null)
  }

  const handleDeleteItem = (id: number) => {
    setBomBase(bomBase.filter((item) => item.id !== id))
  }

  const handleSave = async () => {
    setIsSaving(true)
    // Simular guardado
    console.log("Guardando BOM Base:", bomBase)
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Materiales Base</CardTitle>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Agregar Material Base
          </Button>
        </CardHeader>
        <CardContent>
          {bomBase.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No hay materiales en el BOM base</p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar Primer Material
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Material</TableHead>
                    <TableHead>Categoría</TableHead>
                    <TableHead>Unidad</TableHead>
                    <TableHead>Cantidad</TableHead>
                    <TableHead className="w-[120px]">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bomBase.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{item.material.nombre}</div>
                          <div className="text-sm text-muted-foreground font-mono">{item.material.codigo}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{item.material.categoria}</Badge>
                      </TableCell>
                      <TableCell>{item.material.unidad}</TableCell>
                      <TableCell>
                        <span className="font-medium">{item.cantidad}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" onClick={() => setEditingItem(item)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDeleteItem(item.id)}
                            className="text-destructive hover:text-destructive"
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
          )}

          {bomBase.length > 0 && (
            <div className="mt-4 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar BOM Base"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario para agregar/editar */}
      <BOMBaseForm
        open={showForm || !!editingItem}
        onOpenChange={(open) => {
          if (!open) {
            setShowForm(false)
            setEditingItem(null)
          }
        }}
        onSubmit={editingItem ? handleEditItem : handleAddItem}
        materiales={materiales}
        initialData={editingItem}
        title={editingItem ? "Editar Material" : "Agregar Material Base"}
      />
    </div>
  )
}
