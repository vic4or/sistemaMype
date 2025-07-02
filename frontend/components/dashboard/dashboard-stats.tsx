"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Package, ShoppingCart, DollarSign, Truck } from "lucide-react"

export default function DashboardStats() {
  // Datos de ejemplo
  const stats = [
    {
      title: "Pedidos Pendientes",
      value: "12",
      description: "↗ 8% desde el mes pasado",
      icon: ShoppingCart,
    },
    {
      title: "Ingresos",
      value: "S/. 24,550",
      description: "↗ 15% desde el mes pasado",
      icon: DollarSign,
    },
    {
      title: "Productos",
      value: "87",
      description: "15 con stock bajo",
      icon: Package,
    },
    {
      title: "Entregas",
      value: "8",
      description: "En los próximos 7 días",
      icon: Truck,
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <Card key={index} className="dashboard-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
            <stat.icon className="h-4 w-4 text-empresa-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stat.value}</div>
            <p className="text-xs text-muted-foreground">{stat.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
