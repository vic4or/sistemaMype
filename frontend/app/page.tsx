import PedidosPendientes from "@/components/dashboard/pedidos-pendientes"
import BOMsFaltantes from "@/components/dashboard/boms-faltantes"
import UltimosMovimientos from "@/components/dashboard/ultimos-movimientos"
import OrdenesCompra from "@/components/dashboard/ordenes-compra"
import AccesoMRP from "@/components/dashboard/acceso-mrp"

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Resumen ejecutivo del sistema de gestión textil
        </p>
      </div>

      {/* Primera fila - Pedidos pendientes, productos sin BOM, planificador MRP */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <PedidosPendientes />
        <BOMsFaltantes />
        <AccesoMRP />
      </div>

      {/* Segunda fila - Últimos movimientos y órdenes de compra */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <UltimosMovimientos />
        <OrdenesCompra />
      </div>
    </div>
  )
}
