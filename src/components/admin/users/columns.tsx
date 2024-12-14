"use client"

import { ColumnDef } from "@tanstack/react-table"
import { UserRole } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Icons } from "@/components/ui/icons"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { useState } from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useSession } from "next-auth/react"
import { CustomSession } from "@/types"

export type User = {
  id: string
  name: string
  email: string
  image?: string | null
  role: UserRole
  createdAt: string
}

interface DataTableRowActionsProps {
  user: User
  onDelete: () => Promise<void>
}

export function DataTableRowActions({ user, onDelete }: DataTableRowActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { data: sessionData } = useSession()
  const session = sessionData as CustomSession
  const isCurrentUser = session?.user?.id === user.id

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      })

      if (!response?.ok) {
        throw new Error("Failed to delete user")
      }

      await onDelete()
      
      toast({
        title: "Usuário deletado",
        description: "O usuário foi deletado com sucesso.",
      })
    } catch (error) {
      console.error("Error deleting user:", error)
      toast({
        title: "Erro ao deletar usuário",
        description: "Ocorreu um erro ao tentar deletar o usuário.",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Icons.more className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(user.id)}
        >
          <Icons.copy className="mr-2 h-4 w-4" />
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${user.id}`} className="flex items-center">
            <Icons.eye className="mr-2 h-4 w-4" />
            Ver detalhes
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${user.id}/edit`} className="flex items-center">
            <Icons.edit className="mr-2 h-4 w-4" />
            Editar
          </Link>
        </DropdownMenuItem>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <DropdownMenuItem
                      onSelect={(e) => e.preventDefault()}
                      className="text-destructive focus:text-destructive"
                      disabled={isCurrentUser}
                    >
                      <Icons.trash className="mr-2 h-4 w-4" />
                      Deletar
                    </DropdownMenuItem>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Esta ação não pode ser desfeita. Isso irá deletar permanentemente o usuário
                        e remover seus dados dos nossos servidores.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleDelete}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? (
                          <>
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                            Deletando...
                          </>
                        ) : (
                          "Continuar"
                        )}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </TooltipTrigger>
            {isCurrentUser && (
              <TooltipContent>
                <p>Você não pode deletar sua própria conta</p>
              </TooltipContent>
            )}
          </Tooltip>
        </TooltipProvider>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const columns: ColumnDef<User>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "name",
    header: "Nome",
    cell: ({ row }) => {
      const user = row.original
      return (
        <div className="flex items-center gap-3">
          <Avatar>
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name} />
            ) : (
              <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <span>{user.name}</span>
        </div>
      )
    },
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Tipo",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole
      return (
        <Badge variant={role === UserRole.ADMIN ? "default" : "secondary"}>
          {role === UserRole.ADMIN ? "Admin" : "Usuário"}
        </Badge>
      )
    },
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => {
      return formatDate(row.getValue("createdAt"))
    },
  },
  {
    id: "actions",
    cell: ({ row, table }) => {
      return <DataTableRowActions user={row.original} onDelete={table.options.meta?.deleteUser} />
    },
  },
]
