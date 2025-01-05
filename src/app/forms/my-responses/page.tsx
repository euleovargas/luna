import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { FormResponseCard } from "@/components/forms/FormResponseCard";

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

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Meus Formulários</h1>
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
  );
}
