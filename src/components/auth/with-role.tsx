"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { UserRole } from "@prisma/client"
import { Icons } from "@/components/ui/icons"
import { CustomSession } from "@/types"

interface WithRoleProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export function WithRole({ children, allowedRoles }: WithRoleProps) {
  const { data: sessionData, status } = useSession()
  const session = sessionData as CustomSession
  const router = useRouter()

  // Enquanto verifica a sessão, mostra loading
  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Icons.spinner className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  // Se não estiver autenticado, redireciona para login
  if (status === "unauthenticated") {
    router.push("/login")
    return null
  }

  // Se não tiver permissão, mostra mensagem de acesso negado
  if (!session?.user?.role || !allowedRoles.includes(session.user.role as UserRole)) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <Icons.warning className="h-12 w-12 text-destructive" />
        <h1 className="text-2xl font-bold">Acesso Negado</h1>
        <p className="text-muted-foreground">
          Você não tem permissão para acessar esta página.
        </p>
        <button
          onClick={() => router.push("/dashboard")}
          className="text-primary hover:underline"
        >
          Voltar para o Dashboard
        </button>
      </div>
    )
  }

  // Se tiver permissão, renderiza o conteúdo
  return <>{children}</>
}

// HOC para ser usado em componentes
export function withRole(Component: React.ComponentType<any>, allowedRoles: UserRole[]) {
  return function WrappedComponent(props: any) {
    return (
      <WithRole allowedRoles={allowedRoles}>
        <Component {...props} />
      </WithRole>
    )
  }
}
