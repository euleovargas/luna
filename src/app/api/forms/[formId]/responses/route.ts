import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";

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
  req: Request,
  { params }: { params: { formId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { formId } = params;
    const body = await req.json();
    const { fields, status = "draft" } = body;

    if (!fields || !Array.isArray(fields)) {
      return NextResponse.json(
        { error: "Invalid response data" },
        { status: 400 }
      );
    }

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
      return NextResponse.json(
        { error: "Form not found or inactive" },
        { status: 404 }
      );
    }

    // Verificar campos obrigatórios
    if (status === "submitted") {
      const requiredFields = form.fields.filter((f) => f.required);
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

    // Criar a resposta com seus campos
    const response = await prisma.formResponse.create({
      data: {
        formId,
        userId: session.user.id,
        status,
        fields: {
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
      },
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error creating response:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
