"use client"

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useMaterialesLowStock } from "@/hooks/use-materiales"

export default function InventoryLowStock() {
  const { materiales, loading, error } = useMaterialesLowStock()

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inventario - Materiales con Stock Bajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Cargando materiales...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Inventario - Materiales con Stock Bajo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-destructive">Error: {error}</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Inventario - Materiales con Stock Bajo</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {materiales.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">No hay materiales con stock bajo</div>
          ) : (
            materiales.map((item) => (
              <div key={item.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <p className="font-medium">{item.nombre}</p>
                  <p className="text-sm text-muted-foreground">Código: {item.codigo}</p>
                </div>
                <div className="flex items-center gap-2">
                  <p className="text-sm">
                    {item.stock} / {item.stockMinimo} {item.unidadMedida}
                  </p>
                  <Badge variant="destructive" className="text-xs">
                    Bajo
                  </Badge>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
