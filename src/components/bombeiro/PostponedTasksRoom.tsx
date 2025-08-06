'use client';

import React from 'react';
import { useTodayTasks, useUpdateTask } from '@/hooks/api/useTasks';
import { Button } from '@/components/ui/button';
import { useStandardAlert } from '@/components/shared/StandardAlert';

export function PostponedTasksRoom() {
  const { data: todayTasks = [] } = useTodayTasks();
  const updateTaskMutation = useUpdateTask();
  const { showAlert, AlertComponent } = useStandardAlert();
  
  // Filtrar apenas tarefas adiadas hoje
  const today = new Date().toISOString().split('T')[0];
  const postponedTasks = todayTasks.filter(task => task.status === 'postponed');
  
  const todayPostponedTasks = postponedTasks.filter(task => {
    if (!task.postponedAt) return false;
    const postponedDate = new Date(task.postponedAt).toISOString().split('T')[0];
    return postponedDate === today;
  });

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-xl border border-yellow-200/50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mr-3">
          <span className="text-white text-sm">⏳</span>
        </div>
        Sala de Repanejamento
        <span className="ml-2 text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">{todayPostponedTasks.length}</span>
      </h3>
      <div className="space-y-2">
        {todayPostponedTasks.map((postponedTask) => (
          <div key={postponedTask.id} className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-yellow-200">
            <div className="flex-1">
              <p className="text-sm text-gray-800 whitespace-pre-wrap">{postponedTask.description}</p>
              <p className="text-xs text-yellow-600">Adiado {postponedTask.postponedCount}x</p>
            </div>
            <Button
              onClick={async () => {
                try {
                  await updateTaskMutation.mutateAsync({
                    taskId: postponedTask.id,
                    updates: {
                      status: 'pending',
                      postponedAt: null,
                      dueDate: today
                    }
                  });
                  
                  showAlert(
                    'Sucesso',
                    'Tarefa movida para hoje com sucesso!',
                    'success'
                  );
                } catch (error: any) {
                  console.error('Erro ao mover tarefa:', error);
                  showAlert(
                    'Erro',
                    'Não foi possível mover a tarefa para hoje.',
                    'error'
                  );
                }
              }}
              variant="outline"
              size="sm"
              className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 border-blue-200"
              disabled={updateTaskMutation.isPending}
            >
              {updateTaskMutation.isPending ? '...' : '↩️ Puxar para hoje'}
            </Button>
          </div>
        ))}
      </div>
      <AlertComponent />
    </div>
  );
}
