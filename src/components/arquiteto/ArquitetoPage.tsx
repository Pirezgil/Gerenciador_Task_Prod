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
        {/* Header - DUAL LAYOUT MOBILE/DESKTOP */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="py-6 sm:py-8">
              
              {/* MOBILE HEADER (< sm) */}
              <div className="sm:hidden">
                {/* Título Mobile */}
                <div className="text-center mb-6">
                  <h1 className="text-xl font-bold text-gray-900">Mesa do Arquiteto</h1>
                  <p className="text-gray-600 mt-1 text-sm">Planejamento estratégico e estruturação de projetos</p>
                </div>
                
                
                {/* Botão Mobile */}
                <div className="flex justify-center">
                  <Button
                    onClick={() => openNewProjectModal(true)}
                    className="w-full max-w-xs min-h-[48px] text-base font-medium shadow-sm hover:shadow-md transition-all"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    <span>Novo Projeto</span>
                  </Button>
                </div>
              </div>

              {/* DESKTOP HEADER (≥ sm) - LAYOUT ORIGINAL */}
              <div className="hidden sm:block">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">Mesa do Arquiteto</h1>
                    <p className="text-gray-600 mt-1">Planejamento estratégico e estruturação de projetos</p>
                  </div>
                  
                  {/* Métricas Simplificadas Desktop */}
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
                
                {/* Botão de Ação Desktop */}
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
        </div>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
          {/* Navigation - MOBILE OTIMIZADA */}
          <div className="bg-white border border-gray-200 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 shadow-sm">
            {/* MOBILE: Navigation Stack */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2">
              <Button
                onClick={() => setActiveTab('active')}
                variant={activeTab === 'active' ? "default" : "outline"}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 min-h-[48px] sm:min-h-[44px] text-base sm:text-sm"
              >
                <Play className="w-4 h-4 sm:w-4 sm:h-4" />
                <span>Projetos Ativos</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {activeProjects.length}
                </span>
              </Button>
              <Button
                onClick={() => setActiveTab('completed')}
                variant={activeTab === 'completed' ? "default" : "outline"}
                className="w-full sm:w-auto flex items-center justify-center space-x-2 min-h-[48px] sm:min-h-[44px] text-base sm:text-sm"
              >
                <CheckCircle className="w-4 h-4 sm:w-4 sm:h-4" />
                <span>Projetos Finalizados</span>
                <span className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-xs font-medium">
                  {completedProjects.length}
                </span>
              </Button>
            </div>
          </div>

          {/* Content Title - MOBILE OTIMIZADO */}
          <div className="flex items-center justify-center sm:justify-start space-x-3 mb-4 sm:mb-6">
            <div className="w-8 h-8 sm:w-8 sm:h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <ListTodo className="w-4 h-4 text-blue-600" />
            </div>
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 text-center sm:text-left">
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
                    className="px-6 sm:px-8 py-3 min-h-[48px] sm:min-h-[44px] text-base sm:text-sm font-medium"
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