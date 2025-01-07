"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Form, FormResponse } from "@prisma/client";
import { Badge } from "@/components/ui/badge";

interface FormResponseCardProps {
  response?: FormResponse & { form: Form };
  form?: Form;
  isCreated?: boolean;
}

export function FormResponseCard({ response, form, isCreated }: FormResponseCardProps) {
  const router = useRouter();

  const title = isCreated ? form?.title : response?.form.title;
  const updatedAt = isCreated ? form?.updatedAt : response?.updatedAt;
  const status = response?.status;
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
        {status && (
          <Badge variant={status === "DRAFT" ? "outline" : "default"}>
            {status === "DRAFT" ? "Rascunho" : "Enviado"}
          </Badge>
        )}
      </CardContent>
      <CardFooter className="flex justify-end">
        <Link 
          href={isCreated ? `/admin/forms/${id}` : `/forms/responses/${id}`}
          onClick={() => router.refresh()}
        >
          <Button variant="outline">
            {isCreated 
              ? "Gerenciar" 
              : status === "DRAFT" 
                ? "Continuar preenchendo" 
                : "Visualizar"
            }
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
