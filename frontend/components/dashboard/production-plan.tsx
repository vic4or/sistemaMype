"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

export default function ProductionPlan() {
  // Datos de ejemplo
  const productionItems = [
    { id: 1, product: "Camisa Casual", plan: 200, completed: 120, deadline: "2023-04-25" },
    { id: 2, product: "Pantalón Jean", plan: 150, completed: 45, deadline: "2023-04-28" },
    { id: 3, product: "Blusa Elegante", plan: 100, completed: 85, deadline: "2023-04-15" },
    { id: 4, product: "Polo Sport", plan: 300, completed: 120, deadline: "2023-05-02" },
  ]

  // Función para formatear fecha
    const formatDate = (dateString: string) => {
    return dateString.split('T')[0]
  }

  // Función para calcular el porcentaje de avance
  const calculateProgress = (completed: number, plan: number) => {
    return Math.round((completed / plan) * 100)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Plan de Producción</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-5">
          {productionItems.map((item) => (
            <div key={item.id} className="space-y-2">
              <div className="flex justify-between">
                <p className="font-medium">{item.product}</p>
                <p className="text-sm text-muted-foreground">Entrega: {formatDate(item.deadline)}</p>
              </div>
              <div className="flex items-center gap-2">
                <Progress value={calculateProgress(item.completed, item.plan)} className="h-2" />
                <span className="text-sm font-medium w-10">{calculateProgress(item.completed, item.plan)}%</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {item.completed} / {item.plan} unidades
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

/*
  Para integración con backend:
  
  import { useEffect, useState } from 'react'
  
  interface ProductionItem {
    id: number
    product: string
    plan: number
    completed: number
    deadline: string
  }
  
  export default function ProductionPlan() {
    const [productionItems, setProductionItems] = useState<ProductionItem[]>([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
      const fetchProductionPlan = async () => {
        try {
          const response = await fetch('/api/production/plan')
          const data = await response.json()
          setProductionItems(data)
        } catch (error) {
          console.error("Error fetching production plan:", error)
        } finally {
          setLoading(false)
        }
      }
      
      fetchProductionPlan()
    }, [])
    
    if (loading) return <div>Cargando plan de producción...</div>
    
    // Resto del componente igual
  }
*/
