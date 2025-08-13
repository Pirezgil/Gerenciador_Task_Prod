// ============================================================================
// LOGIN FORM - Formulário de login integrado com API
// ============================================================================

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLogin } from '@/hooks/api/useAuth';
import { useAuthNotifications, useAsyncNotification } from '@/hooks/useNotification';
import { Button } from '@/components/ui/button';

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const login = useLogin();
  const router = useRouter();
  
  // Hooks de notificação
  const authNotifications = useAuthNotifications();
  const { withLoading } = useAsyncNotification();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      authNotifications.loginError('Por favor, preencha todos os campos');
      return;
    }

    try {
      const result = await withLoading(
        () => login.mutateAsync({ email, password }),
        {
          loading: 'Fazendo login...',
          success: `Bem-vindo de volta!`
        },
        {
          context: 'authentication'
        }
      );
      
      // Sucesso já é mostrado pelo withLoading, apenas redirecionar
      router.push('/');
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || 'Erro ao fazer login';
      authNotifications.loginError(errorMessage);
      setError(errorMessage);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6 text-center">Login</h1>
      
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="seu@email.com"
            required
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
            required
          />
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={login.isPending}
        >
          {login.isPending ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <div className="mt-4 text-center space-y-2">
        <div>
          <a href="/auth/forgot-password" className="text-sm text-gray-600 hover:text-gray-800">
            Esqueci minha senha
          </a>
        </div>
        <div>
          <a href="/register" className="text-sm text-blue-600 hover:text-blue-800">
            Não tem conta? Cadastre-se
          </a>
        </div>
      </div>
    </div>
  );
}