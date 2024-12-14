'use client';

import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { useSearchParams } from "@/hooks/use-search-params";
import { useToast } from "@/components/ui/use-toast";
import { CustomSession } from "@/types";

export function DashboardClient() {
  const { data: sessionData } = useSession();
  const session = sessionData as CustomSession;
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Login automático após verificação de email
  useEffect(() => {
    const verified = searchParams.get("verified");
    const email = searchParams.get("email");

    if (verified === "true" && email && !session) {
      toast({
        title: "Email verificado com sucesso!",
        description: "Você será conectado automaticamente.",
      });

      signIn("credentials", {
        email,
        callbackUrl: "/dashboard",
        redirect: false,
      }).then((response) => {
        if (response?.error) {
          toast({
            title: "Erro ao fazer login",
            description: "Por favor, tente fazer login manualmente",
            variant: "destructive",
          });
        }
      });
    }
  }, [searchParams, session, toast]);

  if (!session) {
    return null;
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Bem-vindo, {session.user.name}!</p>
    </div>
  );
}
