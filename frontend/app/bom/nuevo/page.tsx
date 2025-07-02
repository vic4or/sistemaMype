"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ChevronLeft, ChevronRight, Save, CheckCircle } from "lucide-react"
import { toast } from "sonner"
import BOMPaso1MaterialesComunes from "@/components/bom/bom-paso1-materiales-comunes"
import BOMPaso2InsumosVariables from "@/components/bom/bom-paso2-insumos-variables"
import BOMPaso3ConsumoPorTalla from "@/components/bom/bom-paso3-consumo-por-talla"

interface Producto {
  id: number
  codigo: string
  nombre: string
  categoria: string
  estacion: string
  linea: string
  combinaciones: Combinacion[]
}

interface Combinacion {
  id: string
  tallaId: number
  colorId: number
  tallaNombre: string
  colorNombre: string
  colorHex: string
}

export default function NuevoBOMPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const productoIdParam = searchParams.get("producto")

  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedProducto, setSelectedProducto] = useState<Producto | null>(null)

  // Estados para cada paso
  const [materialesComunes, setMaterialesComunes] = useState<any[]>([])
  const [insumosVariables, setInsumosVariables] = useState<any[]>([])
  const [consumoPorTalla, setConsumoPorTalla] = useState<any[]>([])

  // Datos de ejemplo
  const productos: Producto[] = [
    {
      id: 1,
      codigo: "POL001",
      nombre: "Polo Básico Algodón",
      categoria: "polos",
      estacion: "verano",
      linea: "superior",
      combinaciones: [
        { id: "1-1", tallaId: 1, colorId: 1, tallaNombre: "S", colorNombre: "Blanco", colorHex: "#FFFFFF" },
        { id: "1-2", tallaId: 1, colorId: 2, tallaNombre: "S", colorNombre: "Negro", colorHex: "#000000" },
        { id: "1-3", tallaId: 1, colorId: 3, tallaNombre: "S", colorNombre: "Rojo", colorHex: "#DC2626" },
        { id: "2-1", tallaId: 2, colorId: 1, tallaNombre: "M", colorNombre: "Blanco", colorHex: "#FFFFFF" },
        { id: "2-2", tallaId: 2, colorId: 2, tallaNombre: "M", colorNombre: "Negro", colorHex: "#000000" },
        { id: "2-3", tallaId: 2, colorId: 3, tallaNombre: "M", colorNombre: "Rojo", colorHex: "#DC2626" },
        { id: "3-1", tallaId: 3, colorId: 1, tallaNombre: "L", colorNombre: "Blanco", colorHex: "#FFFFFF" },
        { id: "3-2", tallaId: 3, colorId: 2, tallaNombre: "L", colorNombre: "Negro", colorHex: "#000000" },
        { id: "3-3", tallaId: 3, colorId: 3, tallaNombre: "L", colorNombre: "Rojo", colorHex: "#DC2626" },
      ],
    },
  ]

  // Cargar producto si viene en la URL
  useEffect(() => {
    if (productoIdParam) {
      const productoId = Number.parseInt(productoIdParam)
      const producto = productos.find((p) => p.id === productoId)
      if (producto) {
        setSelectedProducto(producto)
      }
    }
  }, [productoIdParam])

  const steps = [
    {
      number: 1,
      title: "Materiales Comunes",
      description: "Seleccione materiales base por categoría",
      completed: materialesComunes.length > 0,
    },
    {
      number: 2,
      title: "Insumos Variables",
      description: "Configure mapeo por color del producto",
      completed: insumosVariables.length > 0,
    },
    {
      number: 3,
      title: "Consumo por Talla",
      description: "Defina cantidades por talla del producto",
      completed: consumoPorTalla.length > 0,
    },
  ]

  const currentStepData = steps[currentStep - 1]
  const progress = (currentStep / steps.length) * 100

  const canGoNext = () => {
    switch (currentStep) {
      case 1:
        return materialesComunes.length > 0
      case 2:
        return true // Paso opcional
      case 3:
        return true // Último paso
      default:
        return false
    }
  }

  const canGoPrevious = () => {
    return currentStep > 1
  }

  const handleNext = () => {
    if (currentStep < steps.length && canGoNext()) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (canGoPrevious()) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleFinish = async () => {
    if (!selectedProducto) {
      toast.error("Debe seleccionar un producto")
      return
    }

    setIsSubmitting(true)
    try {
      // Simular guardado
      await new Promise((resolve) => setTimeout(resolve, 1000))
      toast.success("BOM guardado correctamente")
      router.push("/bom")
    } catch (error) {
      toast.error("Error al guardar el BOM")
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStepContent = () => {
    if (!selectedProducto) return null

    switch (currentStep) {
      case 1:
        return (
          <BOMPaso1MaterialesComunes
            producto={selectedProducto}
            materialesComunes={materialesComunes}
            setMaterialesComunes={setMaterialesComunes}
          />
        )
      case 2:
        return (
          <BOMPaso2InsumosVariables
            producto={selectedProducto}
            insumosVariables={insumosVariables}
            setInsumosVariables={setInsumosVariables}
          />
        )
      case 3:
        return (
          <BOMPaso3ConsumoPorTalla
            producto={selectedProducto}
            materialesComunes={materialesComunes}
            insumosVariables={insumosVariables}
            consumoPorTalla={consumoPorTalla}
            setConsumoPorTalla={setConsumoPorTalla}
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo BOM - Wizard</h1>
          <p className="text-muted-foreground">Configure la Lista de Materiales paso a paso</p>
        </div>
        <Button variant="outline" onClick={() => router.push("/bom")}>
          Volver a BOM
        </Button>
      </div>

      {/* Selección de Producto */}
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar Producto</CardTitle>
          <CardDescription>Elija el producto para el cual desea crear el BOM</CardDescription>
        </CardHeader>
        <CardContent>
          {selectedProducto ? (
            <div className="bg-muted/50 p-4 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium text-lg">{selectedProducto.nombre}</h3>
                  <p className="text-sm text-muted-foreground">Código: {selectedProducto.codigo}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">{selectedProducto.categoria}</Badge>
                  <Badge variant="outline">{selectedProducto.estacion}</Badge>
                  <Badge variant="outline">{selectedProducto.linea}</Badge>
                </div>
              </div>
              <div className="mt-2">
                <p className="text-sm">
                  <span className="font-medium">{selectedProducto.combinaciones.length}</span> combinaciones de talla y
                  color (3 tallas × 3 colores)
                </p>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => setSelectedProducto(null)}>
                  Cambiar Producto
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid gap-2">
                {productos.map((producto) => (
                  <div
                    key={producto.id}
                    className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedProducto(producto)}
                  >
                    <div>
                      <div className="font-medium">{producto.nombre}</div>
                      <div className="text-sm text-muted-foreground">Código: {producto.codigo}</div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant="outline">{producto.categoria}</Badge>
                      <Badge variant="outline">{producto.combinaciones.length} combinaciones</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProducto && (
        <>
          {/* Progress y Steps */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">Progreso del BOM</h3>
                  <span className="text-sm text-muted-foreground">
                    Paso {currentStep} de {steps.length}
                  </span>
                </div>
                <Progress value={progress} className="w-full" />
                <div className="grid grid-cols-3 gap-4">
                  {steps.map((step) => (
                    <div
                      key={step.number}
                      className={`p-3 rounded-lg border ${
                        step.number === currentStep
                          ? "border-primary bg-primary/5"
                          : step.completed
                            ? "border-green-200 bg-green-50"
                            : "border-muted bg-muted/30"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        {step.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-medium ${
                              step.number === currentStep
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                            }`}
                          >
                            {step.number}
                          </div>
                        )}
                        <div>
                          <div className="font-medium text-sm">{step.title}</div>
                          <div className="text-xs text-muted-foreground">{step.description}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenido del Paso Actual */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStepData.completed ? "bg-green-100 text-green-700" : "bg-primary text-primary-foreground"
                  }`}
                >
                  {currentStepData.completed ? <CheckCircle className="h-4 w-4" /> : currentStep}
                </div>
                {currentStepData.title}
              </CardTitle>
              <CardDescription>{currentStepData.description}</CardDescription>
            </CardHeader>
            <CardContent>{renderStepContent()}</CardContent>
          </Card>

          {/* Navegación */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={handlePrevious} disabled={!canGoPrevious()}>
              <ChevronLeft className="mr-2 h-4 w-4" />
              Anterior
            </Button>

            <div className="flex gap-2">
              {currentStep < steps.length ? (
                <Button onClick={handleNext} disabled={!canGoNext()}>
                  Siguiente
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              ) : (
                <Button onClick={handleFinish} disabled={isSubmitting}>
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Guardando..." : "Finalizar BOM"}
                </Button>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
