import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// GET /api/forms/[formId] - Obtém detalhes de um formulário
export async function GET(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = params;
    const userRole = session.user.role;

    const form = await prisma.dynamicForm.findUnique({
      where: {
        id: formId,
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

    if (!form) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    return NextResponse.json(form);
  } catch (error) {
    console.error("Error fetching form:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/forms/[formId] - Atualiza um formulário (apenas ADMIN)
export async function PUT(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Only admins can update forms" },
        { status: 403 }
      );
    }

    const { formId } = params;
    const body = await req.json();
    const { title, description, isActive, fields } = body;

    // Verificar se o formulário existe
    const existingForm = await prisma.dynamicForm.findUnique({
      where: { id: formId },
    });

    if (!existingForm) {
      return NextResponse.json({ error: "Form not found" }, { status: 404 });
    }

    // Atualizar o formulário e seus campos
    const updatedForm = await prisma.dynamicForm.update({
      where: { id: formId },
      data: {
        title,
        description,
        isActive,
        fields: {
          deleteMany: {}, // Remove campos existentes
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
        fields: {
          orderBy: {
            order: "asc",
          },
        },
      },
    });

    return NextResponse.json(updatedForm);
  } catch (error) {
    console.error("Error updating form:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/[formId] - Remove um formulário (apenas ADMIN)
export async function DELETE(
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Only admins can delete forms" },
        { status: 403 }
      );
    }

    const { formId } = params;

    await prisma.dynamicForm.delete({
      where: { id: formId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
