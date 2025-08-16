// ============================================================================
// PÁGINA DE PERFIL - Informações pessoais do usuário
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, Settings, ListTodo } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { UserProfile } from '@/components/profile/UserProfile';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Mobile-First Design */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 sm:py-6 lg:py-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="min-w-0 flex-1">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate text-center sm:text-left">
                  Perfil do Usuário
                </h1>
                <p className="text-gray-600 mt-1 text-sm sm:text-base">
                  Gerencie suas informações pessoais e configurações
                </p>
              </div>
              
              {/* Botão de Configurações - Mobile Optimized */}
              <Link href="/settings" className="flex-shrink-0">
                <Button
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 text-sm sm:text-base min-h-[44px] touch-manipulation"
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  <span>Configurações</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Section Header - Mobile Optimized */}
        <div className="flex items-center space-x-3 mb-4 sm:mb-6">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
            <ListTodo className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900 truncate">
            Informações do Perfil
          </h2>
        </div>

        {/* Profile Content - Mobile-First Grid */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6 lg:p-8 mb-4 sm:mb-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UserProfile />
          </motion.div>
        </div>

        {/* Quick Settings Card - Mobile Layout */}
        <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
            <div className="min-w-0 flex-1">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                Quer personalizar o sistema?
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Acesse as configurações para personalizar aparência, notificações e mais
              </p>
            </div>
            <Link href="/settings" className="flex-shrink-0">
              <Button 
                variant="outline" 
                className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-3 sm:py-2 min-h-[44px] touch-manipulation text-sm sm:text-base"
              >
                <Settings className="w-4 h-4 flex-shrink-0" />
                <span>Ir para Configurações</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}