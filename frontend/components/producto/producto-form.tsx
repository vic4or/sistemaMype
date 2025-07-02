"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Save, Upload } from "lucide-react"

interface ProductoFormProps {
  initialData: any
  onSubmit: (data: any) => void
  isNew: boolean
}

export default function ProductoForm({ initialData, onSubmit, isNew }: ProductoFormProps) {
  const [formData, setFormData] = useState(initialData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target

    if (type === "number") {
      setFormData({
        ...formData,
        [name]: Number.parseFloat(value),
      })
    } else {
      setFormData({
        ...formData,
        [name]: value,
      })
    }
  }

  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    })
  }

  const handleSwitchChange = (checked: boolean) => {
    setFormData({
      ...formData,
      estado: checked,
    })
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Crear URL para preview
      const imageUrl = URL.createObjectURL(file)
      setImagePreview(imageUrl)

      // Guardar archivo en formData
      setFormData({
        ...formData,
        imagen: file,
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      await onSubmit(formData)
    } catch (error) {
      console.error("Error al guardar:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Primera columna */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="codigo">Código de producto</Label>
                <Input
                  id="codigo"
                  name="codigo"
                  placeholder="Ej: P001"
                  value={formData.codigo}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre</Label>
                <Input
                  id="nombre"
                  name="nombre"
                  placeholder="Nombre del producto"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="categoria">Categoría</Label>
                <Select value={formData.categoria} onValueChange={(value) => handleSelectChange("categoria", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Polos">Polos</SelectItem>
                    <SelectItem value="Joggers">Joggers</SelectItem>
                    <SelectItem value="Cafarenas">Cafarenas</SelectItem>
                    <SelectItem value="Pantalones">Pantalones</SelectItem>
                    <SelectItem value="Shorts">Shorts</SelectItem>
                    <SelectItem value="Blusas">Blusas</SelectItem>
                    <SelectItem value="Vestidos">Vestidos</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estacion">Estación</Label>
                <Select
                  value={formData.estacion}
                  onValueChange={(value) => handleSelectChange("estacion", value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar estación" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Verano">Verano</SelectItem>
                    <SelectItem value="Invierno">Invierno</SelectItem>
                    <SelectItem value="Otoño">Otoño</SelectItem>
                    <SelectItem value="Primavera">Primavera</SelectItem>
                    <SelectItem value="Todo el año">Todo el año</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Segunda columna */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="linea">Tipo de prenda</Label>
                <Select value={formData.linea} onValueChange={(value) => handleSelectChange("linea", value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Superior">Prenda Superior (Polos, Blusas, Camisas)</SelectItem>
                    <SelectItem value="Inferior">Prenda Inferior (Pantalones, Shorts, Joggers)</SelectItem>
                    <SelectItem value="Completa">Prenda Completa (Vestidos, Enterizos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="precioVenta">Precio de venta (S/.)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-muted-foreground">S/.</span>
                  <Input
                    id="precioVenta"
                    name="precioVenta"
                    type="number"
                    step="0.01"
                    min="0"
                    className="pl-8"
                    placeholder="0.00"
                    value={formData.precioVenta}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <div className="flex items-center space-x-2">
                  <Switch id="estado" checked={formData.estado} onCheckedChange={handleSwitchChange} />
                  <Label htmlFor="estado" className="cursor-pointer">
                    {formData.estado ? "Activo" : "Inactivo"}
                  </Label>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="imagen">Imagen</Label>
                <div className="grid gap-2">
                  <div className="flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => document.getElementById("imagen")?.click()}
                    >
                      <Upload className="mr-2 h-4 w-4" />
                      Subir imagen
                    </Button>
                    <Input
                      id="imagen"
                      name="imagen"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </div>

                  {imagePreview && (
                    <div className="relative aspect-square w-full max-w-[200px] overflow-hidden rounded-md border">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imagePreview || "/placeholder.svg"}
                        alt="Vista previa"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end space-x-2 border-t px-6 py-4">
          <Button type="submit" disabled={isSubmitting}>
            <Save className="mr-2 h-4 w-4" />
            {isSubmitting ? "Guardando..." : "Guardar producto"}
          </Button>
        </CardFooter>
      </Card>
    </form>
  )
}
