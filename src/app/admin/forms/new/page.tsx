import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { UserRole } from "@prisma/client";
import { FormBuilder } from "@/components/forms/FormBuilder";

export const metadata: Metadata = {
  title: "Novo Formulário",
  description: "Crie um novo formulário",
};

export default async function NewFormPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  return (
    <div className="container mx-auto py-10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Novo Formulário</h1>
          <p className="text-gray-500">
            Crie um novo formulário para seus usuários
          </p>
        </div>

        <FormBuilder />
      </div>
    </div>
  );
}
