import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { FormResponseCard } from "@/components/forms/FormResponseCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Meus Formulários",
  description: "Gerencie seus formulários preenchidos",
};

export default async function MyResponsesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/auth/login");
  }

  // Buscar todas as respostas do usuário
  const responses = await prisma.formResponse.findMany({
    where: {
      userId: session.user.id,
    },
    include: {
      form: true,
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  // Buscar formulários disponíveis
  const availableForms = await prisma.form.findMany({
    where: {
      isActive: true,
      NOT: {
        responses: {
          some: {
            userId: session.user.id,
            status: "SUBMITTED",
          },
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-10">
        {/* Formulários Disponíveis */}
        <div className="flex flex-col space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Formulários Disponíveis</h2>
            <p className="text-gray-500">
              Formulários que você pode preencher
            </p>
          </div>

          {availableForms.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                Não há formulários disponíveis no momento
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {availableForms.map((form) => (
                <div key={form.id} className="border rounded-lg p-6 space-y-4">
                  <h3 className="text-xl font-semibold">{form.title}</h3>
                  {form.description && (
                    <p className="text-gray-500">{form.description}</p>
                  )}
                  <Link href={`/forms/responses/new?formId=${form.id}`}>
                    <Button className="w-full">Preencher</Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Minhas Respostas */}
        <div className="flex flex-col space-y-6">
          <div>
            <h2 className="text-2xl font-bold">Minhas Respostas</h2>
            <p className="text-gray-500">
              Gerencie seus formulários preenchidos e em rascunho
            </p>
          </div>

          {responses.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-gray-500">
                Você ainda não preencheu nenhum formulário
              </p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {responses.map((response) => (
                <FormResponseCard key={response.id} response={response} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
