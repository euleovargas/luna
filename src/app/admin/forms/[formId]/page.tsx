import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { FormBuilder } from "@/components/forms/FormBuilder";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Editar Formulário",
  description: "Edite um formulário existente",
};

interface EditFormPageProps {
  params: {
    formId: string;
  };
}

export default async function EditFormPage({ params }: EditFormPageProps) {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  const form = await prisma.dynamicForm.findUnique({
    where: {
      id: params.formId,
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
    notFound();
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Editar Formulário</h1>
          <p className="text-gray-500">
            Edite as informações do formulário
          </p>
        </div>

        <FormBuilder initialData={form} />
      </div>
    </div>
  );
}
