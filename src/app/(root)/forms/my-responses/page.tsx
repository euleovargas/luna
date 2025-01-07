import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { FormResponseCard } from "@/components/forms/FormResponseCard";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserRole } from "@prisma/client";

export const metadata: Metadata = {
  title: "Minhas Respostas",
  description: "Veja todas as suas respostas aos formulários",
};

export default async function MyResponsesPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/");
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

  // Se for admin, buscar também os formulários criados
  const isAdmin = session.user.role === UserRole.ADMIN;
  const createdForms = isAdmin ? await prisma.form.findMany({
    where: {
      createdById: session.user.id,
    },
    orderBy: {
      updatedAt: "desc",
    },
  }) : [];

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Minhas Respostas</h1>
            <p className="text-gray-500">Veja todas as suas respostas aos formulários</p>
          </div>
          <div className="flex gap-2">
            {isAdmin && (
              <Link href="/admin/forms">
                <Button>Meus Formulários</Button>
              </Link>
            )}
            <Link href="/forms">
              <Button variant="outline">Voltar</Button>
            </Link>
          </div>
        </div>

        {responses.length === 0 && createdForms.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              Você ainda não respondeu nenhum formulário
            </p>
          </div>
        ) : (
          <div className="flex flex-col space-y-10">
            {responses.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Formulários Respondidos</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {responses.map((response) => (
                    <FormResponseCard key={response.id} response={response} />
                  ))}
                </div>
              </div>
            )}

            {isAdmin && createdForms.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-2xl font-semibold">Formulários Criados</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {createdForms.map((form) => (
                    <FormResponseCard key={form.id} form={form} isCreated />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
