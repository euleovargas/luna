'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function ProfileError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="container flex max-w-2xl flex-col items-center justify-center gap-4 py-10">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Erro ao carregar perfil</h2>
        <p className="text-muted-foreground">
          Ocorreu um erro ao carregar suas informações.
        </p>
      </div>
      <Button onClick={() => reset()}>Tentar novamente</Button>
    </div>
  );
}
