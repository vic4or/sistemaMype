"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { PlusCircle } from "lucide-react"

export default function NuevoProductoForm() {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    category: "",
    description: "",
    price: "",
    initialStock: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleCategoryChange = (value: string) => {
    setFormData((prev) => ({ ...prev, category: value }))
  }

  // INTEGRACIÓN CON BACKEND USANDO FETCH

  // 1. Agregar estados para manejar la carga y errores
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 2. Modificar la función handleSubmit para realizar la petición al backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      // Convertir valores numéricos
      const dataToSend = {
        ...formData,
        price: formData.price ? Number.parseFloat(formData.price) : 0,
        initialStock: formData.initialStock ? Number.parseInt(formData.initialStock) : 0,
      }

      const response = await fetch("/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        throw new Error("Error al registrar el producto")
      }

      const data = await response.json()
      console.log("Producto registrado:", data)

      // Resetear el formulario y cerrar el diálogo
      setFormData({
        code: "",
        name: "",
        category: "",
        description: "",
        price: "",
        initialStock: "",
      })
      setOpen(false)

      // Mostrar notificación de éxito (requiere un componente de toast)
      // toast({ title: "Éxito", description: "Producto registrado correctamente" })
    } catch (error) {
      console.error("Error:", error)
      setError(error instanceof Error ? error.message : "Error desconocido")

      // Mostrar notificación de error
      // toast({ title: "Error", description: error instanceof Error ? error.message : 'Error desconocido', variant: "destructive" })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 3. Modificar el botón de submit para mostrar estado de carga
  // <Button type="submit" disabled={isSubmitting}>
  //   {isSubmitting ? "Guardando..." : "Guardar"}
  // </Button>

  // 4. Mostrar mensaje de error si existe
  // {error && <p className="text-sm text-destructive mt-2">{error}</p>}

  // INTEGRACIÓN CON AXIOS

  // import axios from 'axios'

  // const handleSubmit = async (e: React.FormEvent) => {
  //   e.preventDefault()
  //   setIsSubmitting(true)
  //   setError(null)
  //
  //   try {
  //     // Convertir valores numéricos
  //     const dataToSend = {
  //       ...formData,
  //       price: formData.price ? parseFloat(formData.price) : 0,
  //       initialStock: formData.initialStock ? parseInt(formData.initialStock) : 0
  //     }
  //
  //     const response = await axios.post('/api/productos', dataToSend)
  //     console.log('Producto registrado:', response.data)
  //
  //     // Resetear el formulario y cerrar el diálogo
  //     setFormData({
  //       code: "",
  //       name: "",
  //       category: "",
  //       description: "",
  //       price: "",
  //       initialStock: "",
  //     })
  //     setOpen(false)
  //   } catch (error) {
  //     console.error('Error:', error)
  //     setError(axios.isAxiosError(error) ? error.response?.data?.message || error.message : 'Error desconocido')
  //   } finally {
  //     setIsSubmitting(false)
  //   }
  // }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Nuevo Producto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Registrar Nuevo Producto</DialogTitle>
            <DialogDescription>
              Complete la información del producto terminado. Haga clic en guardar cuando termine.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                Código
              </Label>
              <Input
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Nombre
              </Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right">
                Categoría
              </Label>
              <Select value={formData.category} onValueChange={handleCategoryChange} required>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="camisas">Camisas</SelectItem>
                  <SelectItem value="pantalones">Pantalones</SelectItem>
                  <SelectItem value="blusas">Blusas</SelectItem>
                  <SelectItem value="polos">Polos</SelectItem>
                  <SelectItem value="vestidos">Vestidos</SelectItem>
                  <SelectItem value="otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Descripción
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="col-span-3"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="price" className="text-right">
                Precio (S/.)
              </Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={handleChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="initialStock" className="text-right">
                Stock Inicial
              </Label>
              <Input
                id="initialStock"
                name="initialStock"
                type="number"
                min="0"
                value={formData.initialStock}
                onChange={handleChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Guardar"}
            </Button>
          </DialogFooter>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </form>
      </DialogContent>
    </Dialog>
  )
}
