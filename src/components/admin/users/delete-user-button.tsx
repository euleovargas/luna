"use client"

import { Button } from "@/components/ui/button"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { toast } from "@/components/ui/use-toast"
import { useRouter } from "next/navigation"
import { deleteUser } from "@/app/_actions/user"

interface DeleteUserButtonProps {
  userId: string
}

export function DeleteUserButton({ userId }: DeleteUserButtonProps) {
  const router = useRouter()

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive">
          Excluir Usuário
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. O usuário será permanentemente excluído.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              const result = await deleteUser(userId)
              if (result.success) {
                router.push('/admin/users')
                toast({
                  title: "Usuário excluído",
                  description: "O usuário foi excluído com sucesso.",
                })
              } else {
                toast({
                  title: "Erro",
                  description: "Erro ao excluir usuário.",
                  variant: "destructive",
                })
              }
            }}
          >
            Continuar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
