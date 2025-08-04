'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Eye, EyeOff, ShieldAlert, Key } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

interface SandboxAuthProps {
  onUnlock: () => void;
}

export function SandboxAuth({ onUnlock }: SandboxAuthProps) {
  const { sandboxAuth, unlockSandbox, checkSandboxPassword } = useAuthStore();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const maxAttempts = 3;
  const isBlocked = sandboxAuth.failedAttempts >= maxAttempts;

  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBlocked) {
      setError('Muitas tentativas. Aguarde 5 minutos.');
      return;
    }

    if (!password.trim()) {
      setError('Por favor, digite a senha');
      return;
    }

    setIsLoading(true);
    setError('');

    // Simular delay de verificação
    await new Promise(resolve => setTimeout(resolve, 800));

    const success = checkSandboxPassword(password);
    
    if (success) {
      unlockSandbox();
      setPassword('');
      onUnlock();
    } else {
      setError(
        `Senha incorreta. ${maxAttempts - sandboxAuth.failedAttempts - 1} tentativas restantes.`
      );
      setPassword('');
    }
    
    setIsLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading && !isBlocked) {
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        className="w-full max-w-md"
      >
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-amber-200/50">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-20 h-20 mx-auto bg-gradient-to-r from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6"
            >
              <Lock className="w-10 h-10 theme-text-on-primary" />
            </motion.div>
            
            <h1 className="text-2xl font-bold theme-text mb-2">
              🏖️ Caixa de Areia Privada
            </h1>
            
            <p className="theme-text-secondary text-sm">
              Este é seu espaço privado e seguro para pensamentos pessoais.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div className="relative">
                <label className="block text-sm font-semibold theme-text-secondary mb-2">
                  <Key className="w-4 h-4 inline mr-2" />
                  Senha da Caixa de Areia
                </label>
                
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Digite sua senha especial"
                    disabled={isLoading || isBlocked}
                    className="w-full pl-4 pr-12 py-4 border border-amber-200 rounded-2xl focus:outline-none focus:ring-4 focus:ring-amber-400/20 focus:border-amber-400 disabled:bg-gray-100 disabled:cursor-not-allowed transition-all duration-300"
                  />
                  
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isBlocked}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:theme-text-secondary transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Error Message */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex items-center space-x-2 text-red-600 bg-red-50 p-3 rounded-xl border border-red-200"
                  >
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{error}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Attempts Warning */}
              {sandboxAuth.failedAttempts > 0 && !isBlocked && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-xs text-orange-600 bg-orange-50 p-2 rounded-lg border border-orange-200 text-center"
                >
                  ⚠️ {sandboxAuth.failedAttempts} tentativa(s) incorreta(s)
                </motion.div>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading || isBlocked || !password.trim()}
              whileHover={{ scale: !isLoading && !isBlocked ? 1.02 : 1 }}
              whileTap={{ scale: !isLoading && !isBlocked ? 0.98 : 1 }}
              className={`w-full py-4 rounded-2xl font-semibold theme-text-on-primary transition-all duration-300 ${
                isLoading || isBlocked || !password.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/25'
              }`}
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Verificando...</span>
                </div>
              ) : isBlocked ? (
                'Bloqueado - Aguarde 5 minutos'
              ) : (
                'Entrar na Caixa de Areia'
              )}
            </motion.button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-amber-200/50 text-center">
            <p className="text-xs theme-text-muted">
              💡 Dica: Configure sua senha na página de Perfil
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
