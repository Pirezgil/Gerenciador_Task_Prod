'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useRegister } from '@/hooks/api/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'user_exists' | 'validation' | 'password_match' | 'network' | 'rate_limit' | 'general' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setErrorType(null);
    
    if (formData.password !== formData.confirmPassword) {
      setErrorType('password_match');
      setError('As senhas não coincidem. Verifique e digite novamente.');
      return;
    }

    // Validar critérios de senha forte
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/;
    if (formData.password.length < 8 || !passwordRegex.test(formData.password)) {
      setErrorType('validation');
      setError('Senha deve conter pelo menos 8 caracteres: letra minúscula, maiúscula, número e símbolo (@$!%*?&)');
      return;
    }

    try {
      const result = await registerMutation.mutateAsync({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      // Aguardar um pouco para garantir que o token foi salvo
      setTimeout(() => {
        router.push('/');
      }, 100);
    } catch (error: any) {
      console.error('Erro no registro:', error);
      
      // Determinar tipo de erro para exibição específica
      const errorMessage = error?.response?.data?.error?.message || error?.response?.data?.message || error?.message || 'Erro ao criar conta';
      const errorCode = error?.response?.data?.error?.code;
      
      // Classificar tipo de erro
      if (errorCode === 'AUTH_USER_EXISTS' || errorMessage.includes('já existe') || errorMessage.includes('cadastrado')) {
        setErrorType('user_exists');
        setError('Este email já está cadastrado. Tente fazer login ou use outro email.');
      } else if (error?.response?.status === 429) {
        setErrorType('rate_limit');
        const retryAfter = error?.response?.headers?.['retry-after'] || error?.response?.headers?.['Retry-After'];
        const waitTime = retryAfter ? Math.ceil(retryAfter / 60) : 5;
        setError(`🚫 Muitas tentativas de registro. Por segurança, aguarde ${waitTime} minutos antes de tentar novamente.`);
      } else if (error?.code === 'ERR_NETWORK') {
        setErrorType('network');
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else if (errorMessage.includes('validação') || errorMessage.includes('inválido')) {
        setErrorType('validation');
        setError(errorMessage);
      } else {
        setErrorType('general');
        setError(errorMessage);
      }
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
            Criar Conta
          </h1>
          <p className="text-gray-600">
            Crie sua conta no Sentinela
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className={`mb-4 p-3 border rounded-xl text-sm ${
            errorType === 'user_exists' ? 'bg-blue-50 border-blue-200 text-blue-700' :
            errorType === 'validation' ? 'bg-amber-50 border-amber-200 text-amber-700' :
            errorType === 'password_match' ? 'bg-orange-50 border-orange-200 text-orange-700' :
            errorType === 'network' ? 'bg-gray-50 border-gray-200 text-gray-700' :
            'bg-red-50 border-red-200 text-red-700'
          }`}>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 text-base">
                {errorType === 'user_exists' && '👤'}
                {errorType === 'validation' && '🔒'}
                {errorType === 'password_match' && '🔄'}
                {errorType === 'network' && '🌐'}
                {errorType === 'general' && '⚠️'}
              </span>
              <div className="flex-1">
                <p>{error}</p>
                
                {errorType === 'user_exists' && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => router.push('/auth')}
                      className="text-blue-700 hover:text-blue-800 font-medium underline text-sm"
                    >
                      Ir para login
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
              Nome Completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="Seu nome"
            />
          </div>

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
              minLength={8}
              pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
              title="Senha deve conter: letra minúscula, maiúscula, número e símbolo"
            />
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 8 caracteres: letra minúscula, maiúscula, número e símbolo (@$!%*?&)
            </p>
          </div>

          {/* Confirm Password */}
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
              Confirmar Senha
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={8}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {registerMutation.isPending ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Criando conta...
              </div>
            ) : (
              'Criar Conta'
            )}
          </Button>
        </form>


        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Já tem uma conta?{' '}
            <Link href="/auth" className="text-blue-600 hover:text-blue-700 font-medium">
              Fazer login
            </Link>
          </p>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            Desenvolvido especialmente para usuários neurodivergentes
          </p>
        </div>
      </motion.div>
    </div>
  );
}