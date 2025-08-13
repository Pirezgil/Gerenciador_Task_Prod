'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import api from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState<'not_found' | 'network' | 'general' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await api.post('/auth/forgot-password', { email });
      
      if (response.data.success) {
        setIsSubmitted(true);
      }
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || err.response?.data?.message || 'Erro ao solicitar redefinição de senha';
      const errorCode = err.response?.data?.error?.code;
      
      // Classificar tipo de erro
      if (errorCode === 'AUTH_USER_NOT_FOUND' || errorMessage.includes('não encontrado')) {
        setErrorType('not_found');
        setError('Email não encontrado. Verifique o endereço ou cadastre-se primeiro.');
      } else if (err?.code === 'ERR_NETWORK') {
        setErrorType('network');
        setError('Erro de conexão. Verifique sua internet e tente novamente.');
      } else {
        setErrorType('general');
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md p-8"
        >
          {/* Success Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📧</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Email Enviado!
            </h1>
            <p className="text-gray-600 text-center">
              Se este email estiver cadastrado, você receberá um link para redefinir sua senha.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
            <p className="text-sm text-blue-800 font-medium mb-2">📋 Instruções:</p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Verifique sua caixa de entrada</li>
              <li>• Clique no link no email</li>
              <li>• O link expira em 1 hora</li>
              <li>• Verifique também o spam</li>
            </ul>
          </div>

          {/* Back to Login */}
          <Link href="/auth">
            <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all">
              Voltar para Login
            </Button>
          </Link>

          {/* Resend */}
          <div className="mt-4 text-center">
            <button
              onClick={async () => {
                setIsSubmitted(false);
                setError('');
              }}
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Não recebeu? Tentar novamente
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/40 to-indigo-50/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 w-full max-w-md p-8"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Esqueci Minha Senha
          </h1>
          <p className="text-gray-600 text-center">
            Digite seu email e enviaremos um link para redefinir sua senha
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className={`mb-6 p-4 border rounded-xl ${
            errorType === 'not_found' ? 'bg-blue-50 border-blue-200' :
            errorType === 'network' ? 'bg-gray-50 border-gray-200' :
            'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 text-base">
                {errorType === 'not_found' && '👤'}
                {errorType === 'network' && '🌐'}
                {errorType === 'general' && '⚠️'}
              </span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${
                  errorType === 'not_found' ? 'text-blue-800' :
                  errorType === 'network' ? 'text-gray-800' :
                  'text-red-800'
                }`}>
                  {error}
                </p>
                
                {errorType === 'not_found' && (
                  <div className="mt-2">
                    <button
                      type="button"
                      onClick={() => router.push('/register')}
                      className="text-blue-700 hover:text-blue-800 font-medium underline text-sm"
                    >
                      Criar nova conta
                    </button>
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
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                // Limpar erro ao começar a digitar
                if (error) {
                  setError('');
                  setErrorType(null);
                }
              }}
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              placeholder="seu@email.com"
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-medium hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Enviando...
              </div>
            ) : (
              'Enviar Link de Redefinição'
            )}
          </Button>
        </form>

        {/* Back to Login */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Lembrou da senha?{' '}
            <Link href="/auth" className="text-blue-600 hover:text-blue-700 font-medium">
              Fazer login
            </Link>
          </p>
        </div>

        {/* Security Info */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600 text-center">
            🔒 Por segurança, mesmo emails não cadastrados receberão esta mensagem de confirmação
          </p>
        </div>
      </motion.div>
    </div>
  );
}