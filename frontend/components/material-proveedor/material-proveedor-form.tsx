"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { materialesApi } from "@/services/api/materiales"
import { proveedoresApi } from "@/services/api/proveedores"
import { AsociarProveedorDto, MaterialProveedor, Proveedor } from "@/types/api"

const formSchema = z.object({
  proveedor_id: z.number().min(1, "Debe seleccionar un proveedor"),
  precio_compra: z.number().min(0.01, "El precio debe ser mayor a 0"),
  moq_proveedor: z.number().min(1, "El MOQ debe ser mayor a 0"),
})

type FormData = z.infer<typeof formSchema>

interface MaterialProveedorFormProps {
  materialId: number
  proveedor?: MaterialProveedor | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onProveedorSaved: () => void
}

export default function MaterialProveedorForm({
  materialId,
  proveedor,
  open,
  onOpenChange,
  onProveedorSaved,
}: MaterialProveedorFormProps) {
  const [loading, setLoading] = useState(false)
  const [proveedores, setProveedores] = useState<Proveedor[]>([])
  const { toast } = useToast()

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proveedor_id: 0,
      precio_compra: 0,
      moq_proveedor: 1,
    },
  })

  // Cargar catálogos cuando se abre el modal
  useEffect(() => {
    if (open) {
      loadCatalogos()
    }
  }, [open])

  // Cargar datos del proveedor cuando se abre en modo edición
  useEffect(() => {
    if (proveedor && open) {
      form.setValue("proveedor_id", proveedor.proveedor_id || 0)
      form.setValue("precio_compra", proveedor.precio_compra || 0)
      form.setValue("moq_proveedor", proveedor.moq_proveedor || 1)
    }
  }, [proveedor, open, form])

  const loadCatalogos = async () => {
    try {
      const proveedoresData = await proveedoresApi.getAll()
      setProveedores(proveedoresData.filter((p: Proveedor) => p.estado))
    } catch (error) {
      console.error("Error al cargar proveedores:", error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive"
      })
    }
  }

  async function onSubmit(values: FormData) {
    setLoading(true)
    try {
      const proveedorData: AsociarProveedorDto = {
        proveedor_id: values.proveedor_id,
        precio_compra: values.precio_compra,
        moq_proveedor: values.moq_proveedor,
      }

      if (proveedor) {
        // Editar proveedor existente
        await materialesApi.actualizarProveedor(proveedor.mat_prov_id, proveedorData)
        toast({
          title: "Éxito",
          description: "Proveedor actualizado correctamente"
        })
      } else {
        // Crear nuevo proveedor
        await materialesApi.asociarProveedor(materialId, proveedorData)
        toast({
          title: "Éxito", 
          description: "Proveedor asociado correctamente"
        })
      }
      
      handleClose()
      onProveedorSaved()
    } catch (error) {
      console.error("Error al guardar proveedor:", error)
      toast({
        title: "Error",
        description: "No se pudo guardar el proveedor",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    onOpenChange(false)
    form.reset()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {proveedor ? "Editar Proveedor" : "Asociar Nuevo Proveedor"}
          </DialogTitle>
          <DialogDescription>
            {proveedor 
              ? "Modifique las condiciones de compra del proveedor"
              : "Configure las condiciones de compra para este proveedor"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="proveedor_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Proveedor</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    value={field.value.toString()}
                    disabled={!!proveedor} // Deshabilitar en modo edición
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar proveedor" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {proveedores.map((proveedor) => (
                        <SelectItem key={proveedor.proveedor_id} value={proveedor.proveedor_id.toString()}>
                          {proveedor.razon_social} - {proveedor.ruc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="precio_compra"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Precio de Compra</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormDescription>Precio en soles (S/)</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="moq_proveedor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>MOQ (Cantidad Mínima)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="1"
                        placeholder="1"
                        {...field}
                        onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                      />
                    </FormControl>
                    <FormDescription>Cantidad mínima de pedido</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Guardando..." : proveedor ? "Actualizar" : "Asociar Proveedor"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
