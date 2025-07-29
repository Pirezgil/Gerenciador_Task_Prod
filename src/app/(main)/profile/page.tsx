// ============================================================================
// PÁGINA DE PERFIL - Informações pessoais do usuário
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/stores/authStore';
import { useThemeStore } from '@/stores/themeStore';
import { UserProfile } from '@/components/profile/UserProfile';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const { currentTheme } = useThemeStore();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {/* Header do Perfil */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 text-white">
          <div className="flex items-center space-x-6">
            <div
              className="w-20 h-20 rounded-2xl flex items-center justify-center overflow-hidden bg-white/20 backdrop-blur-sm"
            >
              {user?.avatar_url ? (
                <img
                  src={user.avatar_url}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>
            <div>
              <h2 className="text-3xl font-bold">{user?.name || 'Usuário'}</h2>
              <p className="text-white/80 text-lg">{user?.email}</p>
              <p className="text-white/60 text-sm mt-1">
                Membro desde {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </div>

        {/* Conteúdo do Perfil */}
        <div className="p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UserProfile />
          </motion.div>
        </div>
      </div>

      {/* Card de acesso rápido às configurações */}
      <div className="mt-6 bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Quer personalizar o sistema?
            </h3>
            <p className="text-gray-600 text-sm">
              Acesse as configurações para personalizar aparência, notificações e mais
            </p>
          </div>
          <Link href="/settings">
            <Button className="bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}