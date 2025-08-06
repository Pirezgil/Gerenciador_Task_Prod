'use client';

import { useState } from 'react';
import { useProjects, useProjectsStats, useActiveProjects, useCompletedProjects } from '@/hooks/api/useProjects';
import { useModalsStore } from '@/stores/modalsStore';
import { TaskEditModal } from '@/components/shared/TaskEditModal';
import { NewProjectModal } from '@/components/shared/NewProjectModal';
import { NewTaskModal } from '@/components/shared/NewTaskModal';
import { ProjectContainer } from './ProjectContainer';
import { Plus, Layout, CheckCircle, Play } from 'lucide-react';

export function ArquitetoPage() {
  const { isLoading } = useProjects();
  const activeProjects = useActiveProjects();
  const completedProjects = useCompletedProjects();
  const stats = useProjectsStats();
  const { openNewProjectModal } = useModalsStore();
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  if (isLoading) return <div className="p-4">Carregando projetos...</div>;

  return (
    <>
      <div className="max-w-7xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-2xl p-8 text-white">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
              <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <span className="text-4xl">🏗️</span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Mesa do Arquiteto</h1>
                  <p className="text-purple-100 mt-1">Planejamento estratégico e estruturação de projetos</p>
                </div>
              </div>
              
              <button
                onClick={() => openNewProjectModal(true)}
                className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors border border-white/30 w-full sm:w-auto justify-center"
              >
                <Plus className="w-5 h-5" />
                <span>Novo Projeto</span>
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.active}</div>
                <div className="text-sm text-purple-100">Projetos Ativos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.totalTasks}</div>
                <div className="text-sm text-purple-100">Total de Tijolos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.completed}</div>
                <div className="text-sm text-purple-100">Concluídos</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                <div className="text-2xl font-bold">{stats.planning}</div>
                <div className="text-sm text-purple-100">Em Planejamento</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs para alternar entre projetos ativos e finalizados */}
        <div className="flex space-x-1 mb-6 p-1 bg-gray-100 rounded-lg">
          <button
            onClick={() => setActiveTab('active')}
            className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'active'
                ? 'bg-white text-purple-600 shadow-sm'
                : 'text-gray-600 hover:text-purple-600'
            }`}
          >
            <Play className="w-4 h-4" />
            <span>Projetos Ativos ({activeProjects.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`flex-1 px-4 py-2 rounded-md flex items-center justify-center space-x-2 transition-colors ${
              activeTab === 'completed'
                ? 'bg-white text-green-600 shadow-sm'
                : 'text-gray-600 hover:text-green-600'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>Projetos Finalizados ({completedProjects.length})</span>
          </button>
        </div>

        <div className="space-y-6">
          {activeTab === 'active' ? (
            activeProjects.length === 0 ? (
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-dashed">
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🚀</div>
                  <h3 className="text-xl font-semibold theme-text mb-2">
                    Tudo pronto para decolar!
                  </h3>
                  <p className="theme-text-secondary mb-6 max-w-md mx-auto">
                    Grandes jornadas começam com o primeiro passo. Crie seu primeiro projeto e transforme suas ideias em realidade.
                  </p>
                  <button 
                    onClick={() => openNewProjectModal(true)}
                    className="px-8 py-3 bg-purple-600 theme-text-on-primary rounded-lg font-semibold hover:bg-purple-700 transition-all transform hover:scale-105 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
                  >
                    Começar primeiro Projeto
                  </button>
                </div>
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
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-dashed">
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="text-xl font-semibold theme-text mb-2">
                    Nenhum projeto finalizado ainda
                  </h3>
                  <p className="theme-text-secondary max-w-md mx-auto">
                    Complete seus projetos ativos para vê-los aparecer aqui como conquistas realizadas.
                  </p>
                </div>
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

      <TaskEditModal />
      <NewProjectModal />
      <NewTaskModal />
    </>
  );
}
