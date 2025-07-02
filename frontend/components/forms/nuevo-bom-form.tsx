"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Trash2, PlusCircle, Edit, Check, X, HelpCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Datos de ejemplo para productos y materiales
const productosEjemplo = [
  { id: 1, code: "CAM-001", name: "Camisa Casual Manga Larga" },
  { id: 2, code: "PAN-002", name: "Pantalón Jean Skinny" },
  { id: 3, code: "BLU-001", name: "Blusa Elegante" },
  { id: 4, code: "POL-005", name: "Polo Sport" },
]

const materialesEjemplo = [
  { id: 1, code: "TL-001", name: "Tela Algodón", unit: "m", variesBySize: true, variesByColor: true },
  { id: 2, code: "BT-032", name: "Botones #3 Blancos", unit: "und", variesBySize: true, variesByColor: false },
  { id: 3, code: "HL-002", name: "Hilo Blanco", unit: "rollo", variesBySize: false, variesByColor: true },
  { id: 4, code: "TL-015", name: "Tela Jean", unit: "m", variesBySize: true, variesByColor: true },
  { id: 5, code: "BT-021", name: "Botones #5 Metálicos", unit: "und", variesBySize: true, variesByColor: false },
  { id: 6, code: "HL-005", name: "Hilo Azul", unit: "rollo", variesBySize: false, variesByColor: true },
  { id: 7, code: "ZP-010", name: "Cierre 15cm", unit: "und", variesBySize: true, variesByColor: false },
  { id: 8, code: "ET-001", name: "Etiqueta de marca", unit: "und", variesBySize: false, variesByColor: false },
  { id: 9, code: "BO-001", name: "Bolsa de empaque", unit: "und", variesBySize: false, variesByColor: false },
]

// Tallas disponibles por tipo de producto
const tallasPorProducto: Record<number, string[]> = {
  1: ["XS", "S", "M", "L", "XL", "XXL"], // Camisas
  2: ["28", "30", "32", "34", "36", "38", "40"], // Pantalones
  3: ["XS", "S", "M", "L", "XL"], // Blusas
  4: ["XS", "S", "M", "L", "XL", "XXL"], // Polos
}

// Colores disponibles (ejemplo)
const coloresDisponibles = [
  { id: 1, name: "Blanco", code: "#FFFFFF" },
  { id: 2, name: "Negro", code: "#000000" },
  { id: 3, name: "Azul", code: "#0000FF" },
  { id: 4, name: "Rojo", code: "#FF0000" },
  { id: 5, name: "Verde", code: "#00FF00" },
]

interface MaterialBase {
  materialId: number
  code: string
  name: string
  quantity: string
  unit: string
  variesBySize: boolean
  variesByColor: boolean
}

interface MaterialVariation {
  materialId: number
  talla?: string
  color?: string
  quantity: string
}

