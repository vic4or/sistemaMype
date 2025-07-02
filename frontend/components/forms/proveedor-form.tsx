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
import type { Proveedor } from "@/types/material-proveedor"

interface ProveedorFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: Partial<Proveedor>) => void
  initialData?: Proveedor | null
  title: string
  description: string
  readOnly?: boolean
}

export default function ProveedorForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  readOnly = false,
}: ProveedorFormProps) {
  const [formData, setFormData] = useState<Partial<Proveedor>>({
    ruc: "",
    razon_social: "",
    telefono: "",
    email: "",
    direccion: "",
    estado: true
  })
  const [leadTimeDias, setLeadTimeDias] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<Proveedor>>({})
  const [errorLeadTimeDias, setErrorLeadTimeDias] = useState<string | undefined>(undefined)

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          ...initialData
        })
        setLeadTimeDias(initialData.lead_time_dias !== undefined && initialData.lead_time_dias !== null ? String(initialData.lead_time_dias) : "");
      } else {
        setFormData({
          ruc: "",
          razon_social: "",
          telefono: "",
          email: "",
          direccion: "",
          estado: true
        })
        setLeadTimeDias("");
      }
      setErrors({})
    }
  }, [open, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "lead_time_dias") {
      setLeadTimeDias(value);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    if (errors[name as keyof Proveedor]) {
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
    const newErrors: Partial<Proveedor> = {}

    if (!formData.ruc?.trim()) {
      newErrors.ruc = "El RUC es requerido"
    } else if (!/^(\d{9}|\d{11})$/.test(formData.ruc)) {
      newErrors.ruc = "El RUC debe tener 9 u 11 dígitos"
    }

    if (!formData.razon_social?.trim()) {
      newErrors.razon_social = "La razón social es requerida"
    }

    if (!formData.telefono?.trim()) {
      newErrors.telefono = "El teléfono es requerido"
    } else if (!/^\d{9}$/.test(formData.telefono)) {
      newErrors.telefono = "El teléfono debe tener 9 dígitos"
    }

    if (!formData.email?.trim()) {
      newErrors.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!formData.direccion?.trim()) {
      newErrors.direccion = "La dirección es requerida"
    }

    // Validar lead_time_dias
    const leadTime = Number(leadTimeDias);
    if (!leadTimeDias || isNaN(leadTime)) {
      setErrorLeadTimeDias("El Lead Time es requerido");
    } else if (leadTime <= 0) {
      setErrorLeadTimeDias("Debe ser un número positivo");
    } else {
      setErrorLeadTimeDias(undefined);
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
      await onSubmit({ ...formData, lead_time_dias: Number(leadTimeDias) })
    } catch (error) {
      console.error("Error al guardar proveedor:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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
              <Label htmlFor="razon_social" className="text-right">
                Razón Social *
              </Label>
              <div className="col-span-3">
                <Input
                  id="razon_social"
                  name="razon_social"
                  value={formData.razon_social ?? ""}
                  onChange={handleChange}
                  placeholder="Nombre de la empresa"
                  disabled={readOnly}
                  className={errors.razon_social ? "border-destructive" : ""}
                />
                {errors.razon_social && <p className="text-sm text-destructive mt-1">{errors.razon_social}</p>}
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

            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="lead_time_dias" className="text-right">
                Lead Time (días) *
              </Label>
              <div className="col-span-3">
                <Input
                  id="lead_time_dias"
                  name="lead_time_dias"
                  type="text"
                  value={leadTimeDias}
                  onChange={handleChange}
                  placeholder="Ej: 7"
                  disabled={readOnly}
                  className={errorLeadTimeDias ? "border-destructive" : ""}
                />
                {errorLeadTimeDias && <p className="text-sm text-destructive mt-1">{errorLeadTimeDias}</p>}
                <p className="text-xs text-muted-foreground mt-1">Días de entrega estimados</p>
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
