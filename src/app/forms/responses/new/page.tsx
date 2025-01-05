import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { ResponseForm } from "@/app/forms/responses/[responseId]/response-form";

export const metadata: Metadata = {
  title: "Preencher Formulário",
  description: "Preencha o formulário",
};

interface Props {
  searchParams: {
    formId?: string;
  };
}

export default async function NewResponsePage({ searchParams }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  if (!searchParams.formId) {
    redirect("/forms/my-responses");
  }

  // Buscar o formulário
  const form = await prisma.dynamicForm.findUnique({
    where: {
      id: searchParams.formId,
      isActive: true,
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
    redirect("/forms/my-responses");
  }

  // Verificar se o usuário já respondeu este formulário
  const existingResponse = await prisma.formResponse.findFirst({
    where: {
      formId: form.id,
      userId: session.user.id,
      status: "SUBMITTED",
    },
  });

  if (existingResponse) {
    redirect("/forms/my-responses");
  }

  // Criar uma nova resposta em rascunho
  const response = await prisma.formResponse.create({
    data: {
      formId: form.id,
      userId: session.user.id,
      status: "DRAFT",
      fieldResponses: {
        createMany: {
          data: form.fields.map((field) => ({
            fieldId: field.id,
            value: "",
          })),
        },
      },
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
      fieldResponses: {
        include: {
          field: true,
        },
      },
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-2xl mx-auto">
        <ResponseForm response={response} />
      </div>
    </div>
  );
}
