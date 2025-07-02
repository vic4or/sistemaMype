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
import type { Talla } from "@/types/api"

interface TallaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: Omit<Talla, 'talla_id' | 'fecha_creacion' | 'fecha_modificacion' | 'usuario_creacion' | 'usuario_modificacion'>) => void
  initialData?: Talla | null
  title: string
  description: string
  readOnly?: boolean
}

export default function TallaForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  readOnly = false,
}: TallaFormProps) {
  const [formData, setFormData] = useState<Omit<Talla, 'talla_id' | 'fecha_creacion' | 'fecha_modificacion' | 'usuario_creacion' | 'usuario_modificacion'>>({
    valor_talla: "",
    estado: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof formData>>({})

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          valor_talla: initialData.valor_talla || "",
          estado: initialData.estado || true,
        })
      } else {
        setFormData({
          valor_talla: "",
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

    if (!formData.valor_talla?.trim()) {
      newErrors.valor_talla = "El valor de la talla es requerido"
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
      console.error("Error al guardar talla:", error)
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
              <Label htmlFor="valor_talla" className="text-right">
                Valor *
              </Label>
              <div className="col-span-3">
                <Input
                  id="valor_talla"
                  name="valor_talla"
                  value={formData.valor_talla}
                  onChange={handleChange}
                  placeholder="Ej: XL, 32, 40"
                  disabled={readOnly}
                  className={errors.valor_talla ? "border-destructive" : ""}
                />
                {errors.valor_talla && <p className="text-sm text-destructive mt-1">{errors.valor_talla}</p>}
                <p className="text-xs text-muted-foreground mt-1">
                  Puede usar letras (XS, S, M, L) o números (28, 30, 32)
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
