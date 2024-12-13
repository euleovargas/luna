import { Metadata } from "next"
import { UserForm } from "@/components/admin/users/user-form"

export const metadata: Metadata = {
  title: "Novo Usuário",
  description: "Criar um novo usuário no sistema.",
}

export default function NewUserPage() {
  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Novo Usuário</h2>
          <p className="text-muted-foreground">
            Crie um novo usuário no sistema.
          </p>
        </div>
      </div>
      <div className="grid gap-6">
        <UserForm />
      </div>
    </div>
  )
}
