"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { LoadingBar } from "./loading-bar"
import { cn } from "@/lib/utils"

export function RouteProgress() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setIsLoading(true)
    const timeout = setTimeout(() => setIsLoading(false), 500)
    return () => clearTimeout(timeout)
  }, [pathname, searchParams])

  return (
    <>
      <LoadingBar />
      {isLoading && (
        <div
          className={cn(
            "fixed inset-0 z-50 bg-background/80 backdrop-blur-sm",
            "animate-in fade-in duration-300",
            "flex items-center justify-center"
          )}
        >
          <div className="w-full max-w-md space-y-4 p-6">
            {/* Skeleton para título */}
            <div className="h-8 w-3/4 animate-pulse rounded-lg bg-muted" />
            
            {/* Skeletons para conteúdo */}
            <div className="space-y-3">
              <div className="h-4 w-full animate-pulse rounded bg-muted" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-muted" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-muted" />
            </div>

            {/* Skeleton para botões/ações */}
            <div className="flex gap-2">
              <div className="h-10 w-1/3 animate-pulse rounded-md bg-muted" />
              <div className="h-10 w-1/3 animate-pulse rounded-md bg-muted" />
            </div>
          </div>
        </div>
      )}
    </>
  )
}
