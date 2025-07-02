"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

export default function PendingPurchases() {
  // Datos de ejemplo
  const pendingPurchases = [
    {
      id: "OC-2023-001",
      supplier: "TextilPeru S.A.C.",
      material: "Tela Algodón",
      quantity: 200,
      unit: "m",
      deliveryDate: "2023-04-15",
    },
    {
      id: "OC-2023-002",
      supplier: "BotonesMax",
      material: "Botones #3 Negros",
      quantity: 1000,
      unit: "und",
      deliveryDate: "2023-04-10",
    },
    {
      id: "OC-2023-003",
      supplier: "HilosFinos",
      material: "Hilo Negro",
      quantity: 20,
      unit: "rollo",
      deliveryDate: "2023-04-12",
    },
    {
      id: "OC-2023-004",
      supplier: "TextilPeru S.A.C.",
      material: "Tela Jean",
      quantity: 150,
      unit: "m",
      deliveryDate: "2023-04-18",
    },
  ]

  // Función para formatear fecha
    const formatDate = (dateString: string) => {
    return dateString.split('T')[0]
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Compras Pendientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {pendingPurchases.map((purchase) => (
            <div key={purchase.id} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">{purchase.material}</p>
                <p className="text-sm text-muted-foreground">
                  {purchase.supplier} • {purchase.id}
                </p>
              </div>
              <div className="text-right">
                <p className="font-medium">
                  {purchase.quantity} {purchase.unit}
                </p>
                <p className="text-sm text-muted-foreground">Entrega: {formatDate(purchase.deliveryDate)}</p>
              </div>
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
  
  interface PurchaseOrder {
    id: string
    supplier: string
    material: string
    quantity: number
    unit: string
    deliveryDate: string
  }
  
  export default function PendingPurchases() {
    const [pendingPurchases, setPendingPurchases] = useState<PurchaseOrder[]>([])
    const [loading, setLoading] = useState(true)
    
    useEffect(() => {
      const fetchPendingPurchases = async () => {
        try {
          const response = await fetch('/api/purchases/pending')
          const data = await response.json()
          setPendingPurchases(data)
        } catch (error) {
          console.error("Error fetching pending purchases:", error)
        } finally {
          setLoading(false)
        }
      }
      
      fetchPendingPurchases()
    }, [])
    
    if (loading) return <div>Cargando compras pendientes...</div>
    
    // Resto del componente igual
  }
*/
