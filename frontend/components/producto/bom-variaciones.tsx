"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, Save, Copy, ChevronDown, ChevronRight, Trash2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import BOMVariacionForm from "./bom-variacion-form"
import { Package } from "lucide-react" // Import the Package component

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

interface BOMVariacion {
  id: number
  materialId: number
  material: Material
  talla: string
  color: string
  cantidad: number
}

interface BOMVariacionesProps {
  bomBase: BOMBaseItem[]
  bomVariaciones: BOMVariacion[]
  setBomVariaciones: (items: BOMVariacion[]) => void
  materiales: Material[]
  producto: any
}

export default function BOMVariaciones({
  bomBase,
  bomVariaciones,
  setBomVariaciones,
  materiales,
  producto,
}: BOMVariacionesProps) {
  const [showForm, setShowForm] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [expandedMaterials, setExpandedMaterials] = useState<Set<number>>(new Set())
  const [bulkQuantity, setBulkQuantity] = useState("")
  const [selectedMaterial, setSelectedMaterial] = useState<number | null>(null)

  // Agrupar variaciones por material
  const variacionesPorMaterial = bomVariaciones.reduce(
    (acc, variacion) => {
      if (!acc[variacion.materialId]) {
        acc[variacion.materialId] = []
      }
      acc[variacion.materialId].push(variacion)
      return acc
    },
    {} as Record<number, BOMVariacion[]>,
  )

  // Obtener materiales únicos que tienen variaciones
  const materialesConVariaciones = Object.keys(variacionesPorMaterial).map(Number)

  const toggleMaterial = (materialId: number) => {
    const newExpanded = new Set(expandedMaterials)
    if (newExpanded.has(materialId)) {
      newExpanded.delete(materialId)
    } else {
      newExpanded.add(materialId)
    }
    setExpandedMaterials(newExpanded)
  }

  const handleAddVariacion = (variacionData: Omit<BOMVariacion, "id">) => {
    const newVariacion: BOMVariacion = {
      ...variacionData,
      id: Math.max(0, ...bomVariaciones.map((item) => item.id)) + 1,
    }
    setBomVariaciones([...bomVariaciones, newVariacion])
    setShowForm(false)
  }

  const handleDeleteVariacion = (id: number) => {
    setBomVariaciones(bomVariaciones.filter((item) => item.id !== id))
  }

  const handleCopyFromBase = () => {
    const nuevasVariaciones: BOMVariacion[] = []
    let nextId = Math.max(0, ...bomVariaciones.map((item) => item.id)) + 1

    bomBase.forEach((baseItem) => {
      producto.tallas.forEach((talla: string) => {
        producto.colores.forEach((color: string) => {
          nuevasVariaciones.push({
            id: nextId++,
            materialId: baseItem.materialId,
            material: baseItem.material,
            talla,
            color,
            cantidad: baseItem.cantidad,
          })
        })
      })
    })

    setBomVariaciones(nuevasVariaciones)
  }

  const handleApplyBulkQuantity = () => {
    if (!selectedMaterial || !bulkQuantity) return

    const quantity = Number.parseFloat(bulkQuantity)
    if (isNaN(quantity)) return

    const updatedVariaciones = bomVariaciones.map((variacion) =>
      variacion.materialId === selectedMaterial ? { ...variacion, cantidad: quantity } : variacion,
    )

    setBomVariaciones(updatedVariaciones)
    setBulkQuantity("")
    setSelectedMaterial(null)
  }

  const handleSave = async () => {
    setIsSaving(true)
    console.log("Guardando BOM Variaciones:", bomVariaciones)
    setTimeout(() => {
      setIsSaving(false)
    }, 1000)
  }

  const updateVariacionCantidad = (id: number, cantidad: number) => {
    const updatedVariaciones = bomVariaciones.map((variacion) =>
      variacion.id === id ? { ...variacion, cantidad } : variacion,
    )
    setBomVariaciones(updatedVariaciones)
  }

  // Validaciones
  const getValidationErrors = () => {
    const errors: string[] = []
    const combinaciones = new Set<string>()

    bomVariaciones.forEach((variacion) => {
      const key = `${variacion.materialId}-${variacion.talla}-${variacion.color}`
      if (combinaciones.has(key)) {
        errors.push(`Combinación duplicada: ${variacion.material.nombre} - ${variacion.talla} - ${variacion.color}`)
      }
      combinaciones.add(key)

      if (variacion.cantidad <= 0) {
        errors.push(`Cantidad inválida para ${variacion.material.nombre} - ${variacion.talla} - ${variacion.color}`)
      }
    })

    return errors
  }

  const validationErrors = getValidationErrors()

  return (
    <div className="space-y-4">
      {/* Controles superiores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Variaciones por Talla y Color</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Button onClick={() => setShowForm(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Agregar Combinación
            </Button>
            <Button variant="outline" onClick={handleCopyFromBase} disabled={bomBase.length === 0}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar del BOM Base
            </Button>
          </div>

          {/* Aplicar cantidad a todas */}
          {materialesConVariaciones.length > 0 && (
            <div className="flex gap-2 items-end mb-4 p-4 bg-muted/50 rounded-lg">
              <div className="flex-1">
                <label className="text-sm font-medium mb-1 block">Aplicar cantidad a todas las combinaciones de:</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={selectedMaterial || ""}
                  onChange={(e) => setSelectedMaterial(Number(e.target.value) || null)}
                >
                  <option value="">Seleccionar material</option>
                  {materialesConVariaciones.map((materialId) => {
                    const material = materiales.find((m) => m.id === materialId)
                    return (
                      <option key={materialId} value={materialId}>
                        {material?.nombre}
                      </option>
                    )
                  })}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Cantidad:</label>
                <Input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={bulkQuantity}
                  onChange={(e) => setBulkQuantity(e.target.value)}
                  placeholder="0.00"
                  className="w-24"
                />
              </div>
              <Button onClick={handleApplyBulkQuantity} disabled={!selectedMaterial || !bulkQuantity}>
                Aplicar
              </Button>
            </div>
          )}

          {/* Validaciones */}
          {validationErrors.length > 0 && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                <div className="font-medium mb-1">Se encontraron errores:</div>
                <ul className="list-disc list-inside text-sm">
                  {validationErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}

          {/* Lista de materiales con variaciones */}
          {materialesConVariaciones.length === 0 ? (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground mb-4">No hay variaciones específicas configuradas</p>
              <p className="text-sm text-muted-foreground mb-4">
                Puedes agregar combinaciones manualmente o copiar del BOM base
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {materialesConVariaciones.map((materialId) => {
                const material = materiales.find((m) => m.id === materialId)
                const variaciones = variacionesPorMaterial[materialId]
                const isExpanded = expandedMaterials.has(materialId)

                return (
                  <Collapsible key={materialId} open={isExpanded} onOpenChange={() => toggleMaterial(materialId)}>
                    <Card>
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                              <div>
                                <CardTitle className="text-base">{material?.nombre}</CardTitle>
                                <p className="text-sm text-muted-foreground font-mono">{material?.codigo}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{variaciones.length} combinaciones</Badge>
                              <Badge variant="outline">{material?.categoria}</Badge>
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="rounded-md border">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Talla</TableHead>
                                  <TableHead>Color</TableHead>
                                  <TableHead>Cantidad</TableHead>
                                  <TableHead>Unidad</TableHead>
                                  <TableHead className="w-[80px]">Acciones</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {variaciones.map((variacion) => (
                                  <TableRow key={variacion.id}>
                                    <TableCell>
                                      <Badge variant="outline">{variacion.talla}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Badge variant="outline">{variacion.color}</Badge>
                                    </TableCell>
                                    <TableCell>
                                      <Input
                                        type="number"
                                        step="0.01"
                                        min="0.01"
                                        value={variacion.cantidad}
                                        onChange={(e) =>
                                          updateVariacionCantidad(variacion.id, Number.parseFloat(e.target.value))
                                        }
                                        className="w-20"
                                      />
                                    </TableCell>
                                    <TableCell>{variacion.material.unidad}</TableCell>
                                    <TableCell>
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDeleteVariacion(variacion.id)}
                                        className="text-destructive hover:text-destructive"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </TableCell>
                                  </TableRow>
                                ))}
                              </TableBody>
                            </Table>
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                )
              })}
            </div>
          )}

          {bomVariaciones.length > 0 && (
            <div className="mt-6 flex justify-end">
              <Button onClick={handleSave} disabled={isSaving || validationErrors.length > 0}>
                <Save className="mr-2 h-4 w-4" />
                {isSaving ? "Guardando..." : "Guardar Variaciones"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Formulario para agregar variación */}
      <BOMVariacionForm
        open={showForm}
        onOpenChange={setShowForm}
        onSubmit={handleAddVariacion}
        materiales={materiales}
        tallas={producto.tallas}
        colores={producto.colores}
      />
    </div>
  )
}
