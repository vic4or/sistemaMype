"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
  nombre: string
  unidad: string
}

interface BOMBaseFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (data: any) => void
  materiales: Material[]
  initialData?: any
  title?: string
}

export default function BOMBaseForm({
  open,
  onOpenChange,
  onSubmit,
  materiales,
  initialData = null,
  title = "Agregar Material Base",
}: BOMBaseFormProps) {
  const [formData, setFormData] = useState({
    materialId: 0,
    materialNombre: "",
    unidad: "",
    cantidad: 0,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Resetear formulario cuando se abre/cierra o cambia initialData
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          materialId: initialData.materialId,
          materialNombre: initialData.material?.nombre || initialData.materialNombre,
          unidad: initialData.material?.unidad || initialData.unidad,
          cantidad: initialData.cantidad,
        })
      } else {
        setFormData({
          materialId: 0,
          materialNombre: "",
          unidad: "",
          cantidad: 0,
        })
      }
    }
  }, [open, initialData])

  const handleMaterialChange = (value: string) => {
    const materialId = Number.parseInt(value)
    const material = materiales.find((m) => m.id === materialId)

    if (material) {
      setFormData({
        ...formData,
        materialId,
        materialNombre: material.nombre,
        unidad: material.unidad,
      })
    }
  }

  const handleCantidadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      cantidad: Number.parseFloat(e.target.value) || 0,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (formData.materialId === 0 || formData.cantidad <= 0) {
      return
    }

    setIsSubmitting(true)

    try {
      // Preparar datos para enviar
      const dataToSubmit = {
        materialId: formData.materialId,
        materialNombre: formData.materialNombre,
        unidad: formData.unidad,
        cantidad: formData.cantidad,
        material: materiales.find((m) => m.id === formData.materialId),
      }

      await onSubmit(dataToSubmit)

      // Resetear formulario
      setFormData({
        materialId: 0,
        materialNombre: "",
        unidad: "",
        cantidad: 0,
      })

      onOpenChange(false)
    } catch (error) {
      console.error("Error al guardar:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>
              {initialData
                ? "Modifique los datos del material."
                : "Seleccione el material y especifique la cantidad necesaria."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="material" className="text-right">
                Material
              </Label>
              <div className="col-span-3">
                <Select value={formData.materialId.toString()} onValueChange={handleMaterialChange} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar material" />
                  </SelectTrigger>
                  <SelectContent>
                    {materiales.map((material) => (
                      <SelectItem key={material.id} value={material.id.toString()}>
                        {material.nombre} ({material.unidad})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="unidad" className="text-right">
                Unidad
              </Label>
              <Input
                id="unidad"
                value={formData.unidad}
                className="col-span-3"
                disabled
                placeholder="Seleccione un material"
              />
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
                onChange={handleCantidadChange}
                className="col-span-3"
                placeholder="0.00"
                required
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || formData.materialId === 0 || formData.cantidad <= 0}>
              {isSubmitting ? "Guardando..." : initialData ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
