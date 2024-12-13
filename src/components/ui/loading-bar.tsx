"use client"

import { useEffect, useState } from "react"
import { usePathname, useSearchParams } from "next/navigation"
import { cn } from "@/lib/utils"

export function LoadingBar() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [timeoutId, setTimeoutId] = useState<NodeJS.Timeout | null>(null)

  useEffect(() => {
    // Reseta o estado quando a rota muda
    setLoading(true)
    setProgress(0)

    // Simula progresso
    const id = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 90) {
          clearInterval(id)
          return 90
        }
        return prev + 10
      })
    }, 100)

    // Limpa o timeout anterior se existir
    if (timeoutId) {
      clearTimeout(timeoutId)
    }

    // Define um novo timeout para esconder a barra
    const newTimeoutId = setTimeout(() => {
      setProgress(100)
      setTimeout(() => {
        setLoading(false)
      }, 200)
    }, 500)

    setTimeoutId(newTimeoutId)

    return () => {
      clearInterval(id)
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
    }
  }, [pathname, searchParams])

  if (!loading) return null

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-1 bg-muted">
      <div
        className={cn(
          "h-full bg-primary transition-all duration-300 ease-in-out",
          progress === 100 && "opacity-0"
        )}
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}
