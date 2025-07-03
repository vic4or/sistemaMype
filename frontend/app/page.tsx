"use client"

import PedidosPendientes from "@/components/dashboard/pedidos-pendientes"
import BOMsFaltantes from "@/components/dashboard/boms-faltantes"
import UltimosMovimientos from "@/components/dashboard/ultimos-movimientos"
import OrdenesCompra from "@/components/dashboard/ordenes-compra"
import AccesoMRP from "@/components/dashboard/acceso-mrp"
import { useAuthContext } from "@/contexts/auth-context"

export default function Home() {
  const { hasRole } = useAuthContext()
  const isAlmacen = hasRole('almacen')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          {isAlmacen 
            ? "Panel de control del almacén - Movimientos y órdenes de compra"
            : "Resumen ejecutivo del sistema de gestión textil"
          }
        </p>
      </div>

      {isAlmacen ? (
        // Dashboard simplificado para almacén - Solo movimientos y órdenes
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <UltimosMovimientos />
          <OrdenesCompra />
        </div>
      ) : (
        // Dashboard completo para administrador
        <>
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
        </>
      )}
    </div>
  )
}
