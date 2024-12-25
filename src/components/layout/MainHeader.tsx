"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { useSession, signOut } from "next-auth/react"
import { CustomSession } from "@/types"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Icons } from "@/components/ui/icons"
import { useUserStore } from "@/store/user-store"

interface MainHeaderProps {
  children?: React.ReactNode
  menuItems?: {
    href: string
    title: string
  }[]
}

interface MainHeaderNavProps {
  items?: {
    href: string
    title: string
  }[]
}

interface MainHeaderActionsProps {
  children?: React.ReactNode
}

/**
 * MainHeader Component
 * 
 * Componente principal do cabeçalho da aplicação. Inclui logo, navegação e área do usuário.
 * Usa Zustand para gerenciamento de estado global e NextAuth para autenticação.
 */
const MainHeader = ({ children, menuItems }: MainHeaderProps) => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <MainHeader.Logo />
        <MainHeader.Nav items={menuItems} />
        <div className="flex flex-1 items-center justify-end space-x-4">
          {children}
          <MainHeader.User />
        </div>
      </div>
    </header>
  )
}

/**
 * Logo do cabeçalho
 */
MainHeader.Logo = function MainHeaderLogo() {
  return (
    <Link href="/" className="flex items-center space-x-2">
      <Image src="/luna-logo.svg" alt="Luna Logo" width={32} height={32} className="h-8 w-8" />
      <span className="hidden font-bold sm:inline-block">
        Luna
      </span>
    </Link>
  )
}

/**
 * Navegação do cabeçalho
 */
MainHeader.Nav = function MainHeaderNav({ items }: MainHeaderNavProps) {
  return (
    <nav className="flex items-center space-x-6 px-6">
      {items?.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          {item.title}
        </Link>
      ))}
    </nav>
  )
}

/**
 * Área de ações do cabeçalho (ex: botões, controles)
 */
MainHeader.Actions = function MainHeaderActions({ children }: MainHeaderActionsProps) {
  return (
    <div className="flex items-center space-x-4">
      {children}
    </div>
  )
}

/**
 * Área do usuário no cabeçalho
 * 
 * Exibe a imagem do perfil do usuário e um menu dropdown com ações.
 * Usa o estado global (Zustand) para manter a imagem atualizada.
 */
MainHeader.User = function MainHeaderUser() {
  const { data: sessionData } = useSession()
  const session = sessionData as CustomSession
  const user = useUserStore((state) => state.user)
  const setUser = useUserStore((state) => state.setUser)

  // Sincronizar o estado global com a sessão
  React.useEffect(() => {
    if (session?.user) {
      setUser(session.user)
    }
  }, [session?.user, setUser])

  if (!session?.user) {
    return null
  }

  // Usar o user da store que sempre estará atualizado
  const currentUser = user || session.user

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage 
              src={currentUser.image || ""} 
              alt={currentUser.name || ""}
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = ""
              }}
            />
            <AvatarFallback>{currentUser.name?.charAt(0)}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{currentUser.name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {currentUser.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/profile">
            <Icons.user className="mr-2 h-4 w-4" />
            Perfil
          </Link>
        </DropdownMenuItem>
        {currentUser.role === "ADMIN" && (
          <DropdownMenuItem asChild>
            <Link href="/admin">
              <Icons.settings className="mr-2 h-4 w-4" />
              Admin
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="cursor-pointer"
        >
          <Icons.logout className="mr-2 h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export { MainHeader }
