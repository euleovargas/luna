import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const metadata: Metadata = {
  title: "Respostas do Formulário",
  description: "Visualize todas as respostas deste formulário",
};

interface Props {
  params: {
    formId: string;
  };
}

export default async function FormResponsesPage({ params }: Props) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== "ADMIN") {
    redirect("/");
  }

  // Buscar o formulário e suas respostas
  const form = await prisma.dynamicForm.findUnique({
    where: {
      id: params.formId,
    },
    include: {
      responses: {
        where: {
          status: "SUBMITTED",
        },
        include: {
          user: {
            select: {
              name: true,
              email: true,
            },
          },
          fields: {
            include: {
              field: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
  });

  if (!form) {
    redirect("/admin/forms");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex flex-col space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{form.title}</h1>
            <p className="text-gray-500">Respostas submetidas</p>
          </div>
          <Link href="/admin/forms">
            <Button variant="outline">Voltar</Button>
          </Link>
        </div>

        {form.responses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-500">
              Ainda não há respostas para este formulário
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {form.responses.map((response) => (
              <Card key={response.id} className="p-6">
                <div className="flex flex-col space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">
                        {response.user.name || response.user.email}
                      </h3>
                      <p className="text-sm text-gray-500">
                        Enviado{" "}
                        {formatDistanceToNow(response.updatedAt, {
                          addSuffix: true,
                          locale: ptBR,
                        })}
                      </p>
                    </div>
                    <Link href={`/forms/responses/${response.id}`}>
                      <Button variant="outline">Visualizar</Button>
                    </Link>
                  </div>

                  <div className="grid gap-4">
                    {response.fields.map((fieldResponse) => (
                      <div key={fieldResponse.id}>
                        <p className="font-medium">{fieldResponse.field.label}</p>
                        <p className="text-gray-600">{fieldResponse.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
