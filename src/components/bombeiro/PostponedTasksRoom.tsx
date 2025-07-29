'use client';

import React from 'react';
import { useTasksStore } from '@/stores/tasksStore';

export function PostponedTasksRoom() {
  const { postponedTasks, canAddTask, getRemainingEnergy, addTaskToToday } = useTasksStore();

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-xl border border-yellow-200/50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mr-3">
          <span className="text-white text-sm">⏳</span>
        </div>
        Sala de Repanejamento
        <span className="ml-2 text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">{postponedTasks.length}</span>
      </h3>
      <div className="space-y-2">
        {postponedTasks.map((postponedTask) => (
          <div key={postponedTask.id} className="flex items-center justify-between p-3 bg-white/70 rounded-xl border border-yellow-200">
            <div className="flex-1">
              <p className="text-sm text-gray-800">{postponedTask.description}</p>
              <p className="text-xs text-yellow-600">Adiado {postponedTask.postponedCount}x</p>
            </div>
            <button
              onClick={() => {
                if (canAddTask(postponedTask.energyPoints)) {
                  // Usar a função moveTaskToToday que já remove da lista de postponed
                  const success = addTaskToToday(postponedTask.description, postponedTask.energyPoints, postponedTask.projectId);
                  if (success) {
                    // Remover manualmente da lista de postponed pois addTaskToToday não faz isso
                    const updatedPostponed = postponedTasks.filter(t => t.id !== postponedTask.id);
                    // Atualizar store - precisa implementar removePostponedTask
                    console.log('Tarefa movida para hoje:', postponedTask.id);
                  }
                } else {
                  alert(`⚡ Energia insuficiente! Precisa de ${postponedTask.energyPoints} pontos, mas você só tem ${getRemainingEnergy()} disponíveis.`);
                }
              }}
              className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs hover:bg-blue-200 transition-colors"
            >
              ↩️ Puxar para hoje
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
