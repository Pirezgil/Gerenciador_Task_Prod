'use client';

// ============================================================================
// PÁGINA DE LEMBRETES - Interface completa para gerenciar lembretes
// ============================================================================

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Plus, 
  Search, 
  Filter, 
  Calendar,
  Clock,
  Settings,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

// Componentes existentes
import { RemindersList } from '@/components/shared/RemindersList';
import { NotificationCenter } from '@/components/shared/NotificationCenter';
import { ReminderSettingsPanel } from '@/components/shared/ReminderSettingsPanel';

// Hooks e Types
import { useReminders, useActiveReminders } from '@/hooks/api/useReminders';
import { useRemindersStore } from '@/stores/remindersStore';

// ============================================================================
// TIPOS E INTERFACES
// ============================================================================

type ViewMode = 'list' | 'notifications' | 'settings';

interface QuickStats {
  total: number;
  active: number;
  today: number;
  overdue: number;
}

// ============================================================================
// COMPONENTE PRINCIPAL
// ============================================================================

export default function LembretesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [searchTerm, setSearchTerm] = useState('');

  // Dados dos lembretes
  const { data: allReminders = [], isLoading, error } = useReminders();
  const { data: activeReminders = [] } = useActiveReminders();
  const { openReminderModal, resetReminderForm } = useRemindersStore();

  // Estatísticas calculadas
  const stats: QuickStats = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Type cast para evitar erro TypeScript
    const reminders = (allReminders as any[]) || [];
    const activeRems = (activeReminders as any[]) || [];
    
    return {
      total: reminders.length,
      active: reminders.filter(r => r.isActive).length,
      today: activeRems.length,
      overdue: reminders.filter(r => {
        if (!r.nextScheduledAt) return false;
        const scheduledDate = new Date(r.nextScheduledAt);
        return scheduledDate < today && r.isActive;
      }).length
    };
  }, [allReminders, activeReminders]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleNewReminder = () => {
    resetReminderForm();
    openReminderModal();
  };

  const handleViewChange = (mode: ViewMode) => {
    setViewMode(mode);
  };

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  const renderQuickStats = () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <motion.div 
        className="bg-blue-50 border border-blue-200 rounded-lg p-4"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            <p className="text-sm text-blue-500">Total de Lembretes</p>
          </div>
          <Bell className="w-8 h-8 text-blue-400" />
        </div>
      </motion.div>

      <motion.div 
        className="bg-green-50 border border-green-200 rounded-lg p-4"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            <p className="text-sm text-green-500">Ativos</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-green-400" />
        </div>
      </motion.div>

      <motion.div 
        className="bg-purple-50 border border-purple-200 rounded-lg p-4"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-purple-600">{stats.today}</p>
            <p className="text-sm text-purple-500">Para Hoje</p>
          </div>
          <Calendar className="w-8 h-8 text-purple-400" />
        </div>
      </motion.div>

      <motion.div 
        className="bg-red-50 border border-red-200 rounded-lg p-4"
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            <p className="text-sm text-red-500">Não executado</p>
          </div>
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>
      </motion.div>
    </div>
  );

  const renderViewTabs = () => (
    <div className="flex items-center justify-between mb-6">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
        <Button
          variant={viewMode === 'list' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleViewChange('list')}
          className="flex items-center space-x-2"
        >
          <Bell className="w-4 h-4" />
          <span>Lembretes</span>
        </Button>
        
        <Button
          variant={viewMode === 'notifications' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleViewChange('notifications')}
          className="flex items-center space-x-2"
        >
          <Activity className="w-4 h-4" />
          <span>Notificações</span>
          {stats.today > 0 && (
            <Badge variant="destructive" className="h-5 w-5 p-0 text-xs">
              {stats.today}
            </Badge>
          )}
        </Button>
        
        <Button
          variant={viewMode === 'settings' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => handleViewChange('settings')}
          className="flex items-center space-x-2"
        >
          <Settings className="w-4 h-4" />
          <span>Configurações</span>
        </Button>
      </div>

      {viewMode === 'list' && (
        <Button
          onClick={handleNewReminder}
          className="flex items-center space-x-2"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Lembrete</span>
        </Button>
      )}
    </div>
  );

  const renderSearchAndFilters = () => (
    viewMode === 'list' && (
      <div className="flex items-center space-x-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Buscar lembretes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <Button variant="outline" size="sm" className="flex items-center space-x-2">
          <Filter className="w-4 h-4" />
          <span>Filtros</span>
        </Button>
      </div>
    )
  );

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Carregando lembretes...</span>
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-12">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Não foi possível carregar os lembretes</h3>
          <p className="text-gray-600 mb-4">
            {error.message?.includes('network') || error.message?.includes('timeout')
              ? 'Verifique sua conexão com a internet e tente novamente.'
              : 'Ocorreu um erro interno. Tente novamente em alguns minutos.'
            }
          </p>
          <Button 
            onClick={() => window.location.reload()} 
            className="flex items-center space-x-2"
          >
            <span>Tentar Novamente</span>
          </Button>
        </div>
      );
    }

    switch (viewMode) {
      case 'list':
        return <RemindersList />;
      
      case 'notifications':
        return <NotificationCenter isOpen={true} onClose={() => setViewMode('list')} />;
      
      case 'settings':
        return <ReminderSettingsPanel />;
      
      default:
        return <RemindersList />;
    }
  };

  // ============================================================================
  // RENDER PRINCIPAL
  // ============================================================================

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-3">
                <Bell className="w-8 h-8 text-blue-600" />
                <span>Lembretes</span>
              </h1>
              <p className="text-gray-600 mt-1">
                Gerencie todos os seus lembretes de tarefas e hábitos
              </p>
            </div>
            
            {stats.today > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-blue-100 border border-blue-300 rounded-lg px-4 py-2"
              >
                <div className="flex items-center space-x-2 text-blue-700">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {stats.today} lembrete(s) programados para hoje
                  </span>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        {renderQuickStats()}

        {/* View Tabs */}
        {renderViewTabs()}

        {/* Search and Filters */}
        {renderSearchAndFilters()}

        {/* Content */}
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="bg-white rounded-lg shadow-sm border border-gray-200 p-6"
        >
          {renderContent()}
        </motion.div>

        {/* Informações úteis */}
        {stats.total === 0 && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6"
          >
            <div className="flex items-start space-x-3">
              <Info className="w-6 h-6 text-blue-600 mt-0.5" />
              <div>
                <h3 className="text-lg font-medium text-blue-900 mb-2">
                  Bem-vindo aos Lembretes!
                </h3>
                <div className="text-blue-700 space-y-2">
                  <p>
                    Você ainda não possui lembretes configurados. Aqui estão algumas dicas para começar:
                  </p>
                  <ul className="list-disc list-inside space-y-1 ml-4">
                    <li>Crie lembretes para suas tarefas importantes</li>
                    <li>Configure lembretes recorrentes para seus hábitos</li>
                    <li>Personalize mensagens motivacionais</li>
                    <li>Escolha entre notificações push, email ou SMS</li>
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}