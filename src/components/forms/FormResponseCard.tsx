import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

interface FormResponseCardProps {
  response: {
    id: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    form: {
      title: string;
      description?: string | null;
    };
  };
}

export function FormResponseCard({ response }: FormResponseCardProps) {
  const statusColor = {
    draft: "bg-yellow-500",
    submitted: "bg-green-500",
  }[response.status] || "bg-gray-500";

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div>
          <CardTitle className="text-2xl font-bold">{response.form.title}</CardTitle>
          {response.form.description && (
            <CardDescription>{response.form.description}</CardDescription>
          )}
        </div>
        <Badge
          className={`${statusColor} text-white capitalize px-2 py-1`}
        >
          {response.status}
        </Badge>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-2">
          <div className="text-sm text-gray-500">
            Criado{" "}
            {formatDistanceToNow(response.createdAt, {
              addSuffix: true,
              locale: ptBR,
            })}
          </div>
          <div className="text-sm text-gray-500">
            Última atualização{" "}
            {formatDistanceToNow(response.updatedAt, {
              addSuffix: true,
              locale: ptBR,
            })}
          </div>
          <div className="flex space-x-2 mt-4">
            <Button asChild>
              <Link href={`/forms/responses/${response.id}`}>
                {response.status === "draft" ? "Continuar preenchendo" : "Visualizar"}
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
