'use client';

// ============================================================================
// PÁGINA BOMBEIRO - Gerenciamento de tarefas urgentes
// ============================================================================

import React, { useState } from 'react';
import { PageProvider } from '@/components/layout/PageContext';
import { BombeiroPageClient } from '@/components/bombeiro/BombeiroPageClient';
import { Button } from '@/components/ui/button';
import { Plus, Battery } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';

export default function BombeiroPage() {
  const [showNewTaskModal, setShowNewTaskModal] = useState(false);
  const [showLowEnergyModal, setShowLowEnergyModal] = useState(false);
  
  // Obter dados para estatísticas
  const { todayTasks } = useTasksStore();
  const pendingTasks = todayTasks.filter(task => task.status === 'pending').length;
  const completedTasks = todayTasks.filter(task => task.status === 'completed').length;
  const totalTasks = todayTasks.length;
  const energyTasks = todayTasks.filter(task => task.energy && task.status === 'pending').length;

  const handleNewTask = () => {
    setShowNewTaskModal(true);
  };

  const handleLowEnergy = () => {
    setShowLowEnergyModal(true);
  };

  return (
    <PageProvider
      value={{
        title: '🚒 Painel do Bombeiro',
        subtitle: 'Extintor de tarefas • Resgate de produtividade',
        icon: '🔥',
        theme: 'orange',
        actions: (
          <>
            <Button
              onClick={handleLowEnergy}
              variant="outline"
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-md transition-all duration-200"
              size="sm"
            >
              <Battery className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">🔋 Não consigo começar hoje...</span>
              <span className="sm:hidden">🔋 SOS</span>
            </Button>
            <Button
              onClick={handleNewTask}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 shadow-lg transition-all duration-200 hover:scale-105"
              size="lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              <span className="hidden sm:inline">Nova Tarefa</span>
              <span className="sm:hidden">Nova</span>
            </Button>
          </>
        ),
        stats: [
          { label: 'PENDENTES', value: pendingTasks, icon: '⏳' },
          { label: 'HOJE', value: completedTasks, icon: '✅' },
          { label: 'ENERGIA', value: energyTasks, icon: '🔋' },
          { label: 'TOTAL', value: totalTasks, icon: '📊' }
        ]
      }}
    >
      <BombeiroPageClient 
        showNewTaskModal={showNewTaskModal}
        setShowNewTaskModal={setShowNewTaskModal}
        showLowEnergyModal={showLowEnergyModal}
        setShowLowEnergyModal={setShowLowEnergyModal}
      />
    </PageProvider>
  );
}
