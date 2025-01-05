import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { ResponseForm } from "./response-form";

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
      userId: session.user.id,
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
        </div>

        <ResponseForm 
          response={response} 
          isActive={response.form.isActive} 
        />
      </div>
    </div>
  );
}
