import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { ResendVerificationButton } from "@/components/auth/resend-verification-button"

interface PageProps {
  searchParams: { email?: string }
}

export default async function ResendVerificationPage({ searchParams }: PageProps) {
  const { email } = searchParams

  if (!email) {
    redirect("/register")
  }

  // Verifica se o usuário existe e não está verificado
  const user = await db.user.findUnique({
    where: { email },
    select: { 
      emailVerified: true,
      lastEmailSent: true
    }
  })

  if (!user) {
    redirect("/register")
  }

  if (user.emailVerified) {
    redirect("/login?success=email_verified")
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verificação de Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de verificação para {email}.
            <br />
            Verifique sua caixa de entrada e spam.
          </p>
        </div>

        <ResendVerificationButton 
          email={email} 
          lastEmailSent={user.lastEmailSent}
        />
      </div>
    </div>
  )
}
