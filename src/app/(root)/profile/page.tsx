import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ProfileForm } from "@/components/profile/profile-form"
import { getCurrentUser } from "@/lib/session"
import { db } from "@/lib/db"
import { User } from "@/types/user"
import { updateProfile } from "@/app/_actions/profile"

export default async function ProfilePage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    notFound()
  }

  const dbUser = await db.user.findUnique({
    where: { id: currentUser.id },
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

  return (
    <div className="container mx-auto py-10">
      <Card>
        <CardHeader>
          <h1 className="text-2xl font-bold">Perfil</h1>
          <p className="text-muted-foreground">
            Gerencie suas informações pessoais
          </p>
        </CardHeader>
        <CardContent>
          <ProfileForm user={user} onSubmit={updateProfile} />
        </CardContent>
      </Card>
    </div>
  )
}
