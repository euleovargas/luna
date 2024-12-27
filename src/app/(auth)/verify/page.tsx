"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      toast.error("Token não fornecido");
      router.push("/login");
      return;
    }

    // Faz a requisição para verificar o email
    fetch(`/api/auth/verify?token=${token}`)
      .then(async (res) => {
        if (res.ok) {
          toast.success("Email verificado com sucesso!");
          router.push("/login");
        } else {
          const data = await res.json();
          toast.error(data.error || "Erro ao verificar email");
          router.push("/login");
        }
      })
      .catch((error) => {
        console.error("[VERIFY]", error);
        toast.error("Erro ao verificar email");
        router.push("/login");
      });
  }, [searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Verificando seu email...</h1>
      <p className="text-gray-500">Por favor, aguarde um momento.</p>
    </div>
  );
}
