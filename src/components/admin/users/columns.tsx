"use client"

import { ColumnDef, Table } from "@tanstack/react-table"
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
import { Copy, MoreHorizontal, MoreVertical, Pen, Trash, User } from "lucide-react"
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
import { User as UserType } from "@/types/user"
import { CustomSession } from "@/types"
import { deleteUser } from "@/app/_actions/user"

interface DataTableRowActionsProps {
  user: UserType
  onDelete?: () => Promise<void>
}

export function DataTableRowActions({ user, onDelete }: DataTableRowActionsProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const { data: sessionData } = useSession()
  const session = sessionData as CustomSession
  const isCurrentUser = session?.user?.id === user.id

  const handleDelete = async () => {
    try {
      setIsDeleting(true)
      if (onDelete) {
        await onDelete()
      }
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      })

      if (!response?.ok) {
        throw new Error("Failed to delete user")
      }

      toast({
        title: "Usuário deletado",
        description: "O usuário foi deletado com sucesso.",
      })

      // Força a atualização da página para refletir a mudança
      window.location.reload()
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
          <Icons.moreVertical className="h-4 w-4" />
          <span className="sr-only">Abrir menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Ações</DropdownMenuLabel>
        <DropdownMenuItem
          onClick={() => navigator.clipboard.writeText(user.id)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copiar ID
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${user.id}`} className="flex items-center">
            <User className="mr-2 h-4 w-4" />
            Ver detalhes
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/admin/users/${user.id}/edit`} className="flex items-center">
            <Pen className="mr-2 h-4 w-4" />
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
                      <Trash className="mr-2 h-4 w-4" />
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

declare module '@tanstack/table-core' {
  interface TableMeta<TData extends unknown> {
    deleteUser: (userId: string) => Promise<void>
  }
}

export const columns: ColumnDef<UserType>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={table.getIsAllPageRowsSelected()}
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
        className="translate-y-[2px]"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
        className="translate-y-[2px]"
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
        <div className="flex items-center gap-4">
          <Avatar>
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name || "User"} />
            ) : (
              <AvatarFallback>
                {user.name ? user.name[0]?.toUpperCase() : "U"}
              </AvatarFallback>
            )}
          </Avatar>
          <span>{user.name || "Sem nome"}</span>
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
    header: "Função",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole
      const roleLabels = {
        [UserRole.ADMIN]: "Administrador",
        [UserRole.MANAGER]: "Gerente",
        [UserRole.USER]: "Usuário",
      }
      return <Badge variant="outline">{roleLabels[role]}</Badge>
    },
  },
  {
    accessorKey: "createdAt",
    header: "Criado em",
    cell: ({ row }) => formatDate(row.getValue("createdAt")),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <Icons.moreVertical className="h-4 w-4" />
              <span className="sr-only">Abrir menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Ações</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => {
                navigator.clipboard.writeText(user.id)
                toast({
                  title: "ID copiado",
                  description: "ID do usuário copiado para a área de transferência",
                })
              }}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copiar ID
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${user.id}`}>
                <User className="mr-2 h-4 w-4" />
                Visualizar detalhes
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={`/admin/users/${user.id}/edit`}>
                <Pen className="mr-2 h-4 w-4" />
                Editar
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="text-red-600">
                  <Trash className="mr-2 h-4 w-4" />
                  Excluir usuário
                </DropdownMenuItem>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Deseja excluir este usuário?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Esta ação não pode ser desfeita.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                  <AlertDialogAction
                    className="bg-red-600 hover:bg-red-700"
                    onClick={async () => {
                      const result = await deleteUser(user.id)
                      if (!result.success) {
                        toast({
                          title: "Erro ao excluir usuário",
                          description: result.error,
                          variant: "destructive",
                        })
                        return
                      }

                      toast({
                        title: "Usuário excluído",
                        description: "O usuário foi excluído com sucesso.",
                      })

                      // Atualiza a tabela
                      window.location.reload()
                    }}
                  >
                    Excluir usuário
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
