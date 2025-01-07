import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { z } from "zod";
import { UserRole } from "@prisma/client";

const responseSchema = z.object({
  fields: z.array(
    z.object({
      fieldId: z.string(),
      value: z.string(),
    })
  ),
});

// GET /api/forms/[formId]/responses - Lista respostas de um formulário
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
    const userId = session.user.id;

    // USER só pode ver suas próprias respostas
    // ADMIN pode ver todas as respostas
    const responses = await prisma.formResponse.findMany({
      where: {
        formId,
        ...(userRole !== UserRole.ADMIN && {
          userId,
        }),
      },
      include: {
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

    return NextResponse.json(responses);
  } catch (error) {
    console.error("Error fetching responses:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/forms/[formId]/responses - Cria uma nova resposta
export async function POST(
  request: NextRequest,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const formId = params.formId;

    // Verificar se o formulário existe e está ativo
    const form = await prisma.dynamicForm.findUnique({
      where: {
        id: formId,
        isActive: true,
      },
      include: {
        fields: true,
      },
    });

    if (!form) {
      return new NextResponse("Form not found", { status: 404 });
    }

    // Verificar se o usuário já respondeu este formulário
    const existingResponse = await prisma.formResponse.findFirst({
      where: {
        formId,
        userId: session.user.id,
      },
    });

    if (existingResponse) {
      return NextResponse.json(
        { error: "Você já respondeu este formulário" },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { fields } = responseSchema.parse(body);

    // Criar a resposta
    const response = await prisma.formResponse.create({
      data: {
        formId,
        userId: session.user.id,
        fields: {
          create: fields.map((field: any) => ({
            fieldId: field.fieldId,
            value: field.value,
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

    return NextResponse.json(response);
  } catch (error) {
    console.error("[FORMS_RESPONSE_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
