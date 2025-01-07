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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const response = await prisma.formResponse.findUnique({
      where: {
        id: params.responseId,
        userId: session.user.id,
      },
    });

    if (!response) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Não permitir edição se o formulário estiver inativo
    if (!response.form.isActive) {
      return NextResponse.json(
        { error: "Este formulário não está mais ativo" },
        { status: 400 }
      );
    }

    // Atualizar os campos
    const updatedResponse = await prisma.formResponse.update({
      where: {
        id: params.responseId,
      },
      data: {
        fields: {
          updateMany: body.fields.map((field) => ({
            where: {
              fieldId: field.fieldId,
            },
            data: {
              value: field.value,
            },
          })),
        },
      },
    });

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error("[RESPONSE_PUT]", error);
    return new NextResponse("Internal error", { status: 500 });
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
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const response = await prisma.formResponse.findUnique({
      where: {
        id: params.responseId,
        userId: session.user.id,
      },
    });

    if (!response) {
      return new NextResponse("Not found", { status: 404 });
    }

    if (response.status === "SUBMITTED") {
      return new NextResponse("Cannot delete submitted response", { status: 400 });
    }

    await prisma.formResponse.delete({
      where: {
        id: params.responseId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[RESPONSE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
