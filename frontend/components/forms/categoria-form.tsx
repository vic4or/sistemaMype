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
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Info } from "lucide-react"
import type { CategoriaMaterial } from "@/types/api"

interface CategoriaFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit?: (data: Omit<CategoriaMaterial, 'categoria_material_id' | 'fecha_creacion' | 'fecha_modificacion' | 'usuario_creacion' | 'usuario_modificacion'>) => void
  initialData?: CategoriaMaterial | null
  title: string
  description: string
  readOnly?: boolean
}

export default function CategoriaForm({
  open,
  onOpenChange,
  onSubmit,
  initialData,
  title,
  description,
  readOnly = false,
}: CategoriaFormProps) {
  const [formData, setFormData] = useState<Omit<CategoriaMaterial, 'categoria_material_id' | 'fecha_creacion' | 'fecha_modificacion' | 'usuario_creacion' | 'usuario_modificacion' | 'porcentaje_merma'>>({
    nombre_categoria: "",
    descripcion: "",
    estado: true,
    tiene_color: false,
    tiene_talla: false,
    varia_cantidad_por_talla: false,
    varia_insumo_por_color: false,
    tiene_merma: false
  })
  const [porcentajeMerma, setPorcentajeMerma] = useState("");
  const [errorPorcentajeMerma, setErrorPorcentajeMerma] = useState<string | undefined>(undefined);

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Partial<typeof formData>>({})

  // Cargar datos iniciales cuando se abre el modal
  useEffect(() => {
    if (open) {
      if (initialData) {
        setFormData({
          nombre_categoria: initialData.nombre_categoria || "",
          descripcion: initialData.descripcion || "",
          estado: initialData.estado || true,
          tiene_color: initialData.tiene_color || false,
          tiene_talla: initialData.tiene_talla || false,
          varia_cantidad_por_talla: initialData.varia_cantidad_por_talla || false,
          varia_insumo_por_color: initialData.varia_insumo_por_color || false,
          tiene_merma: initialData.tiene_merma || false
        })
        setPorcentajeMerma(initialData.porcentaje_merma !== undefined && initialData.porcentaje_merma !== null ? String(initialData.porcentaje_merma) : "");
      } else {
        setFormData({
          nombre_categoria: "",
          descripcion: "",
          estado: true,
          tiene_color: false,
          tiene_talla: false,
          varia_cantidad_por_talla: false,
          varia_insumo_por_color: false,
          tiene_merma: false
        })
        setPorcentajeMerma("");
      }
      setErrors({})
    }
  }, [open, initialData])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    if (name === "porcentaje_merma") {
      // Solo permitir números y punto decimal
      const numericValue = value.replace(/[^\d.]/g, "");
      setPorcentajeMerma(numericValue);
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }))
    }
    // Limpiar error del campo cuando el usuario empiece a escribir
    if (errors[name as keyof typeof formData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }
  }

  const handleSwitchChange = (field: keyof typeof formData, value: boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (field === "tiene_merma" && !value) {
      setPorcentajeMerma("");
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Partial<typeof formData> = {}

    if (!formData.nombre_categoria?.trim()) {
      newErrors.nombre_categoria = "El nombre es requerido"
    }

    if (!formData.descripcion?.trim()) {
      newErrors.descripcion = "La descripción es requerida"
    }

    if (formData.tiene_merma) {
      const porcentaje = Number(porcentajeMerma)
      if (!porcentajeMerma || isNaN(porcentaje)) {
        setErrorPorcentajeMerma("El porcentaje de merma es requerido");
      } else if (porcentaje <= 0) {
        setErrorPorcentajeMerma("Debe ser mayor a 0");
      } else {
        setErrorPorcentajeMerma(undefined);
      }
    } else {
      setErrorPorcentajeMerma(undefined);
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0 && !errorPorcentajeMerma
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (readOnly || !onSubmit) return

    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const dataToSend = {
        ...formData,
        porcentaje_merma: formData.tiene_merma ? Number(porcentajeMerma) : undefined
      }
      await onSubmit(dataToSend)
    } catch (error) {
      console.error("Error al guardar categoría:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
            <DialogDescription>{description}</DialogDescription>
          </DialogHeader>

          <div className="grid gap-6 py-4">
            {/* Información Básica */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Información Básica</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="nombre_categoria" className="text-right">
                    Nombre *
                  </Label>
                  <div className="col-span-3">
                    <Input
                      id="nombre_categoria"
                      name="nombre_categoria"
                      value={formData.nombre_categoria}
                      onChange={handleChange}
                      placeholder="Ej: Telas, Botones, Hilos"
                      disabled={readOnly}
                      className={errors.nombre_categoria ? "border-destructive" : ""}
                    />
                    {errors.nombre_categoria && <p className="text-sm text-destructive mt-1">{errors.nombre_categoria}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="descripcion" className="text-right">
                    Descripción *
                  </Label>
                  <div className="col-span-3">
                    <Textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleChange}
                      placeholder="Descripción de la categoría de material"
                      disabled={readOnly}
                      rows={3}
                      className={errors.descripcion ? "border-destructive" : ""}
                    />
                    {errors.descripcion && <p className="text-sm text-destructive mt-1">{errors.descripcion}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Registro de Materiales */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Configuración de Registro
                </CardTitle>
                <CardDescription>
                  Define qué campos adicionales se mostrarán al registrar materiales de esta categoría
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Requiere Color</Label>
                    <p className="text-sm text-muted-foreground">
                      Los materiales de esta categoría deben registrarse con un color específico
                    </p>
                  </div>
                  <Switch
                    checked={formData.tiene_color}
                    onCheckedChange={(value) => handleSwitchChange("tiene_color", value)}
                    disabled={readOnly}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Requiere Talla</Label>
                    <p className="text-sm text-muted-foreground">
                      Los materiales de esta categoría deben registrarse con una talla específica
                    </p>
                  </div>
                  <Switch
                    checked={formData.tiene_talla}
                    onCheckedChange={(value) => handleSwitchChange("tiene_talla", value)}
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Comportamiento en BOM */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Comportamiento en BOM
                </CardTitle>
                <CardDescription>
                  Define cómo se comportarán los materiales de esta categoría en la Lista de Materiales (BOM)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Varía Cantidad por Talla</Label>
                    <p className="text-sm text-muted-foreground">
                      La cantidad consumida cambia según la talla del producto final
                    </p>
                  </div>
                  <Switch
                    checked={formData.varia_cantidad_por_talla}
                    onCheckedChange={(value) => handleSwitchChange("varia_cantidad_por_talla", value)}
                    disabled={readOnly}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">Varía Material por Color</Label>
                    <p className="text-sm text-muted-foreground">
                      El material específico cambia según el color del producto final
                    </p>
                  </div>
                  <Switch
                    checked={formData.varia_insumo_por_color}
                    onCheckedChange={(value) => handleSwitchChange("varia_insumo_por_color", value)}
                    disabled={readOnly}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Merma */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Configuración de Merma
                </CardTitle>
                <CardDescription>
                  Define cómo se manejará la merma en la categoría de materiales
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="text-base">¿Tiene Merma?</Label>
                    <p className="text-sm text-muted-foreground">
                      Si está activo, se solicitará el porcentaje de merma al crear materiales de esta categoría
                    </p>
                  </div>
                  <Switch
                    checked={formData.tiene_merma}
                    onCheckedChange={(value) => handleSwitchChange("tiene_merma", value)}
                    disabled={readOnly}
                  />
                </div>

                {formData.tiene_merma && (
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="porcentaje_merma" className="text-right">
                      % Merma
                    </Label>
                    <div className="col-span-3">
                      <Input
                        id="porcentaje_merma"
                        name="porcentaje_merma"
                        type="number"
                        min={0.01}
                        step={0.01}
                        value={porcentajeMerma}
                        onChange={handleChange}
                        placeholder="Ej: 2.5"
                        disabled={readOnly}
                        className={errorPorcentajeMerma ? "border-destructive" : ""}
                      />
                      {errorPorcentajeMerma && <p className="text-sm text-destructive mt-1">{errorPorcentajeMerma}</p>}
                      <p className="text-xs text-muted-foreground mt-1">Porcentaje de merma aplicado a los materiales de esta categoría</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Vista Previa del Comportamiento */}
            {(formData.tiene_color ||
              formData.tiene_talla ||
              formData.varia_cantidad_por_talla ||
              formData.varia_insumo_por_color) && (
              <Card className="bg-blue-50 dark:bg-blue-950/20">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base text-blue-700 dark:text-blue-300">Vista Previa</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <p className="font-medium">Al registrar materiales de "{formData.nombre_categoria}":</p>
                    <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                      {formData.tiene_color && <li>Se mostrará selector de color</li>}
                      {formData.tiene_talla && <li>Se mostrará selector de talla</li>}
                    </ul>

                    {(formData.varia_cantidad_por_talla || formData.varia_insumo_por_color) && (
                      <>
                        <p className="font-medium mt-3">En el configurador de BOM:</p>
                        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                          {formData.varia_cantidad_por_talla && (
                            <li>Permitirá definir cantidades diferentes por talla</li>
                          )}
                          {formData.varia_insumo_por_color && <li>Se considerará específico por color del producto</li>}
                        </ul>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
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
