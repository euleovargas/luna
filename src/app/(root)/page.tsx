'use client';

import Link from "next/link";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";
import { useSession, signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { useSearchParams } from "@/hooks/use-search-params";
import { useToast } from "@/components/ui/use-toast";
import { UserRole } from "@prisma/client"

interface CustomSession {
  user: {
    id: string
    name?: string | null
    email?: string | null
    image?: string | null
    role: UserRole
  }
  expires: string
}

export default function Home() {
  const { data: sessionData } = useSession();
  const session = sessionData as CustomSession;
  const searchParams = useSearchParams();
  const { toast } = useToast();

  // Configurar contexto global do usuário para o Sentry
  useEffect(() => {
    if (session?.user) {
      Sentry.setUser({
        id: session.user.id,
        email: session.user.email || undefined,
        username: session.user.name || undefined,
      });
    }
  }, [session]);

  // Login automático após verificação de email
  useEffect(() => {
    const verified = searchParams.get("verified");
    const email = searchParams.get("email");

    if (verified === "true" && email && !session) {
      // Faz o login automático
      toast({
        title: "Email verificado com sucesso!",
        description: "Você será conectado automaticamente.",
      });

      signIn("credentials", {
        email,
        callbackUrl: "/",
      });
    }
  }, [searchParams, session, toast]);

  return (
    <main className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Welcome to Luna
        </p>
      </div>

      <div className="relative flex place-items-center">
        <h1 className="text-4xl font-bold">
          {session ? 'Welcome back!' : 'Authentication Platform'}
        </h1>
      </div>

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-3 lg:text-left mt-10">
        {session ? (
          <>
            <Button
              variant="outline"
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              asChild
            >
              <Link href="/profile">
                <h2 className="mb-3 text-2xl font-semibold">
                  Profile{" "}
                  <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                    -&gt;
                  </span>
                </h2>
                <p className="m-0 max-w-[30ch] text-sm opacity-50">
                  View and edit your profile information
                </p>
              </Link>
            </Button>

            <Button
              variant="outline"
              className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
              onClick={() => {
                const error = new Error('Test error from Luna app');
                Sentry.captureException(error);
                throw error;
              }}
            >
              <h2 className="mb-3 text-2xl font-semibold">
                Test Error{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
              <p className="m-0 max-w-[30ch] text-sm opacity-50">
                Generate a test error for Sentry
              </p>
            </Button>
          </>
        ) : (
          <Button
            variant="outline"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
            asChild
          >
            <Link href="/login">
              <h2 className="mb-3 text-2xl font-semibold">
                Login{" "}
                <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
                  -&gt;
                </span>
              </h2>
              <p className="m-0 max-w-[30ch] text-sm opacity-50">
                Sign in to access your account
              </p>
            </Link>
          </Button>
        )}
      </div>
    </main>
  );
}
