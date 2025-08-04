'use client';

import { useProjects, useProjectsStats } from '@/hooks/api/useProjects';
import { useModalsStore } from '@/stores/modalsStore';
import { TaskEditModal } from '@/components/shared/TaskEditModal';
import { NewProjectModal } from '@/components/shared/NewProjectModal';
import { NewTaskModal } from '@/components/shared/NewTaskModal';
import { ProjectContainer } from './ProjectContainer';
import { Plus, Layout } from 'lucide-react';

export function ArquitetoPage() {
  const { data: projects = [], isLoading } = useProjects();
  const stats = useProjectsStats();
  const { openNewProjectModal } = useModalsStore();

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
                  <Layout className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">🏗️ Mesa do Arquiteto</h1>
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

        <div className="space-y-6">
          {projects.length === 0 ? (
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
          <>
            {/* Projetos Detalhados */}
            <div className="grid gap-6">
              {projects.map((project) => (
                <ProjectContainer key={project.id} project={project} />
              ))}
            </div>
          </>
          )}
        </div>
      </div>

      <TaskEditModal />
      <NewProjectModal />
      <NewTaskModal />
    </>
  );
}
