// ============================================================================
// PÁGINA DE PERFIL - Informações pessoais do usuário
// ============================================================================

'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/providers/AuthProvider';
import { UserProfile } from '@/components/profile/UserProfile';

export default function ProfilePage() {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">

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
            <h3 className="text-lg font-semibold text-text-primary">
              Quer personalizar o sistema?
            </h3>
            <p className="text-text-secondary text-sm">
              Acesse as configurações para personalizar aparência, notificações e mais
            </p>
          </div>
          <Link href="/settings">
            <Button className="bg-purple-600 hover:bg-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Settings className="w-4 h-4 mr-2" />
              Configurações
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}