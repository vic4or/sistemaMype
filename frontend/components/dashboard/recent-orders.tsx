import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function RecentOrders() {
  // Datos de ejemplo
  const orders = [
    {
      id: "PED-2023-001",
      customer: "Tiendas Comercial S.A.",
      date: "2023-04-01",
      total: 5600,
      status: "En Proceso",
    },
    {
      id: "PED-2023-002",
      customer: "Boutique Eleganza",
      date: "2023-04-02",
      total: 3200,
      status: "Pendiente",
    },
    {
      id: "PED-2023-003",
      customer: "ModaExpress",
      date: "2023-04-03",
      total: 4800,
      status: "Completado",
    },
    {
      id: "PED-2023-004",
      customer: "TrendsStore",
      date: "2023-04-05",
      total: 2100,
      status: "En Proceso",
    },
    {
      id: "PED-2023-005",
      customer: "Fashion Center",
      date: "2023-04-05",
      total: 3600,
      status: "Pendiente",
    },
  ]

  // Función para formatear fecha
    const formatDate = (dateString: string) => {
    return dateString.split('T')[0]
  }

  // Función para determinar el color del badge según el status
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case "Completado":
        return "success"
      case "En Proceso":
        return "warning"
      case "Pendiente":
        return "secondary"
      default:
        return "default"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pedidos Recientes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="flex items-center justify-between border-b pb-2">
              <div>
                <p className="font-medium">{order.customer}</p>
                <p className="text-sm text-muted-foreground">
                  {order.id} • {formatDate(order.date)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <p className="font-medium">S/. {order.total.toFixed(2)}</p>
                <Badge variant={getBadgeVariant(order.status) as any} className="text-xs">
                  {order.status}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
