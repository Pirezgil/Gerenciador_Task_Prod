'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'next/navigation';
import { useStandardAlert } from '@/components/shared/StandardAlert';

interface SocialLoginProps {
  onSuccess?: () => void;
  className?: string;
}

// Simulação das funções de autenticação social
// Em uma implementação real, você usaria as SDKs oficiais
const FacebookIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

export function SocialLogin({ onSuccess, className = '' }: SocialLoginProps) {
  const [isLoading, setIsLoading] = useState<'facebook' | 'google' | null>(null);
  const { setUser } = useAuthStore();
  const router = useRouter();
  const { showAlert, AlertComponent } = useStandardAlert();

  // Simulação de login com Facebook
  const handleFacebookLogin = async () => {
    setIsLoading('facebook');
    
    try {
      // Simulação de autenticação com Facebook
      // Em uma implementação real, você usaria o Facebook SDK
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simula loading
      
      // Dados simulados de resposta do Facebook
      const facebookUser = {
        id: `fb_${Date.now()}`,
        name: 'Usuário Facebook',
        email: 'usuario@facebook.com',
        avatar_url: 'https://via.placeholder.com/40x40/4267B2/ffffff?text=FB',
        provider: 'facebook',
        providerId: 'facebook_123456789',
        settings: {
          theme: 'light',
          timezone: 'America/Sao_Paulo',
          dailyEnergyBudget: 15,
          notifications: {
            email: true,
            push: true,
            deadlines: true
          }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Salvar token primeiro
      localStorage.setItem('auth-token', `facebook_token_${facebookUser.id}`);
      
      // Definir usuário e marcar como autenticado
      setUser(facebookUser);
      
      // Forçar recarregamento da página para garantir estado consistente
      window.location.href = '/tarefas';
      
    } catch (error) {
      console.error('Erro no login com Facebook:', error);
      showAlert(
        'Erro no Login',
        'Erro ao fazer login com Facebook. Tente novamente.',
        'error'
      );
    } finally {
      setIsLoading(null);
    }
  };

  // Login com Google via OAuth
  const handleGoogleLogin = async () => {
    setIsLoading('google');
    
    try {
      // Redirecionar para a rota do Google OAuth no backend
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`;
    } catch (error) {
      console.error('Erro ao iniciar login com Google:', error);
      showAlert(
        'Erro no Login',
        'Erro ao fazer login com Google. Tente novamente.',
        'error'
      );
      setIsLoading(null);
    }
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-300" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-2 bg-white text-gray-500">ou continue com</span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <Button
          onClick={handleFacebookLogin}
          disabled={isLoading !== null}
          variant="outline"
          className="w-full flex items-center justify-center gap-3 py-3 border-gray-300 hover:bg-gray-50 transition-colors"
        >
          {isLoading === 'facebook' ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
          ) : (
            <FacebookIcon />
          )}
          <span className="text-gray-700 font-medium">
            {isLoading === 'facebook' ? 'Conectando...' : 'Continuar com Facebook'}
          </span>
        </Button>

        <Button
          onClick={handleGoogleLogin}
          disabled={isLoading !== null}
          variant="outline"
          className="w-full flex items-center justify-center gap-3 py-3 border-gray-300 hover:bg-gray-50 transition-colors"
        >
          {isLoading === 'google' ? (
            <div className="w-5 h-5 border-2 border-gray-300 border-t-red-600 rounded-full animate-spin" />
          ) : (
            <GoogleIcon />
          )}
          <span className="text-gray-700 font-medium">
            {isLoading === 'google' ? 'Conectando...' : 'Continuar com Google'}
          </span>
        </Button>
      </div>

      <div className="text-xs text-gray-500 text-center mt-4">
        Ao continuar, você aceita nossos{' '}
        <a href="#" className="text-blue-600 hover:text-blue-700 underline">
          Termos de Serviço
        </a>{' '}
        e{' '}
        <a href="#" className="text-blue-600 hover:text-blue-700 underline">
          Política de Privacidade
        </a>
      </div>
      <AlertComponent />
    </div>
  );
}