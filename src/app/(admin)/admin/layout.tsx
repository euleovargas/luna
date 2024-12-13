"use client"

import { WithRole } from "@/components/auth/with-role"
import { UserRole } from "@prisma/client"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <WithRole allowedRoles={[UserRole.ADMIN]}>
      <div className="flex min-h-screen flex-col space-y-6">
        <header className="sticky top-0 z-40 border-b bg-background">
          <div className="container flex h-16 items-center justify-between py-4">
            <div className="flex gap-6 md:gap-10">
              <h1 className="text-2xl font-bold">Painel Administrativo</h1>
            </div>
          </div>
        </header>
        <div className="container grid flex-1 gap-12">
          <main className="flex w-full flex-1 flex-col overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </WithRole>
  )
}
