"use client"
import type React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  ClipboardList,
  Package,
  ShoppingCart,
  Warehouse,
  Calendar,
  Users,
  Home,
  Settings,
  ArrowUpDown,
  UserCircle,
  Scissors,
  Layers,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuthContext } from "@/contexts/auth-context"

interface SidebarItem {
  icon: React.ComponentType<{ className?: string }>
  label: string
  href: string
  permission: string
  subItems?: { label: string; href: string; permission: string }[]
}

export default function Sidebar() {
  const pathname = usePathname()
  const { canAccess, user } = useAuthContext()

  const items: SidebarItem[] = [
    {
      icon: Home,
      label: "Dashboard",
      href: "/",
      permission: "dashboard:view",
    },
    {
      icon: Package,
      label: "Productos",
      href: "/productos",
      permission: "productos:view",
    },
    {
      icon: Layers,
      label: "BOM",
      href: "/bom",
      permission: "bom:view",
    },
    {
      icon: Warehouse,
      label: "Materiales",
      href: "/inventario",
      permission: "inventario:view",
    },
    {
      icon: ArrowUpDown,
      label: "Movimientos",
      href: "/inventario/movimientos",
      permission: "inventario:view",
    },
    {
      icon: ShoppingCart,
      label: "Compras",
      href: "/compras",
      permission: "compras:view",
    },
    {
      icon: ClipboardList,
      label: "Pedidos",
      href: "/pedidos",
      permission: "pedidos:view",
    },
    {
      icon: Scissors,
      label: "Tizados",
      href: "/tizados",
      permission: "tizados:view",
    },
    {
      icon: Calendar,
      label: "Planificador MRP",
      href: "/mrp",
      permission: "mrp:view",
    },
    {
      icon: Users,
      label: "Proveedores",
      href: "/proveedores",
      permission: "proveedores:view",
    },
    {
      icon: UserCircle,
      label: "Clientes",
      href: "/clientes",
      permission: "clientes:view",
    },
    {
      icon: Settings,
      label: "Configuración",
      href: "/configuracion",
      permission: "configuracion:view",
    },
  ]

  // Filtrar items según permisos
  const filteredItems = items.filter(item => canAccess(item.permission))

  return (
    <div className="w-64 sidebar hidden md:block">
      <div className="font-bold text-xl mb-8 px-4 py-3 border-b border-white/10 text-white">
        Confecciones MRP
      </div>
      <nav className="space-y-1 px-2">
        {filteredItems.map((item) => (
          <div key={item.href} className="flex flex-col">
            <Link
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-4 py-3 text-sm font-medium sidebar-item",
                pathname === item.href ? "active" : "",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          </div>
        ))}
      </nav>
    </div>
  )
}
