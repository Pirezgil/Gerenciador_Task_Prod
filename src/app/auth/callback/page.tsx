'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';
import { useStandardAlert } from '@/components/shared/StandardAlert';

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const { showAlert, AlertComponent } = useStandardAlert();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const error = searchParams.get('error');

        if (error) {
          console.error('Erro no callback OAuth:', error);
          showAlert(
            'Erro na Autenticação',
            'Erro na autenticação. Tente novamente.',
            'error'
          );
          router.push('/auth');
          return;
        }

        // SEGURANÇA: Verificar apenas se callback foi bem-sucedido
        // Token é gerenciado automaticamente via cookies HTTP-only pelo backend
        const success = searchParams.get('success');
        
        if (success !== 'true') {
          console.error('Callback OAuth inválido');
          showAlert(
            'Erro na Autenticação',
            'Falha na autenticação. Tente novamente.',
            'error'
          );
          router.push('/auth');
          return;
        }

        // Aguardar um pouco para cookies serem processados
        await new Promise(resolve => setTimeout(resolve, 500));

        // Refresh user data from the new auth system
        // O cookie HTTP-only já foi definido pelo backend
        await refreshUser();

        // Redirecionar para a página principal
        router.push('/tarefas');
      } catch (error) {
        console.error('Erro ao processar callback:', error);
        showAlert(
          'Erro na Autenticação',
          'Falha na autenticação. Tente novamente.',
          'error'
        );
        router.push('/auth');
      }
    };

    handleCallback();
  }, [searchParams, router, refreshUser, showAlert]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center p-4">
      <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8 text-center">
        <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-gray-900 mb-2">
          Processando autenticação...
        </h1>
        <p className="text-gray-600">
          Aguarde enquanto finalizamos seu login
        </p>
        <AlertComponent />
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Processando autenticação...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}