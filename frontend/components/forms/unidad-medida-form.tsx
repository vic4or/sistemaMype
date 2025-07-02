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
import type { UnidadMedida } from "@/types/api"

interface UnidadMedidaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: Omit<UnidadMedida, 'unidad_medida_id' | 'fecha_creacion' | 'fecha_modificacion' | 'usuario_creacion' | 'usuario_modificacion'>) => void
  initialData?: UnidadMedida | null
  title: string
  description: string
  readOnly?: boolean
}

export default function UnidadMedidaForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  readOnly = false,
}: UnidadMedidaFormProps) {
  const [formData, setFormData] = useState<Omit<UnidadMedida, 'unidad_medida_id' | 'fecha_creacion' | 'fecha_modificacion' | 'usuario_creacion' | 'usuario_modificacion'>>({
    nombre_unidad: "",
    abreviatura: "",
    estado: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof formData>>({})

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          nombre_unidad: initialData.nombre_unidad || "",
          abreviatura: initialData.abreviatura || "",
          estado: initialData.estado || true,
        })
      } else {
        setFormData({
          nombre_unidad: "",
          abreviatura: "",
          estado: true,
        })
      }
      setErrors({})
    }
  }, [open, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof typeof formData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {}

    if (!formData.nombre_unidad?.trim()) {
      newErrors.nombre_unidad = "El nombre es requerido"
    }

    if (!formData.abreviatura?.trim()) {
      newErrors.abreviatura = "La abreviatura es requerida"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (readOnly || !onSubmit) return

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error al guardar unidad de medida:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[400px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre_unidad" className="text-right">
                Nombre *
              </Label>
              <div className="col-span-3">
                <Input
                  id="nombre_unidad"
                  name="nombre_unidad"
                  value={formData.nombre_unidad}
                  onChange={handleChange}
                  placeholder="Ej: Metro, Kilogramo"
                  disabled={readOnly}
                  className={errors.nombre_unidad ? "border-destructive" : ""}
                />
                {errors.nombre_unidad && <p className="text-sm text-destructive mt-1">{errors.nombre_unidad}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="abreviatura" className="text-right">
                Abreviatura *
              </Label>
              <div className="col-span-3">
                <Input
                  id="abreviatura"
                  name="abreviatura"
                  value={formData.abreviatura}
                  onChange={handleChange}
                  placeholder="Ej: m, kg, und"
                  disabled={readOnly}
                  className={`font-mono ${errors.abreviatura ? "border-destructive" : ""}`}
                />
                {errors.abreviatura && <p className="text-sm text-destructive mt-1">{errors.abreviatura}</p>}
                <p className="text-xs text-muted-foreground mt-1">Abreviatura que aparecerá en los reportes</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {readOnly ? "Cerrar" : "Cancelar"}
            </Button>
            {!readOnly && (
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Guardar"}
              </Button>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
