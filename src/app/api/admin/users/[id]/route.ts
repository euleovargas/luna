import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

const routeContextSchema = z.object({
  params: z.object({
    id: z.string(),
  }),
});

const userUpdateSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.enum([UserRole.ADMIN, UserRole.USER]).optional(),
});

export async function PUT(req: Request, context: z.infer<typeof routeContextSchema>) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validar parâmetros da rota
    const { params } = routeContextSchema.parse(context);

    // Validar corpo da requisição
    const json = await req.json();
    const body = userUpdateSchema.parse(json);

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Atualizar usuário
    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.email && { email: body.email }),
        ...(body.role && { role: body.role }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        image: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: updatedUser,
    }, {
      headers: {
        'Cache-Control': 'no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
  } catch (error) {
    console.error("[USER_UPDATE_ERROR]", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Something went wrong" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, context: z.infer<typeof routeContextSchema>) {
  try {
    // Verificar autenticação
    const session = await getServerSession(authOptions);

    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validar parâmetros da rota
    const { params } = routeContextSchema.parse(context);

    // Verificar se o usuário existe
    const existingUser = await prisma.user.findUnique({
      where: { id: params.id },
    });

    if (!existingUser) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Não permitir que um admin delete a si mesmo
    if (existingUser.id === session.user.id) {
      return NextResponse.json(
        { success: false, message: "You cannot delete your own account" },
        { status: 400 }
      );
    }

    // Deletar usuário
    await prisma.user.delete({
      where: { id: params.id },
    });

    return NextResponse.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("[USER_DELETE_ERROR]", error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : "Something went wrong" 
      },
      { status: 500 }
    );
  }
}
