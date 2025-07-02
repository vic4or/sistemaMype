"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface Producto {
  tallas: string[]
  colores: string[]
}

interface BOMItem {
  materialCode: string
  materialName: string
  unit: string
  variaciones: {
    [talla: string]: {
      [color: string]: number
    }
  }
}

interface ProductoBOMFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: BOMItem) => void
  initialData?: BOMItem | null
  producto: Producto
  title: string
  description: string
}

export default function ProductoBOMForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  producto,
  title,
  description,
}: ProductoBOMFormProps) {
  const [formData, setFormData] = useState<BOMItem>({
    materialCode: "",
    materialName: "",
    unit: "",
    variaciones: {},
  })

  const [isSubmitting, setIsSubmitting] = useState(false)

  // Materiales disponibles (esto vendría de una API)
  const materialesDisponibles = [
    { code: "TEL-001", name: "Tela Algodón Premium", unit: "metros" },
    { code: "TEL-002", name: "Tela Poliéster", unit: "metros" },
    { code: "HIL-001", name: "Hilo Poliéster", unit: "metros" },
    { code: "HIL-002", name: "Hilo Algodón", unit: "metros" },
    { code: "BOT-001", name: "Botones Plásticos", unit: "unidades" },
    { code: "BOT-002", name: "Botones Metálicos", unit: "unidades" },
    { code: "CIE-001", name: "Cierre Metálico", unit: "unidades" },
    { code: "ETI-001", name: "Etiquetas", unit: "unidades" },
  ]

  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData)
      } else {
        // Inicializar variaciones vacías
        const variacionesIniciales: { [talla: string]: { [color: string]: number } } = {}
        producto.tallas.forEach((talla) => {
          variacionesIniciales[talla] = {}
          producto.colores.forEach((color) => {
            variacionesIniciales[talla][color] = 0
          })
        })

        setFormData({
          materialCode: "",
          materialName: "",
          unit: "",
          variaciones: variacionesIniciales,
        })
      }
    }
  }, [open, initialData, producto])

  const handleMaterialChange = (materialCode: string) => {
    const material = materialesDisponibles.find((m) => m.code === materialCode)
    if (material) {
      setFormData((prev) => ({
        ...prev,
        materialCode: material.code,
        materialName: material.name,
        unit: material.unit,
      }))
    }
  }

  const handleVariacionChange = (talla: string, color: string, value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setFormData((prev) => ({
      ...prev,
      variaciones: {
        ...prev.variaciones,
        [talla]: {
          ...prev.variaciones[talla],
          [color]: numValue,
        },
      },
    }))
  }

  const aplicarATodas = (valor: string) => {
    const numValue = Number.parseFloat(valor) || 0
    const nuevasVariaciones = { ...formData.variaciones }

    Object.keys(nuevasVariaciones).forEach((talla) => {
      Object.keys(nuevasVariaciones[talla]).forEach((color) => {
        nuevasVariaciones[talla][color] = numValue
      })
    })

    setFormData((prev) => ({
      ...prev,
      variaciones: nuevasVariaciones,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.materialCode || !formData.materialName) {
      return
    }

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error al guardar BOM:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Selección de material */}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="material" className="text-right">
                Material *
              </Label>
              <div className="col-span-3">
                <Select value={formData.materialCode} onValueChange={handleMaterialChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materialesDisponibles.map((material) => (
                      <SelectItem key={material.code} value={material.code}>
                        {material.code} - {material.name} ({material.unit})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Aplicar cantidad a todas las variaciones */}
            {formData.materialCode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cantidades por Variación</CardTitle>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="aplicarTodas">Aplicar a todas:</Label>
                    <Input
                      id="aplicarTodas"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      className="w-32"
                      onChange={(e) => aplicarATodas(e.target.value)}
                    />
                    <Badge variant="outline">{formData.unit}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {producto.tallas.map((talla) => (
                      <div key={talla} className="space-y-2">
                        <h4 className="font-medium">Talla {talla}</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {producto.colores.map((color) => (
                            <div key={`${talla}-${color}`} className="space-y-1">
                              <Label className="text-sm">{color}</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                value={formData.variaciones[talla]?.[color] || 0}
                                onChange={(e) => handleVariacionChange(talla, color, e.target.value)}
                                className="text-sm"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.materialCode}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
