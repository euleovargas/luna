import { Metadata } from "next"
import { getUsers } from "@/lib/api/users"
import { DataTable } from "@/components/admin/users/data-table"
import { columns } from "@/components/admin/users/columns"
import { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Icons } from "@/components/ui/icons"
import { Separator } from "@/components/ui/separator"
import { revalidatePath } from "next/cache"

export const metadata: Metadata = {
  title: "Usuários",
  description: "Gerencie os usuários do sistema.",
}

export const revalidate = 0

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">
            <Icons.add className="mr-2 h-4 w-4" />
            Novo Usuário
          </Link>
        </Button>
      </div>
      <Separator />
      <DataTable
        columns={columns}
        data={users}
      />
    </div>
  )
}
