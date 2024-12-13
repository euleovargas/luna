import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { createUser, getUsers } from "@/lib/api/users"

// GET /api/admin/users - Lista todos os usuários
export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const users = await getUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("[USERS_GET]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}

// POST /api/admin/users - Cria um novo usuário
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "ADMIN") {
      return new NextResponse("Unauthorized", { status: 403 })
    }

    const body = await req.json()
    const user = await createUser(body)

    return NextResponse.json(user)
  } catch (error) {
    console.error("[USERS_POST]", error)
    return new NextResponse("Internal error", { status: 500 })
  }
}