export default function NuevoBOMForm() {
  const [open, setOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState("")
  const [materialesBase, setMaterialesBase] = useState<MaterialBase[]>([])
  const [variaciones, setVariaciones] = useState<MaterialVariation[]>([])
  const [tallasSeleccionadas, setTallasSeleccionadas] = useState<string[]>([])
  const [coloresSeleccionados, setColoresSeleccionados] = useState<number[]>([])
  const [currentMaterial, setCurrentMaterial] = useState({
    materialId: "",
    quantity: "",
  })
  const [activeTab, setActiveTab] = useState("base")
  const [editingVariation, setEditingVariation] = useState<{
    materialId: number
    talla?: string
    color?: string
    newQuantity: string
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Efecto para cargar las tallas disponibles cuando cambia el producto
  useEffect(() => {
    if (selectedProduct) {
      const productoId = Number.parseInt(selectedProduct)
      setTallasSeleccionadas([])
      setColoresSeleccionados([])
    } else {
      setTallasSeleccionadas([])
      setColoresSeleccionados([])
    }
  }, [selectedProduct])

  const handleProductChange = useCallback((value: string) => {
    setSelectedProduct(value)
    setMaterialesBase([])
    setVariaciones([])
    setCurrentMaterial({ materialId: "", quantity: "" })
    setActiveTab("base")
  }, [])

  const handleMaterialChange = useCallback((value: string) => {
    setCurrentMaterial((prev) => ({
      ...prev,
      materialId: value,
    }))
  }, [])

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentMaterial((prev) => ({
      ...prev,
      quantity: e.target.value,
    }))
  }, [])

  const addMaterialBase = useCallback(() => {
    if (currentMaterial.materialId && currentMaterial.quantity) {
      const material = materialesEjemplo.find((m) => m.id.toString() === currentMaterial.materialId)
      if (material) {
        const newMaterial: MaterialBase = {
          materialId: Number.parseInt(currentMaterial.materialId),
          code: material.code,
          name: material.name,
          quantity: currentMaterial.quantity,
          unit: material.unit,
          variesBySize: material.variesBySize,
          variesByColor: material.variesByColor,
        }
        setMaterialesBase((prev) => [...prev, newMaterial])
        setCurrentMaterial({ materialId: "", quantity: "" })
        setSuccessMessage("Material agregado correctamente")
        setTimeout(() => setSuccessMessage(null), 3000)
      }
    }
  }, [currentMaterial])

  const removeMaterialBase = useCallback((index: number) => {
    setMaterialesBase((prev) => {
      const updatedMateriales = [...prev]
      const removedMaterial = updatedMateriales[index]
      updatedMateriales.splice(index, 1)

      // Eliminar también las variaciones asociadas a este material
      setVariaciones((prevVariaciones) => prevVariaciones.filter((v) => v.materialId !== removedMaterial.materialId))

      return updatedMateriales
    })
  }, [])

  // Simplificamos la lógica de selección de tallas
  const handleTallaClick = useCallback((talla: string) => {
    setTallasSeleccionadas((prev) => {
      if (prev.includes(talla)) {
        return prev.filter((t) => t !== talla)
      } else {
        return [...prev, talla]
      }
    })
  }, [])

  // Simplificamos la lógica de selección de colores
  const handleColorClick = useCallback((colorId: number) => {
    setColoresSeleccionados((prev) => {
      if (prev.includes(colorId)) {
        return prev.filter((c) => c !== colorId)
      } else {
        return [...prev, colorId]
      }
    })
  }, [])

  // Función para obtener la cantidad para una combinación específica
  const getCantidad = useCallback(
    (materialId: number, talla?: string, colorId?: number) => {
      const material = materialesBase.find((m) => m.materialId === materialId)
      if (!material) return ""

      // Si el material no varía por talla ni color, usar la cantidad base
      if (!material.variesBySize && !material.variesByColor) {
        return material.quantity
      }

      // Buscar una variación específica
      const colorName = colorId ? coloresDisponibles.find((c) => c.id === colorId)?.name : undefined
      const variacion = variaciones.find(
        (v) =>
          v.materialId === materialId &&
          (talla === undefined || v.talla === talla) &&
          (colorName === undefined || v.color === colorName),
      )

      // Si existe una variación, usar su cantidad, de lo contrario usar la cantidad base
      return variacion ? variacion.quantity : material.quantity
    },
    [materialesBase, variaciones],
  )

  // Función para actualizar o agregar una variación
  const updateVariacion = useCallback(
    (materialId: number, talla: string | undefined, colorName: string | undefined, quantity: string) => {
      setVariaciones((prev) => {
        const existingIndex = prev.findIndex(
          (v) =>
            v.materialId === materialId &&
            (talla === undefined || v.talla === talla) &&
            (colorName === undefined || v.color === colorName),
        )

        if (existingIndex >= 0) {
          // Actualizar variación existente
          const updatedVariaciones = [...prev]
          updatedVariaciones[existingIndex] = {
            ...updatedVariaciones[existingIndex],
            quantity,
          }
          return updatedVariaciones
        } else {
          // Agregar nueva variación
          return [
            ...prev,
            {
              materialId,
              talla,
              color: colorName,
              quantity,
            },
          ]
        }
      })

      // Mostrar mensaje de éxito
      setSuccessMessage("Variación actualizada correctamente")
      setTimeout(() => setSuccessMessage(null), 3000)
    },
    [],
  )

  // Función para iniciar la edición de una variación
  const startEditingVariation = useCallback(
    (materialId: number, talla?: string, colorId?: number) => {
      const colorName = colorId ? coloresDisponibles.find((c) => c.id === colorId)?.name : undefined
      const currentQuantity = getCantidad(materialId, talla, colorId)

      setEditingVariation({
        materialId,
        talla,
        color: colorName,
        newQuantity: currentQuantity,
      })
    },
    [getCantidad],
  )

  // Función para guardar la edición de una variación
  const saveEditingVariation = useCallback(() => {
    if (editingVariation) {
      updateVariacion(
        editingVariation.materialId,
        editingVariation.talla,
        editingVariation.color,
        editingVariation.newQuantity,
      )
      setEditingVariation(null)
    }
  }, [editingVariation, updateVariacion])

  // Función para cancelar la edición de una variación
  const cancelEditingVariation = useCallback(() => {
    setEditingVariation(null)
  }, [])

  // Función para manejar el cambio en el valor de la cantidad durante la edición
  const handleEditQuantityChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (editingVariation) {
        setEditingVariation({
          ...editingVariation,
          newQuantity: e.target.value,
        })
      }
    },
    [editingVariation],
  )

  // Función para seleccionar todas las tallas
  const selectAllTallas = useCallback(() => {
    if (selectedProduct) {
      const productoId = Number.parseInt(selectedProduct)
      const tallas = tallasPorProducto[productoId] || []
      setTallasSeleccionadas(tallas)
    }
  }, [selectedProduct])

  // Función para deseleccionar todas las tallas
  const deselectAllTallas = useCallback(() => {
    setTallasSeleccionadas([])
  }, [])

  // Función para seleccionar todos los colores
  const selectAllColores = useCallback(() => {
    setColoresSeleccionados(coloresDisponibles.map((c) => c.id))
  }, [])

  // Función para deseleccionar todos los colores
  const deselectAllColores = useCallback(() => {
    setColoresSeleccionados([])
  }, [])

  // Función para manejar el envío del formulario
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setIsSubmitting(true)
      setError(null)

      try {
        if (!selectedProduct || materialesBase.length === 0) {
          throw new Error("Debe seleccionar un producto y agregar al menos un material base")
        }

        // Preparar datos para enviar
        const bomData = {
          productId: Number.parseInt(selectedProduct),
          materialesBase: materialesBase.map((m) => ({
            materialId: m.materialId,
            quantity: Number.parseFloat(m.quantity),
            variesBySize: m.variesBySize,
            variesByColor: m.variesByColor,
          })),
          variaciones: variaciones.map((v) => ({
            materialId: v.materialId,
            talla: v.talla,
            color: v.color,
            quantity: Number.parseFloat(v.quantity),
          })),
          tallasSeleccionadas,
          coloresSeleccionados,
        }

        console.log("Datos de BOM a enviar:", bomData)

        // Simulación de respuesta exitosa
        console.log("BOM registrado exitosamente")

        // Resetear el formulario y cerrar el diálogo
        setSelectedProduct("")
        setMaterialesBase([])
        setVariaciones([])
        setTallasSeleccionadas([])
        setColoresSeleccionados([])
        setCurrentMaterial({ materialId: "", quantity: "" })
        setActiveTab("base")
        setOpen(false)

        // Mostrar mensaje de éxito
        setSuccessMessage("BOM registrado exitosamente")
        setTimeout(() => setSuccessMessage(null), 3000)
      } catch (error) {
        console.error("Error:", error)
        setError(error instanceof Error ? error.message : "Error desconocido")
      } finally {
        setIsSubmitting(false)
      }
    },
    [selectedProduct, materialesBase, variaciones, tallasSeleccionadas, coloresSeleccionados],
  )

  return (
    <TooltipProvider>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Nuevo BOM
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Crear Nueva Lista de Materiales (BOM)</DialogTitle>
              <DialogDescription>Defina los materiales base y sus variaciones por talla y color.</DialogDescription>
            </DialogHeader>

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded mb-4">
                {successMessage}
              </div>
            )}

            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="product" className="text-right">
                  Producto
                </Label>
                <div className="col-span-3">
                  <Select value={selectedProduct} onValueChange={handleProductChange} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar producto" />
                    </SelectTrigger>
                    <SelectContent>
                      {productosEjemplo.map((product) => (
                        <SelectItem key={product.id} value={product.id.toString()}>
                          {product.code} - {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {selectedProduct && (
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="mb-4">
                    <TabsTrigger value="base">Materiales Base</TabsTrigger>
                    <TabsTrigger value="tallas" disabled={materialesBase.length === 0}>
                      Tallas
                    </TabsTrigger>
                    <TabsTrigger value="colores" disabled={materialesBase.length === 0}>
                      Colores
                    </TabsTrigger>
                    <TabsTrigger
                      value="matriz"
                      disabled={tallasSeleccionadas.length === 0 || coloresSeleccionados.length === 0}
                    >
                      Matriz
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="base">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Agregar Materiales Base</h4>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Agregue los materiales base que componen el producto. Indique si el material varía por
                              talla o color.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      <div className="grid grid-cols-12 gap-2 mb-4">
                        <div className="col-span-6">
                          <Select value={currentMaterial.materialId} onValueChange={handleMaterialChange}>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar material" />
                            </SelectTrigger>
                            <SelectContent>
                              {materialesEjemplo.map((material) => (
                                <SelectItem key={material.id} value={material.id.toString()}>
                                  {material.code} - {material.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-4">
                          <Input
                            type="number"
                            min="0.01"
                            step="0.01"
                            placeholder="Cantidad"
                            value={currentMaterial.quantity}
                            onChange={handleQuantityChange}
                          />
                        </div>
                        <div className="col-span-2">
                          <Button
                            type="button"
                            onClick={addMaterialBase}
                            className="w-full"
                            disabled={!currentMaterial.materialId || !currentMaterial.quantity}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {materialesBase.length > 0 ? (
                        <div className="border rounded-md">
                          <Table>
                            <TableHeader>
                              <TableRow>
                                <TableHead>Código</TableHead>
                                <TableHead>Material</TableHead>
                                <TableHead className="text-right">Cantidad</TableHead>
                                <TableHead>Unidad</TableHead>
                                <TableHead>Varía por Talla</TableHead>
                                <TableHead>Varía por Color</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {materialesBase.map((material, index) => (
                                <TableRow key={index}>
                                  <TableCell className="font-medium">{material.code}</TableCell>
                                  <TableCell>{material.name}</TableCell>
                                  <TableCell className="text-right">{material.quantity}</TableCell>
                                  <TableCell>{material.unit}</TableCell>
                                  <TableCell>
                                    {material.variesBySize ? (
                                      <Badge variant="success">Sí</Badge>
                                    ) : (
                                      <Badge variant="secondary">No</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    {material.variesByColor ? (
                                      <Badge variant="success">Sí</Badge>
                                    ) : (
                                      <Badge variant="secondary">No</Badge>
                                    )}
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => removeMaterialBase(index)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                            </TableBody>
                          </Table>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-muted-foreground">
                          No hay materiales agregados. Agregue al menos un material base.
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="tallas">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Seleccionar Tallas</h4>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={selectAllTallas}>
                            Seleccionar todas
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={deselectAllTallas}>
                            Deseleccionar todas
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <HelpCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Seleccione las tallas para las que desea definir variaciones de materiales.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {tallasPorProducto[Number.parseInt(selectedProduct)]?.map((talla) => (
                          <Button
                            key={talla}
                            type="button"
                            variant={tallasSeleccionadas.includes(talla) ? "default" : "outline"}
                            className="h-auto py-3 justify-between"
                            onClick={() => handleTallaClick(talla)}
                          >
                            <span className="text-lg font-bold">{talla}</span>
                            {tallasSeleccionadas.includes(talla) && <Check className="h-4 w-4 ml-2" />}
                          </Button>
                        ))}
                      </div>
                      {tallasSeleccionadas.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          Seleccione al menos una talla para continuar.
                        </div>
                      )}

                      {tallasSeleccionadas.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Variaciones por Talla</h4>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <HelpCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Defina las cantidades específicas de cada material para cada talla. Haga clic en el
                                  ícono de edición para modificar.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Material</TableHead>
                                  {tallasSeleccionadas.map((talla) => (
                                    <TableHead key={talla} className="text-center">
                                      {talla}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {materialesBase
                                  .filter((m) => m.variesBySize)
                                  .map((material) => (
                                    <TableRow key={material.materialId}>
                                      <TableCell className="font-medium">
                                        {material.name} ({material.unit})
                                      </TableCell>
                                      {tallasSeleccionadas.map((talla) => (
                                        <TableCell key={talla} className="text-center">
                                          {editingVariation &&
                                          editingVariation.materialId === material.materialId &&
                                          editingVariation.talla === talla ? (
                                            <div className="flex items-center space-x-1">
                                              <Input
                                                type="number"
                                                min="0.01"
                                                step="0.01"
                                                value={editingVariation.newQuantity}
                                                onChange={handleEditQuantityChange}
                                                className="w-20 h-8 text-center"
                                              />
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={saveEditingVariation}
                                                className="h-8 w-8 p-0"
                                              >
                                                <Check className="h-4 w-4 text-success" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={cancelEditingVariation}
                                                className="h-8 w-8 p-0"
                                              >
                                                <X className="h-4 w-4 text-destructive" />
                                              </Button>
                                            </div>
                                          ) : (
                                            <div className="flex items-center justify-center">
                                              <span>{getCantidad(material.materialId, talla)}</span>
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => startEditingVariation(material.materialId, talla)}
                                                className="h-8 w-8 p-0 ml-2"
                                              >
                                                <Edit className="h-4 w-4" />
                                              </Button>
                                            </div>
                                          )}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="colores">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Seleccionar Colores</h4>
                        <div className="flex gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={selectAllColores}>
                            Seleccionar todos
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={deselectAllColores}>
                            Deseleccionar todos
                          </Button>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <HelpCircle className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="max-w-xs">
                                Seleccione los colores para los que desea definir variaciones de materiales.
                              </p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {coloresDisponibles.map((color) => (
                          <Button
                            key={color.id}
                            type="button"
                            variant={coloresSeleccionados.includes(color.id) ? "default" : "outline"}
                            className="h-auto py-3 justify-between"
                            onClick={() => handleColorClick(color.id)}
                          >
                            <div className="flex items-center">
                              <div
                                className="w-6 h-6 rounded-full mr-2"
                                style={{ backgroundColor: color.code, border: "1px solid #ccc" }}
                              ></div>
                              <span>{color.name}</span>
                            </div>
                            {coloresSeleccionados.includes(color.id) && <Check className="h-4 w-4 ml-2" />}
                          </Button>
                        ))}
                      </div>
                      {coloresSeleccionados.length === 0 && (
                        <div className="text-center py-4 text-muted-foreground">
                          Seleccione al menos un color para continuar.
                        </div>
                      )}

                      {coloresSeleccionados.length > 0 && (
                        <div className="mt-6">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">Variaciones por Color</h4>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <HelpCircle className="h-4 w-4" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">
                                  Defina las cantidades específicas de cada material para cada color. Haga clic en el
                                  ícono de edición para modificar.
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>

                          <div className="border rounded-md">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead>Material</TableHead>
                                  {coloresSeleccionados.map((colorId) => (
                                    <TableHead key={colorId} className="text-center">
                                      {coloresDisponibles.find((c) => c.id === colorId)?.name}
                                    </TableHead>
                                  ))}
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {materialesBase
                                  .filter((m) => m.variesByColor)
                                  .map((material) => (
                                    <TableRow key={material.materialId}>
                                      <TableCell className="font-medium">
                                        {material.name} ({material.unit})
                                      </TableCell>
                                      {coloresSeleccionados.map((colorId) => {
                                        const colorName = coloresDisponibles.find((c) => c.id === colorId)?.name
                                        const isEditing =
                                          editingVariation &&
                                          editingVariation.materialId === material.materialId &&
                                          editingVariation.color === colorName

                                        return (
                                          <TableCell key={colorId} className="text-center">
                                            {isEditing ? (
                                              <div className="flex items-center space-x-1">
                                                <Input
                                                  type="number"
                                                  min="0.01"
                                                  step="0.01"
                                                  value={editingVariation.newQuantity}
                                                  onChange={handleEditQuantityChange}
                                                  className="w-20 h-8 text-center"
                                                />
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={saveEditingVariation}
                                                  className="h-8 w-8 p-0"
                                                >
                                                  <Check className="h-4 w-4 text-success" />
                                                </Button>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={cancelEditingVariation}
                                                  className="h-8 w-8 p-0"
                                                >
                                                  <X className="h-4 w-4 text-destructive" />
                                                </Button>
                                              </div>
                                            ) : (
                                              <div className="flex items-center justify-center">
                                                <span>{getCantidad(material.materialId, undefined, colorId)}</span>
                                                <Button
                                                  variant="ghost"
                                                  size="icon"
                                                  onClick={() =>
                                                    startEditingVariation(material.materialId, undefined, colorId)
                                                  }
                                                  className="h-8 w-8 p-0 ml-2"
                                                >
                                                  <Edit className="h-4 w-4" />
                                                </Button>
                                              </div>
                                            )}
                                          </TableCell>
                                        )
                                      })}
                                    </TableRow>
                                  ))}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="matriz">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Matriz de Materiales por Talla y Color</h4>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <HelpCircle className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">
                              Defina las cantidades específicas de cada material para cada combinación de talla y color.
                              Haga clic en el ícono de edición para modificar.
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {materialesBase
                        .filter((m) => m.variesBySize && m.variesByColor)
                        .map((material) => (
                          <Card key={material.materialId} className="mb-6">
                            <CardHeader className="pb-2">
                              <CardTitle className="text-lg">{material.name}</CardTitle>
                              <CardDescription>
                                Código: {material.code} | Unidad: {material.unit}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <ScrollArea className="h-[300px]">
                                <div className="border rounded-md">
                                  <Table>
                                    <TableHeader>
                                      <TableRow>
                                        <TableHead className="sticky left-0 bg-background z-10">
                                          Talla / Color
                                        </TableHead>
                                        {coloresSeleccionados.map((colorId) => (
                                          <TableHead key={colorId} className="text-center">
                                            <div className="flex flex-col items-center">
                                              <div
                                                className="w-4 h-4 rounded-full mb-1"
                                                style={{
                                                  backgroundColor: coloresDisponibles.find((c) => c.id === colorId)
                                                    ?.code,
                                                  border: "1px solid #ccc",
                                                }}
                                              ></div>
                                              <span>{coloresDisponibles.find((c) => c.id === colorId)?.name}</span>
                                            </div>
                                          </TableHead>
                                        ))}
                                      </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                      {tallasSeleccionadas.map((talla) => (
                                        <TableRow key={talla}>
                                          <TableCell className="font-medium sticky left-0 bg-background z-10">
                                            {talla}
                                          </TableCell>
                                          {coloresSeleccionados.map((colorId) => {
                                            const colorName = coloresDisponibles.find((c) => c.id === colorId)?.name
                                            const isEditing =
                                              editingVariation &&
                                              editingVariation.materialId === material.materialId &&
                                              editingVariation.talla === talla &&
                                              editingVariation.color === colorName

                                            return (
                                              <TableCell key={colorId} className="text-center">
                                                {isEditing ? (
                                                  <div className="flex items-center space-x-1">
                                                    <Input
                                                      type="number"
                                                      min="0.01"
                                                      step="0.01"
                                                      value={editingVariation.newQuantity}
                                                      onChange={handleEditQuantityChange}
                                                      className="w-20 h-8 text-center"
                                                    />
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={saveEditingVariation}
                                                      className="h-8 w-8 p-0"
                                                    >
                                                      <Check className="h-4 w-4 text-success" />
                                                    </Button>
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={cancelEditingVariation}
                                                      className="h-8 w-8 p-0"
                                                    >
                                                      <X className="h-4 w-4 text-destructive" />
                                                    </Button>
                                                  </div>
                                                ) : (
                                                  <div className="flex items-center justify-center">
                                                    <span>
                                                      {(() => {
                                                        // Buscar variación específica para esta combinación
                                                        const variacion = variaciones.find(
                                                          (v) =>
                                                            v.materialId === material.materialId &&
                                                            v.talla === talla &&
                                                            v.color === colorName,
                                                        )

                                                        if (variacion) {
                                                          return variacion.quantity
                                                        }

                                                        // Buscar variación por talla
                                                        const variacionTalla = variaciones.find(
                                                          (v) =>
                                                            v.materialId === material.materialId &&
                                                            v.talla === talla &&
                                                            !v.color,
                                                        )

                                                        if (variacionTalla) {
                                                          return variacionTalla.quantity
                                                        }

                                                        // Buscar variación por color
                                                        const variacionColor = variaciones.find(
                                                          (v) =>
                                                            v.materialId === material.materialId &&
                                                            !v.talla &&
                                                            v.color === colorName,
                                                        )

                                                        if (variacionColor) {
                                                          return variacionColor.quantity
                                                        }

                                                        // Usar cantidad base
                                                        return material.quantity
                                                      })()}
                                                    </span>
                                                    <Button
                                                      variant="ghost"
                                                      size="icon"
                                                      onClick={() =>
                                                        startEditingVariation(material.materialId, talla, colorId)
                                                      }
                                                      className="h-8 w-8 p-0 ml-2"
                                                    >
                                                      <Edit className="h-4 w-4" />
                                                    </Button>
                                                  </div>
                                                )}
                                              </TableCell>
                                            )
                                          })}
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </div>
                              </ScrollArea>
                            </CardContent>
                          </Card>
                        ))}
                    </div>
                  </TabsContent>
                </Tabs>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
            {error && <p className="text-sm text-destructive mt-2">{error}</p>}
          </form>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  )
}
