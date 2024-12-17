import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { getCurrentUser } from "@/lib/session"
import { ResendVerificationButton } from "@/components/auth/resend-verification-button"

export default async function ResendVerificationPage() {
  const user = await getCurrentUser()

  if (!user?.email) {
    redirect("/login")
  }

  // Se o usuário já está verificado, redireciona
  const dbUser = await db.user.findUnique({
    where: { email: user.email },
    select: { 
      emailVerified: true,
      lastEmailSent: true
    }
  })

  if (dbUser?.emailVerified) {
    redirect("/")
  }

  return (
    <div className="flex h-[calc(100vh-theme(spacing.16))] items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verificação de Email
          </h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de verificação para seu email.
            <br />
            Verifique sua caixa de entrada e spam.
          </p>
        </div>

        <ResendVerificationButton 
          email={user.email} 
          lastEmailSent={dbUser?.lastEmailSent}
        />
      </div>
    </div>
  )
}
