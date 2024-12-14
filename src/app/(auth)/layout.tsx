"use client"

import { Suspense } from "react"
import AuthLoading from "./loading"

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <Suspense fallback={<AuthLoading />}>
      <div className="min-h-screen flex items-center justify-center bg-background">
        {children}
      </div>
    </Suspense>
  )
}
