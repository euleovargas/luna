import { Metadata } from "next"
import { getUsers } from "@/lib/api/users"
import { DataTable } from "@/components/admin/users/data-table"
import { columns } from "@/components/admin/users/columns"
import { User } from "@/types/user"
import { Heading } from "@/components/admin/heading"
import { Button } from "@/components/admin/button"
import { Link } from "next/link"
import { Icons } from "@/components/icons"
import { Separator } from "@/components/admin/separator"

export const metadata: Metadata = {
  title: "Usuários",
  description: "Gerencie os usuários do sistema.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <Heading
          title="Usuários"
          description="Gerencie os usuários do sistema."
        />
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
        deleteUser={async () => {
          'use server'
          revalidatePath('/admin/users')
        }}
      />
    </div>
  )
}
