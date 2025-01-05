import { Metadata } from "next";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { UserRole } from "@prisma/client";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export const metadata: Metadata = {
  title: "Gerenciar Formulários",
  description: "Gerencie os formulários do sistema",
};

export default async function AdminFormsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== UserRole.ADMIN) {
    redirect("/");
  }

  const forms = await prisma.dynamicForm.findMany({
    include: {
      _count: {
        select: {
          responses: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Gerenciar Formulários</h1>
          <p className="text-gray-500">
            Crie e gerencie formulários para seus usuários
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/forms/new">Novo Formulário</Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Respostas</TableHead>
              <TableHead>Criado em</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell className="font-medium">{form.title}</TableCell>
                <TableCell>
                  <Badge
                    variant={form.isActive ? "default" : "secondary"}
                  >
                    {form.isActive ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell>{form._count.responses}</TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(form.createdAt), {
                    addSuffix: true,
                    locale: ptBR,
                  })}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/forms/${form.id}`}>
                        Editar
                      </Link>
                    </Button>
                    <Button asChild variant="ghost" size="sm">
                      <Link href={`/admin/forms/${form.id}/responses`}>
                        Ver Respostas
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {forms.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center"
                >
                  Nenhum formulário encontrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
