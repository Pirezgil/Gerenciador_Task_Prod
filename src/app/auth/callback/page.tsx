'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { useStandardAlert } from '@/components/shared/StandardAlert';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setUser } = useAuthStore();
  const { showAlert, AlertComponent } = useStandardAlert();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const token = searchParams.get('token');
        const userString = searchParams.get('user');
        const error = searchParams.get('error');

        if (error) {
          console.error('Erro no callback:', error);
          showAlert(
            'Erro na Autenticação',
            'Erro na autenticação. Tente novamente.',
            'error'
          );
          router.push('/auth');
          return;
        }

        if (!token || !userString) {
          console.error('Token ou dados do usuário não encontrados');
          router.push('/auth');
          return;
        }

        // Decodificar dados do usuário
        const user = JSON.parse(decodeURIComponent(userString));

        // Salvar token no localStorage
        localStorage.setItem('auth-token', token);

        // Definir usuário no store
        setUser(user);

        // Redirecionar para a página principal
        router.push('/tarefas');
      } catch (error) {
        console.error('Erro ao processar callback:', error);
        router.push('/auth');
      }
    };

    handleCallback();
  }, [searchParams, router, setUser]);

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