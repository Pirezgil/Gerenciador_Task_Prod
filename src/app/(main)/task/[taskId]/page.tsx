'use client';

// ============================================================================
// PÁGINA DE DETALHES DA TAREFA - Ponto de entrada da rota /task/[taskId]
// ============================================================================

import React from 'react';
import { useParams } from 'next/navigation';
import { useTask } from '@/hooks/api/useTasks';
import { useProjects } from '@/hooks/api/useProjects';
import { TaskDetailClient } from './TaskDetailClient'; // Componente cliente que conterá a lógica
import Link from 'next/link';

const TaskDetailPage = () => {
  const params = useParams();
  const taskId = params.taskId as string;
  const { data: task, isLoading: taskLoading, refetch: refetchTask } = useTask(taskId);

  // Debug: log da tarefa encontrada
  if (task) {
    console.log('🎯 Tarefa encontrada:', task);
    console.log('📝 Comentários:', task.comments);
    console.log('📎 Anexos:', task.attachments);
  }

  // Mostrar loading enquanto carrega
  if (taskLoading) {
    return (
      <div className="container mx-auto p-6 text-center">
        <div className="flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mr-3"></div>
          <p className="text-gray-600">Carregando tarefa...</p>
        </div>
      </div>
    );
  }

  if (!task) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-2xl font-bold text-red-500">Tarefa não encontrada</h1>
        <p className="text-gray-500 mt-2">A tarefa que você está procurando não existe ou foi movida.</p>
        <Link href="/tarefas" className="mt-6 inline-block bg-blue-500 text-white px-6 py-3 rounded-xl hover:bg-blue-600 transition-colors">
          Voltar para Tarefas
        </Link>
      </div>
    );
  }

  return <TaskDetailClient task={task} onTaskUpdate={() => refetchTask()} />;
};

export default TaskDetailPage;
