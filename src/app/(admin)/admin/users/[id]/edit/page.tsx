import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { UserForm } from "@/components/admin/users/user-form"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/session"
import { UserRole } from "@prisma/client"
import { User } from "@/types/user"
import { BackButton } from "@/components/ui/back-button"

interface EditUserPageProps {
  params: {
    id: string
  }
}

export default async function EditUserPage({ params }: EditUserPageProps) {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    redirect("/")
  }

  const dbUser = await db.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      createdAt: true,
    },
  })

  if (!dbUser) {
    notFound()
  }

  // Converte o usuário do DB para o tipo User
  const user: User = {
    ...dbUser,
    createdAt: dbUser.createdAt.toISOString(),
  }

  async function onSubmit(data: any) {
    "use server"

    const { name, email, role } = data

    await db.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        role,
      },
    })
  }

  return (
    <div className="container mx-auto py-10">
      <BackButton href="/admin/users" />
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Editar Usuário</h3>
          <p className="text-sm text-muted-foreground">
            Faça alterações nas informações do usuário
          </p>
        </div>
        <Separator />
        <div className="grid gap-6">
          <UserForm user={user} onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  )
}
