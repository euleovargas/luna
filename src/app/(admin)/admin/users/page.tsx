import { Metadata } from "next"
import { getUsers } from "@/lib/api/users"
import { DataTable } from "@/components/admin/users/data-table"
import { columns } from "@/components/admin/users/columns"

export const metadata: Metadata = {
  title: "Usuários",
  description: "Gerencie os usuários do sistema.",
}

export const dynamic = "force-dynamic"
export const revalidate = 0

export default async function UsersPage() {
  const users = await getUsers()

  return (
    <div className="h-full flex-1 flex-col space-y-8 p-8 md:flex">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Usuários</h2>
          <p className="text-muted-foreground">
            Aqui você pode gerenciar os usuários do sistema.
          </p>
        </div>
      </div>
      <DataTable data={users} columns={columns} />
    </div>
  )
}
