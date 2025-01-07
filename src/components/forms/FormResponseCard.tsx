"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { DynamicForm, FormResponse } from "@prisma/client";

type ResponseWithForm = FormResponse & {
  form: DynamicForm;
};

interface FormResponseCardProps {
  response?: ResponseWithForm;
  form?: DynamicForm;
  isCreated?: boolean;
}

export function FormResponseCard({ response, form, isCreated }: FormResponseCardProps) {
  const router = useRouter();

  const title = isCreated ? form?.title : response?.form.title;
  const updatedAt = isCreated ? form?.updatedAt : response?.updatedAt;
  const id = isCreated ? form?.id : response?.id;

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle className="line-clamp-1">{title}</CardTitle>
        <CardDescription>
          Atualizado{" "}
          {formatDistanceToNow(updatedAt!, {
            addSuffix: true,
            locale: ptBR,
          })}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1">
        {!isCreated && (
          <p className="text-sm text-muted-foreground">
            Clique em Editar para modificar suas respostas
          </p>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Link 
          href={isCreated ? `/admin/forms/${id}` : `/forms/responses/${id}`}
          onClick={() => router.refresh()}
        >
          <Button variant="outline">
            {isCreated ? "Gerenciar" : "Editar"}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
