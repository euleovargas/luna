import { redirect } from "next/navigation"
import { db } from "@/lib/db"
import { UserForm } from "@/components/admin/users/user-form"
import { Heading } from "@/components/ui/heading"
import { Separator } from "@/components/ui/separator"
import { getCurrentUser } from "@/lib/session"
import { UserRole } from "@prisma/client"
import { generateVerificationToken } from "@/lib/tokens"
import { sendVerificationEmail } from "@/lib/mail"

export default async function NewUserPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser || currentUser.role !== UserRole.ADMIN) {
    redirect("/")
  }

  async function onSubmit(data: any) {
    "use server"

    const { name, email, role } = data

    // Verifica se o email já está em uso
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      throw new Error("Este email já está em uso.")
    }

    // Gera um token de verificação
    const verifyToken = await generateVerificationToken()

    // Cria o usuário
    const user = await db.user.create({
      data: {
        name,
        email,
        role,
        verifyToken,
        lastEmailSent: new Date(),
      },
    })

    // Envia o email de verificação
    await sendVerificationEmail({ 
      email: user.email!, 
      token: verifyToken 
    })
  }

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Novo Usuário"
          description="Adicione um novo usuário ao sistema."
        />
      </div>
      <Separator />
      <div className="grid gap-6">
        <UserForm onSubmit={onSubmit} />
      </div>
    </div>
  )
}
