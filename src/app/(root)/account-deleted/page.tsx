"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { CustomSession } from "@/types"

export default function AccountDeletedPage() {
  const { data: sessionData } = useSession()
  const session = sessionData as CustomSession
  const router = useRouter()

  useEffect(() => {
    // Se o usuário ainda estiver logado, redireciona para o dashboard
    if (session?.user) {
      router.push("/dashboard")
    }
  }, [session, router])

  return (
    <div className="container flex flex-col items-center justify-center min-h-screen max-w-md text-center space-y-8 py-10">
      <Icons.userX className="h-24 w-24 text-muted-foreground" />
      
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tighter">Conta excluída com sucesso</h1>
        <p className="text-muted-foreground">
          Que pena que você decidiu nos deixar. Esperamos vê-lo novamente em breve!
        </p>
      </div>

      <div className="flex flex-col w-full gap-4">
        <Button asChild>
          <Link href="/login">
            <Icons.logIn className="mr-2 h-4 w-4" />
            Fazer login
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/register">
            <Icons.userPlus className="mr-2 h-4 w-4" />
            Criar nova conta
          </Link>
        </Button>
      </div>
    </div>
  )
}
