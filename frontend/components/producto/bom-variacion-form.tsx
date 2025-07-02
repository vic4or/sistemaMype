"use client"

import type React from "react"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Material {
  id: number
  codigo: string
  nombre: string
  unidad: string
  categoria: string
}

interface BOMVariacionFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  materiales: Material[]
  tallas: string[]
  colores: string[]
}

export default function BOMVariacionForm({
  open,
  onOpenChange,
  onSubmit,
  materiales,
  tallas,
  colores,
}: BOMVariacionFormProps) {
  const [formData, setFormData] = useState({
    materialId: 0,
    talla: "",
    color: "",
    cantidad: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSelectChange = (field: string, value: string) => {
    if (field === "materialId") {
      setFormData({
        ...formData,
        materialId: Number.parseInt(value),
      })
    } else {
      setFormData({
        ...formData,
        [field]: value,
      })
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    const material = materiales.find((m) => m.id === formData.materialId)
    if (!material) return

    try {
      onSubmit({
        materialId: formData.materialId,
        material,
        talla: formData.talla,
        color: formData.color,
        cantidad: formData.cantidad,
      })

      // Reset form
      setFormData({
        materialId: 0,
        talla: "",
        color: "",
        cantidad: 0,
      })
    } catch (error) {
      console.error("Error al guardar:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const isFormValid = () => {
    return formData.materialId !== 0 && formData.talla !== "" && formData.color !== "" && formData.cantidad > 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Agregar Combinación</DialogTitle>
            <DialogDescription>Especifica el material, talla, color y cantidad para esta variación</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="material" className="text-right">
                Material
              </Label>
              <div className="col-span-3">
                <Select onValueChange={(value) => handleSelectChange("materialId", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materiales.map((material) => (
                      <SelectItem key={material.id} value={material.id.toString()}>
                        <div>
                          <div className="font-medium">{material.nombre}</div>
                          <div className="text-xs text-muted-foreground">{material.codigo}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="talla" className="text-right">
                Talla
              </Label>
              <div className="col-span-3">
                <Select onValueChange={(value) => handleSelectChange("talla", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar talla" />
                  </SelectTrigger>
                  <SelectContent>
                    {tallas.map((talla) => (
                      <SelectItem key={talla} value={talla}>
                        {talla}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="color" className="text-right">
                Color
              </Label>
              <div className="col-span-3">
                <Select onValueChange={(value) => handleSelectChange("color", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar color" />
                  </SelectTrigger>
                  <SelectContent>
                    {colores.map((color) => (
                      <SelectItem key={color} value={color}>
                        {color}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cantidad" className="text-right">
                Cantidad
              </Label>
              <Input
                id="cantidad"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.cantidad || ""}
                onChange={(e) => setFormData({ ...formData, cantidad: Number.parseFloat(e.target.value) })}
                className="col-span-3"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !isFormValid()}>
              {isSubmitting ? "Guardando..." : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
