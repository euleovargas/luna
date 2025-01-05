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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
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
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Última atualização</TableHead>
                  <TableHead>Campos preenchidos</TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {form.responses.map((response) => (
                  <TableRow key={response.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarImage src={response.user.image || undefined} />
                          <AvatarFallback>
                            {response.user.name?.[0]?.toUpperCase() || 
                             response.user.email?.[0]?.toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {response.user.name || response.user.email}
                          </span>
                          {response.user.name && (
                            <span className="text-sm text-gray-500">
                              {response.user.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={response.status === "DRAFT" ? "secondary" : "default"}
                      >
                        {response.status === "DRAFT" ? "Rascunho" : "Enviado"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {formatDistanceToNow(response.updatedAt, {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </TableCell>
                    <TableCell>
                      {response.fields.length} / {form.fields.length}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-8 w-8 p-0"
                          >
                            <span className="sr-only">Abrir menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Ações</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem asChild>
                            <Link href={`/forms/responses/${response.id}`}>
                              Visualizar respostas
                            </Link>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
