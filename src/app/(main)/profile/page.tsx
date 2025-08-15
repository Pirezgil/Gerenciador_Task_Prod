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
      {/* Header Simplificado */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Perfil do Usuário</h1>
                <p className="text-gray-600 mt-1">Gerencie suas informações pessoais e configurações</p>
              </div>
              
              {/* Botão de Configurações */}
              <Link href="/settings">
                <Button
                  className="inline-flex items-center space-x-2 px-4 py-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Configurações</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Content */}
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <ListTodo className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Informações do Perfil
          </h2>
        </div>

        {/* Conteúdo do Perfil */}
        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <UserProfile />
          </motion.div>
        </div>

        {/* Card de acesso rápido às configurações */}
        <div className="mt-6 bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Quer personalizar o sistema?
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Acesse as configurações para personalizar aparência, notificações e mais
              </p>
            </div>
            <Link href="/settings">
              <Button variant="outline">
                <Settings className="w-4 h-4 mr-2" />
                Ir para Configurações
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}