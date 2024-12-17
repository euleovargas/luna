import { notFound, redirect } from "next/navigation"
import { db } from "@/lib/db"
import { UserForm } from "@/components/admin/users/user-form"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/session"
import { UserRole } from "@prisma/client"

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

  const user = await db.user.findUnique({
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

  if (!user) {
    notFound()
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
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Editar Usuário"
          description="Edite as informações do usuário."
        />
      </div>
      <Separator />
      <div className="grid gap-6">
        <UserForm user={user} onSubmit={onSubmit} />
      </div>
    </div>
  )
}
