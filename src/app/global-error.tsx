'use client';

import * as Sentry from '@sentry/nextjs';
import { useEffect } from 'react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Capturar o erro com contexto adicional
    Sentry.withScope((scope) => {
      scope.setLevel('fatal');
      scope.setTag('errorType', 'global');
      scope.setContext('error', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        digest: error.digest,
      });
      
      Sentry.captureException(error);
    });
  }, [error]);

  return (
    <html>
      <body>
        <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">
              Oops! Algo deu errado
            </h2>
            
            <p className="text-gray-600 mb-6">
              Não se preocupe, nosso time foi notificado e está trabalhando na solução.
            </p>

            <div className="space-y-4">
              <button
                onClick={() => reset()}
                className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded transition-colors w-full"
              >
                Tentar novamente
              </button>

              <button
                onClick={() => window.location.href = '/'}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded transition-colors w-full"
              >
                Voltar para a página inicial
              </button>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
