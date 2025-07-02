"use client"

import type React from "react"

import { usePathname } from "next/navigation"
import Sidebar from "@/components/sidebar"
import Navbar from "@/components/navbar"

interface ConditionalLayoutProps {
  children: React.ReactNode
}

export default function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname()

  // Si está en login, mostrar solo el contenido sin sidebar/navbar
  if (pathname === "/login") {
    return <>{children}</>
  }

  // Para todas las demás páginas, mostrar layout completo
  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 overflow-auto">
        <Navbar />
        <main className="p-4 md:p-6 max-w-7xl mx-auto">{children}</main>
      </div>
    </div>
  )
}
