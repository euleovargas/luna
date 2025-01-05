"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface FormResponseCardProps {
  response: any;
}

export function FormResponseCard({ response }: FormResponseCardProps) {
  const router = useRouter();

  return (
    <Card className="p-6 space-y-4">
      <div>
        <h3 className="text-xl font-semibold">{response.form.title}</h3>
        <p className="text-sm text-gray-500">
          Atualizado{" "}
          {formatDistanceToNow(response.updatedAt, {
            addSuffix: true,
            locale: ptBR,
          })}
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Link 
          href={`/forms/responses/${response.id}`}
          onClick={() => router.refresh()}
        >
          <Button variant="outline">
            {response.status === "DRAFT" ? "Continuar preenchendo" : "Visualizar"}
          </Button>
        </Link>
      </div>
    </Card>
  );
}
