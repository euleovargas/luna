"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"

export default function AdminPage() {
  return (
    <div className="container grid gap-6 py-8">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <p className="text-muted-foreground">
          Gerencie usuários e configurações do sistema.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/admin/users">
          <Card className="hover:bg-muted/50 transition-colors">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.users className="h-5 w-5" />
                Usuários
              </CardTitle>
              <CardDescription>
                Gerencie os usuários do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Visualize, crie, edite e remova usuários.</p>
            </CardContent>
          </Card>
        </Link>

        {/* Placeholder para futuras funcionalidades */}
        <Card className="opacity-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Icons.settings className="h-5 w-5" />
              Configurações
            </CardTitle>
            <CardDescription>
              Configure o sistema
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>Em breve...</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
