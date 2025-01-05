import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

// GET /api/forms/responses/[responseId] - Obtém detalhes de uma resposta específica
export async function GET(
  req: Request,
  { params }: { params: { responseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { responseId } = params;
    const userRole = session.user.role;
    const userId = session.user.id;

    const response = await prisma.formResponse.findUnique({
      where: {
        id: responseId,
        // USER só pode ver suas próprias respostas
        ...(userRole !== UserRole.ADMIN && {
          userId,
        }),
      },
      include: {
        form: {
          include: {
            fields: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
        fields: {
          include: {
            field: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching response:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/forms/responses/[responseId] - Atualiza uma resposta específica
export async function PUT(
  req: Request,
  { params }: { params: { responseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { responseId } = params;
    const body = await req.json();
    const { fields, status = "draft" } = body;

    // Verificar se a resposta existe e pertence ao usuário
    const existingResponse = await prisma.formResponse.findUnique({
      where: {
        id: responseId,
        ...(session.user.role !== UserRole.ADMIN && {
          userId: session.user.id,
        }),
      },
      include: {
        form: {
          include: {
            fields: true,
          },
        },
      },
    });

    if (!existingResponse) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    // Se o formulário não estiver mais ativo, apenas ADMIN pode atualizar
    if (!existingResponse.form.isActive && session.user.role !== UserRole.ADMIN) {
      return NextResponse.json(
        { error: "Form is no longer active" },
        { status: 403 }
      );
    }

    // Verificar campos obrigatórios se estiver enviando
    if (status === "submitted") {
      const requiredFields = existingResponse.form.fields.filter((f) => f.required);
      const missingFields = requiredFields.filter(
        (rf) => !fields.some((f: any) => f.fieldId === rf.id && f.value)
      );

      if (missingFields.length > 0) {
        return NextResponse.json(
          {
            error: "Missing required fields",
            fields: missingFields.map((f) => f.label),
          },
          { status: 400 }
        );
      }
    }

    // Atualizar a resposta
    const updatedResponse = await prisma.formResponse.update({
      where: { id: responseId },
      data: {
        status,
        fields: {
          deleteMany: {}, // Remove campos existentes
          create: fields.map((field: any) => ({
            fieldId: field.fieldId,
            value: field.value,
          })),
        },
      },
      include: {
        fields: {
          include: {
            field: true,
          },
        },
        form: true,
      },
    });

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error("Error updating response:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/forms/responses/[responseId] - Remove uma resposta (apenas o próprio usuário ou ADMIN)
export async function DELETE(
  req: Request,
  { params }: { params: { responseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { responseId } = params;

    // Verificar se a resposta existe e pertence ao usuário
    const response = await prisma.formResponse.findUnique({
      where: {
        id: responseId,
        ...(session.user.role !== UserRole.ADMIN && {
          userId: session.user.id,
        }),
      },
    });

    if (!response) {
      return NextResponse.json({ error: "Response not found" }, { status: 404 });
    }

    await prisma.formResponse.delete({
      where: { id: responseId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting response:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
