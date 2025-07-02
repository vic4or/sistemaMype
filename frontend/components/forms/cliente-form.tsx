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
import { Textarea } from "@/components/ui/textarea"
import type { Cliente } from "@/types/api"

interface ClienteFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: Partial<Cliente>) => void
  initialData?: Cliente | null
  title: string
  description: string
  readOnly?: boolean
}

export default function ClienteForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  readOnly = false,
}: ClienteFormProps) {
  const [formData, setFormData] = useState<Partial<Cliente>>({
    ruc: "",
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    estado: true,
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Cliente>>({})

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData(initialData)
      } else {
        setFormData({
          ruc: "",
          nombre: "",
          telefono: "",
          email: "",
          direccion: "",
          estado: true,
        })
      }
      setErrors({})
    }
  }, [open, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof Cliente]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  // Manejar input de RUC (solo números, máximo 11 dígitos)
  const handleRucChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 11)
    setFormData((prev) => ({ ...prev, ruc: value }))
    if (errors.ruc) {
      setErrors((prev) => ({ ...prev, ruc: undefined }))
    }
  }

  // Manejar input de teléfono (solo números, máximo 9 dígitos)
  const handleTelefonoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 9)
    setFormData((prev) => ({ ...prev, telefono: value }))
    if (errors.telefono) {
      setErrors((prev) => ({ ...prev, telefono: undefined }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<Cliente> = {}

    if (!formData.ruc?.trim()) {
      newErrors.ruc = "El RUC es requerido"
    } else if (!/^(\d{9}|\d{11})$/.test(formData.ruc)) {
      newErrors.ruc = "El RUC debe tener 9 u 11 dígitos"
    }

    if (!formData.nombre?.trim()) {
      newErrors.nombre = "El nombre es requerido"
    }

    if (!formData.email?.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!formData.telefono?.trim()) {
      newErrors.telefono = "El teléfono es requerido"
    } else if (!/^\d{9}$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono debe tener 9 dígitos"
    }

    if (!formData.direccion?.trim()) {
      newErrors.direccion = "La dirección es requerida"
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
      console.error("Error al guardar cliente:", error)
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
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ruc" className="text-right">
                RUC *
              </Label>
              <div className="col-span-3">
                <Input
                  id="ruc"
                  name="ruc"
                  value={formData.ruc ?? ""}
                  onChange={handleRucChange}
                  placeholder="20123456789 o 123456789"
                  disabled={readOnly}
                  className={errors.ruc ? "border-destructive" : ""}
                  maxLength={11}
                />
                {errors.ruc && <p className="text-sm text-destructive mt-1">{errors.ruc}</p>}
                <p className="text-xs text-muted-foreground mt-1">9 dígitos (persona) u 11 dígitos (empresa)</p>
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre *
              </Label>
              <div className="col-span-3">
                <Input
                  id="nombre"
                  name="nombre"
                  value={formData.nombre ?? ""}
                  onChange={handleChange}
                  placeholder="Nombre de la empresa o persona"
                  disabled={readOnly}
                  className={errors.nombre ? "border-destructive" : ""}
                />
                {errors.nombre && <p className="text-sm text-destructive mt-1">{errors.nombre}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefono" className="text-right">
                Teléfono *
              </Label>
              <div className="col-span-3">
                <Input
                  id="telefono"
                  name="telefono"
                  value={formData.telefono ?? ""}
                  onChange={handleTelefonoChange}
                  placeholder="987654321"
                  disabled={readOnly}
                  className={errors.telefono ? "border-destructive" : ""}
                  maxLength={9}
                />
                {errors.telefono && <p className="text-sm text-destructive mt-1">{errors.telefono}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email *
              </Label>
              <div className="col-span-3">
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email ?? ""}
                  onChange={handleChange}
                  placeholder="contacto@empresa.com"
                  disabled={readOnly}
                  className={errors.email ? "border-destructive" : ""}
                />
                {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
              </div>
            </div>

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="direccion" className="text-right">
                Dirección *
              </Label>
              <div className="col-span-3">
                <Textarea
                  id="direccion"
                  name="direccion"
                  value={formData.direccion ?? ""}
                  onChange={handleChange}
                  placeholder="Dirección completa"
                  disabled={readOnly}
                  rows={3}
                  className={errors.direccion ? "border-destructive" : ""}
                />
                {errors.direccion && <p className="text-sm text-destructive mt-1">{errors.direccion}</p>}
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
