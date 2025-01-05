import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// GET /api/forms - Lista todos os formulários (ADMIN vê todos, USER vê apenas ativos)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const userRole = session.user.role;

    // ADMIN vê todos os formulários, USER vê apenas ativos
    const forms = await prisma.dynamicForm.findMany({
      where: {
        ...(userRole !== UserRole.ADMIN && {
          isActive: true,
        }),
      },
      include: {
        fields: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(forms);
  } catch (error) {
    console.error("Error fetching forms:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/forms - Cria um novo formulário (apenas ADMIN)
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Only admins can create forms" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, fields } = body;

    if (!title || !fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { error: "Invalid form data" },
        { status: 400 }
      );
    }

    // Criar o formulário com seus campos
    const form = await prisma.dynamicForm.create({
      data: {
        title,
        description,
        createdBy: session.user.id,
        fields: {
          create: fields.map((field: any, index: number) => ({
            type: field.type,
            label: field.label,
            description: field.description,
            required: field.required || false,
            options: field.options,
            order: index,
          })),
        },
      },
      include: {
        fields: true,
      },
    });

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error creating form:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
