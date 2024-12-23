"use client"

import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"

interface BackButtonProps {
  href?: string // Opcional: permite override do comportamento padrão
}

export function BackButton({ href }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (href) {
      router.push(href)
    } else {
      router.back()
    }
  }

  return (
    <Button
      onClick={handleClick}
      variant="ghost"
      className="gap-2 mb-4"
    >
      <ChevronLeft className="h-4 w-4" />
      Voltar
    </Button>
  )
}
