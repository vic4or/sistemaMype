"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calculator, ArrowRight, Zap } from "lucide-react"
import { useRouter } from "next/navigation"

export default function AccesoMRP() {
  const router = useRouter()

  const handleIrAMRP = () => {
    router.push('/mrp')
  }

  return (
    <Card className="relative overflow-hidden">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Planificación MRP
          </CardTitle>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200">
            <Zap className="h-3 w-3 mr-1" />
            Disponible
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Descripción del módulo */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Ejecute el cálculo de requerimientos de materiales para la planificación de producción.
            </p>
            <div className="text-xs text-muted-foreground space-y-0.5">
              <p>• Análisis de demanda de materiales</p>
              <p>• Cálculo de necesidades de compra</p>
              <p>• Optimización de inventarios</p>
            </div>
          </div>

          {/* Acciones rápidas */}
          <div className="space-y-1 pt-1 border-t">
            <Button
              onClick={handleIrAMRP}
              className="w-full bg-blue-600 hover:bg-blue-700 h-8 text-xs"
              size="sm"
            >
              <Calculator className="h-3 w-3 mr-1" />
              Ir al Módulo MRP
              <ArrowRight className="h-3 w-3 ml-1" />
            </Button>
            
            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Planificación de requerimientos de materiales
              </p>
            </div>
          </div>
        </div>
      </CardContent>
      
      {/* Indicador visual de módulo activo */}
      <div className="absolute top-0 right-0 w-1 h-full bg-gradient-to-b from-blue-500 to-blue-600"></div>
    </Card>
  )
} 