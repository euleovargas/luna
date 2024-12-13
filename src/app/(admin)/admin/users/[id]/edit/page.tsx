import { Metadata } from "next"
import { notFound } from "next/navigation"
import { UserForm } from "@/components/admin/users/user-form"
import { getUserById } from "@/lib/api/users"

export const metadata: Metadata = {
  title: "Editar Usuário",
  description: "Editar um usuário existente no sistema.",
}

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const user = await getUserById(params.id)

  if (!user) {
    notFound()
  }

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Editar Usuário</h2>
          <p className="text-muted-foreground">
            Edite as informações do usuário.
          </p>
        </div>
      </div>
      <div className="grid gap-6">
        <UserForm user={user} />
      </div>
    </div>
  )
}
