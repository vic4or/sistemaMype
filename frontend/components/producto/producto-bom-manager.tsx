"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Package, Layers } from "lucide-react"
import BOMBase from "./bom-base"
import BOMVariaciones from "./bom-variaciones"

interface Producto {
  id: number
  codigo: string
  nombre: string
  tallas: string[]
  colores: string[]
}

interface Material {
  id: number
  codigo: string
  nombre: string
  unidad: string
  categoria: string
}

interface BOMBaseItem {
  id: number
  materialId: number
  material: Material
  cantidad: number
}

interface BOMVariacion {
  id: number
  materialId: number
  material: Material
  talla: string
  color: string
  cantidad: number
}

interface ProductoBOMManagerProps {
  producto: Producto
}

export default function ProductoBOMManager({ producto }: ProductoBOMManagerProps) {
  const [bomBase, setBomBase] = useState<BOMBaseItem[]>([])
  const [bomVariaciones, setBomVariaciones] = useState<BOMVariacion[]>([])
  const [activeSubTab, setActiveSubTab] = useState("bom-base")

  // Datos de ejemplo de materiales
  const materiales: Material[] = [
    { id: 1, codigo: "TEL-001", nombre: "Tela Algodón Premium", unidad: "m", categoria: "Telas" },
    { id: 2, codigo: "HIL-001", nombre: "Hilo Poliéster", unidad: "m", categoria: "Hilos" },
    { id: 3, codigo: "BOT-001", nombre: "Botón Plástico 15mm", unidad: "und", categoria: "Botones" },
    { id: 4, codigo: "CIE-001", nombre: "Cierre Metálico 20cm", unidad: "und", categoria: "Cierres" },
    { id: 5, codigo: "ELA-001", nombre: "Elástico 2cm", unidad: "m", categoria: "Elásticos" },
  ]

  useEffect(() => {
    // Cargar datos de ejemplo del BOM
    setBomBase([
      {
        id: 1,
        materialId: 1,
        material: materiales[0],
        cantidad: 1.5,
      },
      {
        id: 2,
        materialId: 2,
        material: materiales[1],
        cantidad: 10,
      },
      {
        id: 3,
        materialId: 3,
        material: materiales[2],
        cantidad: 8,
      },
    ])

    setBomVariaciones([
      {
        id: 1,
        materialId: 1,
        material: materiales[0],
        talla: "S",
        color: "Blanco",
        cantidad: 1.2,
      },
      {
        id: 2,
        materialId: 1,
        material: materiales[0],
        talla: "M",
        color: "Blanco",
        cantidad: 1.4,
      },
      {
        id: 3,
        materialId: 1,
        material: materiales[0],
        talla: "L",
        color: "Blanco",
        cantidad: 1.6,
      },
    ])
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Materiales (BOM)</CardTitle>
        <CardDescription>Gestiona los materiales necesarios para producir {producto.nombre}</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeSubTab} onValueChange={setActiveSubTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="bom-base" className="flex items-center gap-2">
              <Package className="h-4 w-4" />
              BOM Base
            </TabsTrigger>
            <TabsTrigger value="bom-variaciones" className="flex items-center gap-2">
              <Layers className="h-4 w-4" />
              BOM por Talla y Color
            </TabsTrigger>
          </TabsList>

          <TabsContent value="bom-base">
            <BOMBase bomBase={bomBase} setBomBase={setBomBase} materiales={materiales} producto={producto} />
          </TabsContent>

          <TabsContent value="bom-variaciones">
            <BOMVariaciones
              bomBase={bomBase}
              bomVariaciones={bomVariaciones}
              setBomVariaciones={setBomVariaciones}
              materiales={materiales}
              producto={producto}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
