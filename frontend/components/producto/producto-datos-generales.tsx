"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"

interface Producto {
  id: number
  codigo: string
  nombre: string
  categoria: string
  descripcion: string
  precio: number
  stock: number
  activo: boolean
  estacion: string
  linea: string
  codigoEstilo?: string
  tallas: string[]
  colores: string[]
  imagen: string
}

interface ProductoDatosGeneralesProps {
  producto: Producto
}

export default function ProductoDatosGenerales({ producto }: ProductoDatosGeneralesProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Datos Generales del Producto</CardTitle>
          <CardDescription>Información básica y configuración del producto</CardDescription>
        </div>
        <Button>
          <Edit className="mr-2 h-4 w-4" />
          Editar Datos
        </Button>
      </CardHeader>
      <CardContent>
        <div className="text-center py-12 text-muted-foreground">
          <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="text-lg font-medium mb-2">Formulario de Edición</p>
          <p>El formulario de edición de datos generales se implementará aquí</p>
        </div>
      </CardContent>
    </Card>
  )
}
