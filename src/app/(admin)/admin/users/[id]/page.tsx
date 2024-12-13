import { getUserById } from "@/lib/api/users"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { UserRole } from "@prisma/client"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Icons } from "@/components/ui/icons"

interface UserPageProps {
  params: {
    id: string
  }
}

export default async function UserPage({ params }: UserPageProps) {
  const user = await getUserById(params.id)

  if (!user) {
    return <div>Usuário não encontrado</div>
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-8 flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight">Detalhes do Usuário</h1>
          <p className="text-muted-foreground">
            Visualize as informações do usuário
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button asChild variant="outline">
            <Link href="/admin/users">
              <Icons.arrowRight className="mr-2 h-4 w-4 rotate-180" />
              Voltar
            </Link>
          </Button>
          <Button asChild>
            <Link href={`/admin/users/${user.id}/edit`}>
              <Icons.edit className="mr-2 h-4 w-4" />
              Editar
            </Link>
          </Button>
        </div>
      </div>
      <div className="rounded-lg border p-8">
        <div className="flex items-center gap-4">
          <Avatar className="h-20 w-20">
            {user.image ? (
              <AvatarImage src={user.image} alt={user.name} />
            ) : (
              <AvatarFallback>{user.name[0]?.toUpperCase()}</AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{user.name}</h1>
            <p className="text-gray-500">{user.email}</p>
          </div>
        </div>
        <div className="mt-8 grid gap-4">
          <div>
            <h2 className="font-semibold">Tipo de Usuário</h2>
            <Badge variant={user.role === UserRole.ADMIN ? "default" : "secondary"}>
              {user.role === UserRole.ADMIN ? "Admin" : "Usuário"}
            </Badge>
          </div>
          <div>
            <h2 className="font-semibold">Data de Criação</h2>
            <p>{formatDate(user.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
