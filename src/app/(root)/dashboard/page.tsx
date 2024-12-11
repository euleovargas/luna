import { Metadata } from "next"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Dashboard | Luna",
  description: "Bem-vindo ao seu dashboard",
}

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Bem-vindo, {session.user.name}!</h1>
        <p className="text-muted-foreground">
          Este é seu dashboard personalizado. Aqui você poderá gerenciar suas configurações e ver suas atividades.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {/* Card de Perfil */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Seu Perfil</h2>
            <div className="mt-4 space-y-2">
              <p>Nome: {session.user.name}</p>
              <p>Email: {session.user.email}</p>
              <p>Tipo de conta: {session.user.role}</p>
            </div>
          </div>

          {/* Card de Atividades Recentes */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Atividades Recentes</h2>
            <div className="mt-4">
              <p className="text-muted-foreground">
                Suas atividades recentes aparecerão aqui.
              </p>
            </div>
          </div>

          {/* Card de Ações Rápidas */}
          <div className="rounded-lg border bg-card p-6">
            <h2 className="font-semibold">Ações Rápidas</h2>
            <div className="mt-4">
              <p className="text-muted-foreground">
                Ações comuns e atalhos aparecerão aqui.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
