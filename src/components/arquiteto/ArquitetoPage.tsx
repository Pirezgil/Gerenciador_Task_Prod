'use client';

// ============================================================================
// PÁGINA ARQUITETO - Gerenciamento de projetos e planejamento
// ============================================================================

import React, { useState } from 'react';
import { useTasksStore } from '@/stores/tasksStore';
import { TaskEditModal } from '@/components/shared/TaskEditModal';
import { NewProjectModal } from '@/components/shared/NewProjectModal';
import { ProjectContainer } from './ProjectContainer';

export function ArquitetoPage() {
  const { projects } = useTasksStore();
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);

  const handleCreateProject = () => {
    setShowNewProjectModal(true);
  };

  const handleCloseModal = () => {
    setShowNewProjectModal(false);
  };

  return (
    <>
      <div className="space-y-6">
        <div className="bg-purple-50 rounded-xl p-6 border border-purple-200">
          <h2 className="text-xl font-semibold theme-text mb-2 flex items-center">
            🏗️ Modo Arquiteto
          </h2>
          <p className="theme-text-secondary text-sm">
            Aqui você planeja o futuro sem pressa. Organize seus projetos grandes em pequenos tijolos e mova-os para o dia quando estiver pronto.
          </p>
        </div>

        <div className="grid gap-6">
          {projects.map((project) => (
            <ProjectContainer key={project.id} project={project} />
          ))}
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 border-dashed">
          <div className="text-center py-8">
            <div className="text-4xl mb-4">🏗️</div>
            <h3 className="text-lg font-medium theme-text mb-2">
              Novo Projeto
            </h3>
            <p className="theme-text-secondary mb-4">
              Começando algo grande? Crie um contêiner para organizar seus tijolos.
            </p>
            <button 
              onClick={handleCreateProject}
              className="px-6 py-2 bg-purple-600 theme-text-on-primary rounded-lg hover:bg-purple-700 transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:outline-none"
            >
              + Criar Projeto
            </button>
          </div>
        </div>
      </div>

      <TaskEditModal />
      <NewProjectModal 
        isOpen={showNewProjectModal} 
        onClose={handleCloseModal} 
      />
    </>
  );
}
