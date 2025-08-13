'use client';

// ============================================================================
// PÁGINA DE AUTENTICAÇÃO - Login e Register (ISOLADA - SEM MIDDLEWARE)
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/AuthProvider';

export default function AuthPage() {
  const router = useRouter();
  const { login, isAuthenticated, isLoading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    email: 'demo@gerenciador.com',
    password: 'demo1234',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'credentials' | 'user_exists' | 'network' | 'rate_limit' | 'general' | null>(null);

  // Redirecionar se já autenticado
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      router.push('/bombeiro');
    }
  }, [isAuthenticated, authLoading, router]);
  
  // Detectar Chrome e limpar dados problemáticos
  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
      
      console.log('🔍 Navegador detectado:', {
        userAgent: navigator.userAgent,
        isChrome,
        localStorage: Object.keys(localStorage).length,
        serviceWorker: 'serviceWorker' in navigator
      });
      
      if (isChrome) {
        console.log('🔧 Chrome detectado - verificando dados corrompidos...');
        
        // Verificar se há dados problemáticos
        const cerebro = localStorage.getItem('cerebro-auth');
        if (cerebro) {
          console.log('⚠️ Dados cerebro-auth encontrados no Chrome - removendo...');
          localStorage.removeItem('cerebro-auth');
        }
      }
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setErrorType(null);
    
    // Validação básica dos campos
    if (!formData.email || !formData.password) {
      setErrorType('credentials');
      setError('📝 Por favor, preencha todos os campos obrigatórios.');
      setIsLoading(false);
      return;
    }
    
    try {
      await login(formData.email, formData.password);
      // Redirecionamento automático via useEffect
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      console.error('Error response:', error?.response);
      console.error('Error data:', error?.response?.data);
      
      // Determinar tipo de erro para exibição específica
      const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Erro desconhecido';
      const errorCode = error?.response?.data?.error?.code;
      
      // Classificar tipo de erro com mais precisão
      if (error?.response?.status === 401 || 
          errorCode === 'AUTH_INVALID_CREDENTIALS' || 
          errorMessage.includes('incorretos') || 
          errorMessage.includes('inválidas') ||
          errorMessage.includes('Email ou senha') ||
          errorMessage.includes('Unauthorized')) {
        setErrorType('credentials');
        setError('❌ Email ou senha incorretos. Verifique seus dados e tente novamente.');
      } else if (errorCode === 'AUTH_USER_NOT_FOUND' || errorMessage.includes('não encontrado')) {
        setErrorType('credentials');
        setError('❌ Email não cadastrado. Verifique o endereço ou crie uma conta.');
      } else if (errorCode === 'AUTH_USER_EXISTS' || errorMessage.includes('já existe')) {
        setErrorType('user_exists');
        setError('Este email já está cadastrado. Tente fazer login ou use a recuperação de senha.');
      } else if (error?.code === 'ERR_NETWORK' || error?.response?.status >= 500) {
        setErrorType('network');
        setError('🌐 Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (error?.response?.status === 429) {
        setErrorType('rate_limit');
        const retryAfter = error?.response?.headers?.['retry-after'] || error?.response?.headers?.['Retry-After'];
        const waitTime = retryAfter ? Math.ceil(retryAfter / 60) : 5;
        setError(`🚫 Muitas tentativas de login. Por segurança, aguarde ${waitTime} minutos antes de tentar novamente.`);
      } else {
        setErrorType('general');
        setError(`⚠️ ${errorMessage}`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limpar erros quando usuário começa a digitar
    if (error) {
      setError('');
      setErrorType(null);
    }
    
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🧠</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sentinela
          </h1>
          <p className="text-gray-600">
            Entre em sua conta para acessar o sistema
          </p>
        </div>

        {/* Success Message */}
        {isAuthenticated && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
            <p className="text-green-700 text-sm">
              ✅ Login realizado com sucesso! Redirecionando...
            </p>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className={`border rounded-xl p-4 mb-4 ${
            errorType === 'credentials' ? 'bg-red-50 border-red-200' :
            errorType === 'network' ? 'bg-blue-50 border-blue-200' :
            errorType === 'rate_limit' ? 'bg-orange-50 border-orange-200' :
            'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-sm ${
                  errorType === 'credentials' ? 'bg-red-100 text-red-600' :
                  errorType === 'network' ? 'bg-blue-100 text-blue-600' :
                  errorType === 'rate_limit' ? 'bg-orange-100 text-orange-600' :
                  'bg-yellow-100 text-yellow-600'
                }`}>
                  {errorType === 'credentials' && '✕'}
                  {errorType === 'network' && 'i'}
                  {errorType === 'rate_limit' && '⏰'}
                  {(errorType === 'general' || errorType === 'user_exists') && '!'}
                </div>
              </div>
              
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  errorType === 'credentials' ? 'text-red-800' :
                  errorType === 'network' ? 'text-blue-800' :
                  errorType === 'rate_limit' ? 'text-orange-800' :
                  'text-yellow-800'
                }`}>
                  {error}
                </p>
                
                {errorType === 'credentials' && !error.includes('preencha') && (
                  <div className="mt-3 flex flex-col sm:flex-row gap-2">
                    <button
                      type="button"
                      onClick={() => router.push('/auth/forgot-password')}
                      className="text-red-700 hover:text-red-800 text-sm font-medium underline transition-colors"
                    >
                      🔑 Esqueci minha senha
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/register')}
                      className="text-red-700 hover:text-red-800 text-sm font-medium underline transition-colors"
                    >
                      ➕ Criar nova conta
                    </button>
                  </div>
                )}
                
                {errorType === 'rate_limit' && (
                  <div className="mt-3 p-3 bg-orange-100 rounded-lg">
                    <p className="text-xs text-orange-700 mb-2">
                      <strong>💡 Dicas enquanto aguarda:</strong>
                    </p>
                    <ul className="text-xs text-orange-600 space-y-1">
                      <li>• Verifique se está usando o email e senha corretos</li>
                      <li>• Tente recuperar sua senha se não lembrar</li>
                      <li>• Esta proteção evita tentativas de invasão</li>
                    </ul>
                    <div className="mt-2">
                      <button
                        type="button"
                        onClick={() => router.push('/auth/forgot-password')}
                        className="text-orange-700 hover:text-orange-800 text-xs font-medium underline"
                      >
                        🔑 Recuperar senha
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Entrando...
              </div>
            ) : (
              'Entrar'
            )}
          </button>
        </form>

        {/* Links de navegação */}
        <div className="mt-6 text-center space-y-2">
          <p className="text-sm text-gray-600">
            Não tem uma conta?{' '}
            <button
              type="button"
              onClick={() => router.push('/register')}
              className="text-blue-600 hover:text-blue-700 font-medium underline transition-colors"
            >
              Criar conta
            </button>
          </p>
          
          <p className="text-sm text-gray-600">
            Esqueceu sua senha?{' '}
            <button
              type="button"
              onClick={() => router.push('/auth/forgot-password')}
              className="text-purple-600 hover:text-purple-700 font-medium underline transition-colors"
            >
              Recuperar senha
            </button>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Desenvolvido especialmente para usuários neurodivergentes
          </p>
        </div>

        {/* Quick Login para desenvolvimento */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <p className="text-xs text-blue-700 mb-2 font-medium">🚀 Acesso Rápido (Desenvolvimento)</p>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                // Usar as credenciais já preenchidas
                const event = new Event('submit', { bubbles: true, cancelable: true });
                const form = document.querySelector('form');
                if (form) {
                  form.dispatchEvent(event);
                }
              }}
              className="w-full text-sm bg-blue-100 text-blue-700 py-2 rounded-lg hover:bg-blue-200 transition-colors"
            >
              🚀 Login Automático
            </button>
            <button
              type="button"
              onClick={() => {
                console.log('🧹 Limpando TODOS os dados...');
                if (typeof window !== 'undefined') {
                  localStorage.clear();
                  sessionStorage.clear();
                  // Para cookies HTTP-only, apenas recarregar
                  alert('Cache local limpo! Recarregando...');
                  window.location.reload();
                }
              }}
              className="w-full text-sm bg-red-100 text-red-700 py-2 rounded-lg hover:bg-red-200 transition-colors"
            >
              🧹 RESET COMPLETO (Emergência)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
