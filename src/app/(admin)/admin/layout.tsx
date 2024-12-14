"use client"

import { WithRole } from "@/components/auth/with-role"
import { UserRole } from "@prisma/client"
import Navbar from "@/components/layout/Navbar"
import { useSession } from "next-auth/react"
import { CustomSession } from "@/types"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: sessionData } = useSession()
  const session = sessionData as CustomSession

  const menuItems = [
    { href: "/dashboard", title: "Dashboard" },
    { href: "/admin/users", title: "Usuários" },
    { href: "/profile", title: "Perfil" }
  ]

  return (
    <WithRole allowedRoles={[UserRole.ADMIN]}>
      <div className="flex min-h-screen flex-col">
        <Navbar menuItems={menuItems} />
        <div className="container grid flex-1 gap-12 py-6">
          <main className="flex w-full flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </WithRole>
  )
}
