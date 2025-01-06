import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ResponseNotFound() {
  return (
    <div className="container mx-auto py-10">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold">Resposta não encontrada</h1>
        <p className="text-gray-500 mt-2">
          A resposta que você está procurando não existe ou você não tem permissão para acessá-la.
        </p>
        <Link href="/forms/my-responses" className="mt-6 inline-block">
          <Button>Voltar para meus formulários</Button>
        </Link>
      </div>
    </div>
  );
}
