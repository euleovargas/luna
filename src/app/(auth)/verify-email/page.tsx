"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Icons } from "@/components/ui/icons"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

export default function VerifyEmailPage() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  return (
    <div className="flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <div className="flex justify-center">
            <div className="rounded-full bg-primary/10 p-3">
              <Icons.mail className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Verifique seu email</CardTitle>
          <CardDescription className="text-center">
            {email ? (
              <>
                Enviamos um link de verificação para <span className="font-medium">{email}</span>.
                Por favor, verifique sua caixa de entrada.
              </>
            ) : (
              "Enviamos um link de verificação para o seu email. Por favor, verifique sua caixa de entrada."
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Não recebeu o email? Verifique sua pasta de spam ou solicite um novo link.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="outline"
            onClick={() => window.location.reload()}
            className="w-full"
          >
            <Icons.refresh className="mr-2 h-4 w-4" />
            Reenviar email
          </Button>
          <Link href="/login" className="w-full">
            <Button variant="ghost" className="w-full">
              <Icons.arrowLeft className="mr-2 h-4 w-4" />
              Voltar para o login
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  )
}
