'use client';

// ============================================================================
// PÁGINA ARQUITETO - Planejamento e estruturação de projetos
// ============================================================================

import { PageProvider } from '@/components/layout/PageContext';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Layout } from 'lucide-react';

export default function ArquitetoPage() {
  return (
    <PageProvider
      value={{
        title: '🏗️ Mesa do Arquiteto',
        subtitle: 'Planejamento estratégico e estruturação de projetos',
        icon: '🏗️',
        theme: 'purple',
        actions: (
          <>
            <Button
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-md transition-all duration-200"
              size="sm"
            >
              <Layout className="w-4 h-4 mr-2" />
              Templates
            </Button>
            <Button
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-lg transition-all duration-200"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              Novo Projeto
            </Button>
          </>
        ),
        stats: [
          { label: 'Projetos Ativos', value: 3, icon: '🏗️' },
          { label: 'Templates', value: 12, icon: '📋' },
          { label: 'Concluídos', value: 8, icon: '✅' },
          { label: 'Em Planejamento', value: 2, icon: '📝' }
        ]
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="text-center py-12">
          <Building2 className="mx-auto h-12 w-12 text-purple-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">Área do Arquiteto</h3>
          <p className="mt-1 text-sm text-gray-500">
            Esta área está sendo desenvolvida. Em breve você poderá planejar e estruturar seus projetos.
          </p>
          <div className="mt-6">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Começar Primeiro Projeto
            </Button>
          </div>
        </div>
      </div>
    </PageProvider>
  );
}