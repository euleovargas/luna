import { Metadata } from "next"
import Link from "next/link"
import { ResendVerificationButton } from "@/components/auth/resend-verification-button"

export const metadata: Metadata = {
  title: "Verificar Email",
  description: "Verifique seu email para ativar sua conta",
}

export default function ResendVerificationPage({
  searchParams,
}: {
  searchParams: { email?: string }
}) {
  const { email } = searchParams

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <div className="flex flex-col space-y-2 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Verifique seu email
          </h1>
          <p className="text-sm text-muted-foreground">
            Enviamos um link de verificação para{" "}
            <span className="font-medium text-primary">{email}</span>
          </p>
        </div>

        <ResendVerificationButton email={email} />

        <p className="px-8 text-center text-sm text-muted-foreground">
          <Link href="/login" className="hover:text-brand underline underline-offset-4">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  )
}
