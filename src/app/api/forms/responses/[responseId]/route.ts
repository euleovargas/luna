import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { z } from "zod";

const responseSchema = z.object({
  fields: z.array(
    z.object({
      fieldId: z.string(),
      value: z.string(),
    })
  ),
});

type ResponseInput = z.infer<typeof responseSchema>;

// GET /api/forms/responses/[responseId] - Obtém detalhes de uma resposta específica
export async function GET(
  request: NextRequest,
  { params }: { params: { responseId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
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
      return new NextResponse("Not found", { status: 404 });
    }

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching response:", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PUT /api/forms/responses/[responseId] - Atualiza uma resposta específica
export async function PUT(
  request: NextRequest,
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
      include: {
        form: true,
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

    const body = await request.json();
    const { fields } = responseSchema.parse(body);

    // Atualizar os campos
    const updatedResponse = await prisma.formResponse.update({
      where: {
        id: params.responseId,
      },
      data: {
        fields: {
          updateMany: fields.map((field: ResponseInput["fields"][number]) => ({
            where: {
              fieldId: field.fieldId,
            },
            data: {
              value: field.value,
            },
          })),
        },
      },
      include: {
        form: true,
        fields: {
          include: {
            field: true,
          },
        },
      },
    });

    return NextResponse.json(updatedResponse);
  } catch (error) {
    console.error("[FORMS_RESPONSE_UPDATE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE /api/forms/responses/[responseId] - Exclui uma resposta específica
export async function DELETE(
  request: NextRequest,
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
      include: {
        form: true,
      },
    });

    if (!response) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Não permitir exclusão se o formulário estiver inativo
    if (!response.form.isActive) {
      return NextResponse.json(
        { error: "Este formulário não está mais ativo" },
        { status: 400 }
      );
    }

    await prisma.formResponse.delete({
      where: {
        id: params.responseId,
      },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("[FORMS_RESPONSE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
