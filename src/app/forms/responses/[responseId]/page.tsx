import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ResponseForm } from "./response-form";
import { UserRole } from "@prisma/client";

export const metadata: Metadata = {
  title: "Formulário",
  description: "Visualize ou edite sua resposta",
};

interface ResponsePageProps {
  params: {
    responseId: string;
  };
}

export default async function ResponsePage({ params }: ResponsePageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Buscar a resposta com todos os detalhes
  const response = await prisma.formResponse.findUnique({
    where: {
      id: params.responseId,
      ...(session.user.role !== UserRole.ADMIN && {
        userId: session.user.id,
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
          name: true,
          email: true,
        },
      },
    },
  });

  if (!response) {
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{response.form.title}</h1>
          {response.form.description && (
            <p className="text-gray-500 mt-2">{response.form.description}</p>
          )}
          {session.user.role === UserRole.ADMIN && (
            <p className="text-sm text-gray-500 mt-4">
              Respondido por: {response.user.name || response.user.email}
            </p>
          )}
        </div>

        <ResponseForm 
          response={response} 
          isActive={response.form.isActive && response.userId === session.user.id} 
        />
      </div>
    </div>
  );
}
