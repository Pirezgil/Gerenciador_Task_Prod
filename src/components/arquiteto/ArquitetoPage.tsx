'use client';

import { useState } from 'react';
import { useProjects, useProjectsStats, useActiveProjects, useCompletedProjects } from '@/hooks/api/useProjects';
import { useModalsStore } from '@/stores/modalsStore';
import { TaskEditModal } from '@/components/shared/TaskEditModal';
import { NewProjectModal } from '@/components/shared/NewProjectModal';
import { NewTaskModal } from '@/components/shared/NewTaskModal';
import { ProjectContainer } from './ProjectContainer';
import { Plus, Layout, CheckCircle, Play, ListTodo } from 'lucide-react';
import { AchievementNotificationSystem } from '@/components/rewards/AchievementNotificationSystem';
import { useRecentAchievements } from '@/hooks/api/useAchievements';
import { Button } from '@/components/ui/button';

export function ArquitetoPage() {
  const { isLoading } = useProjects();
  const activeProjects = useActiveProjects();
  const completedProjects = useCompletedProjects();
  const stats = useProjectsStats();
  const recentAchievements = useRecentAchievements();
  const { openNewProjectModal } = useModalsStore();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 text-sm">Carregando projetos...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        {/* Header Simplificado */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-8">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Mesa do Arquiteto</h1>
                  <p className="text-gray-600 mt-1">Planejamento estratégico e estruturação de projetos</p>
                </div>
                
                {/* Métricas Simplificadas */}
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.active}</div>
                    <div className="text-sm text-gray-500">Projetos Ativos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
                    <div className="text-sm text-gray-500">Total de Tijolos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.completed}</div>
                    <div className="text-sm text-gray-500">Concluídos</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-900">{stats.planning}</div>
                    <div className="text-sm text-gray-500">Em Planejamento</div>
                  </div>
                </div>
              </div>
              
              {/* Botão de Ação */}
              <div className="mt-6 flex justify-end">
                <Button
                  onClick={() => openNewProjectModal(true)}
                  className="inline-flex items-center space-x-2 px-4 py-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Novo Projeto</span>
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Navigation Simplificada */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex gap-2">
              <Button
                onClick={() => setActiveTab('active')}
                variant={activeTab === 'active' ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <Play className="w-4 h-4" />
                <span>Projetos Ativos</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {activeProjects.length}
                </span>
              </Button>
              <Button
                onClick={() => setActiveTab('completed')}
                variant={activeTab === 'completed' ? "default" : "outline"}
                className="flex items-center space-x-2"
              >
                <CheckCircle className="w-4 h-4" />
                <span>Projetos Finalizados</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                  {completedProjects.length}
                </span>
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListTodo className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">
              {activeTab === 'active' 
                ? `Projetos Ativos (${activeProjects.length})`
                : `Projetos Finalizados (${completedProjects.length})`
              }
            </h2>
          </div>

          <div className="space-y-6">
            {activeTab === 'active' ? (
              activeProjects.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <Layout className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Tudo pronto para decolar!
                  </h3>
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Grandes jornadas começam com o primeiro passo. Crie seu primeiro projeto e transforme suas ideias em realidade.
                  </p>
                  <Button 
                    onClick={() => openNewProjectModal(true)}
                    className="px-8 py-3"
                  >
                    Começar primeiro Projeto
                  </Button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {activeProjects.map((project) => (
                    <ProjectContainer key={project.id} project={project} />
                  ))}
                </div>
              )
            ) : (
              completedProjects.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                  <CheckCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Nenhum projeto finalizado ainda
                  </h3>
                  <p className="text-gray-600 max-w-md mx-auto">
                    Complete seus projetos ativos para vê-los aparecer aqui como conquistas realizadas.
                  </p>
                </div>
              ) : (
                <div className="grid gap-6">
                  {completedProjects.map((project) => (
                    <ProjectContainer key={project.id} project={project} />
                  ))}
                </div>
              )
            )}
          </div>
        </div>
      </div>

      <TaskEditModal />
      <NewProjectModal />
      <NewTaskModal />
      
      {/* Sistema de notificações de conquista */}
      <AchievementNotificationSystem
        achievements={recentAchievements}
        onComplete={(achievement) => {
          console.log('Conquista celebrada:', achievement.type);
        }}
      />
    </>
  );
}