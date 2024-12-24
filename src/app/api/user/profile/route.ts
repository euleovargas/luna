import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    const body = await req.json()
    const { name, image } = body

    const updateData: { name?: string; image?: string } = {}
    if (name) updateData.name = name
    if (image) updateData.image = image

    const user = await prisma.user.update({
      where: {
        email: session.user.email,
      },
      data: updateData,
    })

    return NextResponse.json({ user })
  } catch (error) {
    console.error("[PROFILE_PATCH]", error)
    return new NextResponse("Erro interno", { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return new NextResponse("Não autorizado", { status: 401 })
    }

    await prisma.user.delete({
      where: {
        email: session.user.email,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[PROFILE_DELETE]", error)
    return new NextResponse("Erro interno", { status: 500 })
  }
}
