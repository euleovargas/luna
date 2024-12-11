import { Metadata } from "next"
import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Login | Luna",
  description: "Faça login na sua conta",
}

export default function LoginPage() {
  return (
    <div className="flex w-full min-h-screen">
      {/* Lado esquerdo - Hero */}
      <div className="relative hidden w-1/2 lg:flex flex-col bg-primary">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/90 to-violet-600/90" />
        
        {/* Logo e nome */}
        <div className="relative z-20 flex items-center text-2xl font-semibold text-primary-foreground p-8">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-3 h-8 w-8"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Luna Platform
        </div>

        {/* Padrão de fundo */}
        <div className="absolute inset-0 z-10 opacity-5">
          <svg className="h-full w-full" viewBox="0 0 100 100">
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="currentColor" strokeWidth="0.5"/>
            </pattern>
            <rect width="100" height="100" fill="url(#grid)" />
          </svg>
        </div>
      </div>

      {/* Lado direito - Formulário */}
      <div className="flex flex-col items-center justify-center w-full lg:w-1/2 p-8">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">

          <LoginForm />

        </div>
      </div>
    </div>
  )
}
