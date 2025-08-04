'use client';

// ============================================================================
// PÁGINA DE DETALHES DA TAREFA - Ponto de entrada da rota /task/[taskId]
// ============================================================================

import React from 'react';
import { useParams } from 'next/navigation';
import { useTasksStore } from '@/stores/tasksStore';
import { TaskDetailClient } from './TaskDetailClient'; // Componente cliente que conterá a lógica
import Link from 'next/link';

const TaskDetailPage = () => {
  const params = useParams();
  const taskId = params.taskId as string;
  const { todayTasks, postponedTasks, projects } = useTasksStore();

  // Encontra a tarefa na lista de hoje, nas adiadas ou nos projetos
  let task = [...todayTasks, ...postponedTasks].find(t => t.id === taskId);
  
  if (!task) {
    // Procura nos backlogs dos projetos
    for (const project of projects) {
      const foundTask = project.backlog.find(t => t.id === taskId);
      if (foundTask) {
        task = foundTask;
        break;
      }
    }
  }

  if (!task) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">Tarefa não encontrada</h1>
        <p className="text-text-secondary mt-2">A tarefa que você está procurando não existe ou foi movida.</p>
        <Link href="/bombeiro" className="mt-6 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600">
          Voltar para a página principal
        </Link>
      </div>
    );
  }

  return <TaskDetailClient task={task} />;
};

export default TaskDetailPage;
