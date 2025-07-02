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
import type { Color } from "@/types/api"

interface ColorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: Omit<Color, 'color_id' | 'fecha_creacion' | 'fecha_modificacion' | 'usuario_creacion' | 'usuario_modificacion'>) => void
  initialData?: Color | null
  title: string
  description: string
  readOnly?: boolean
}

export default function ColorForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  readOnly = false,
}: ColorFormProps) {
  const [formData, setFormData] = useState<Omit<Color, 'color_id' | 'fecha_creacion' | 'fecha_modificacion' | 'usuario_creacion' | 'usuario_modificacion'>>({
    nombre_color: "",
    codigo_color: "#000000",
    estado: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof formData>>({})

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          nombre_color: initialData.nombre_color || "",
          codigo_color: initialData.codigo_color || "#000000",
          estado: initialData.estado || true,
        })
      } else {
        setFormData({
          nombre_color: "",
          codigo_color: "#000000",
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

    if (!formData.nombre_color?.trim()) {
      newErrors.nombre_color = "El nombre es requerido"
    }

    if (!formData.codigo_color?.trim()) {
      newErrors.codigo_color = "El código de color es requerido"
    } else if (!/^#[0-9A-F]{6}$/i.test(formData.codigo_color)) {
      newErrors.codigo_color = "El código debe ser un color hexadecimal válido (ej: #FF0000)"
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
      console.error("Error al guardar color:", error)
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
              <Label htmlFor="nombre_color" className="text-right">
                Nombre *
              </Label>
              <div className="col-span-3">
                <Input
                  id="nombre_color"
                  name="nombre_color"
                  value={formData.nombre_color}
                  onChange={handleChange}
                  placeholder="Ej: Azul marino"
                  disabled={readOnly}
                  className={errors.nombre_color ? "border-destructive" : ""}
                />
                {errors.nombre_color && <p className="text-sm text-destructive mt-1">{errors.nombre_color}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="codigo_color" className="text-right">
                Color *
              </Label>
              <div className="col-span-3">
                <div className="flex items-center gap-2">
                  <Input
                    id="codigo_color"
                    name="codigo_color"
                    type="color"
                    value={formData.codigo_color}
                    onChange={handleChange}
                    disabled={readOnly}
                    className="w-16 h-10 p-1 border rounded"
                  />
                  <Input
                    value={formData.codigo_color}
                    onChange={handleChange}
                    name="codigo_color"
                    placeholder="#000000"
                    disabled={readOnly}
                    className={`flex-1 font-mono ${errors.codigo_color ? "border-destructive" : ""}`}
                  />
                </div>
                {errors.codigo_color && <p className="text-sm text-destructive mt-1">{errors.codigo_color}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Use el selector de color o ingrese el código hexadecimal
                </p>
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
