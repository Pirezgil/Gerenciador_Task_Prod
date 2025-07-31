// ============================================================================
// TASK ITEM - Versão simplificada e estável
// CORREÇÃO: Removida complexidade excessiva, extraída lógica para hooks
// ============================================================================

'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle2, 
  Battery, 
  Brain, 
  Zap, 
  Edit3 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useModalsStore } from '@/stores/modalsStore';
import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onPostpone: (taskId: string) => void;
  showProject?: boolean;
}

// Hook extraído para simplificar componente
function useTaskItemConfig(energyPoints: number) {
  if (energyPoints === 1) return {
    icon: <Battery className="w-4 h-4" />,
    label: '🔋 Energia Baixa',
    bgClass: 'bg-yellow-100',
    textClass: 'text-yellow-800'
  };
  
  if (energyPoints === 3) return {
    icon: <Brain className="w-4 h-4" />,
    label: '🧠 Energia Normal', 
    bgClass: 'bg-blue-100',
    textClass: 'text-blue-800'
  };
  
  return {
    icon: <Zap className="w-4 h-4" />,
    label: '⚡ Energia Alta',
    bgClass: 'bg-red-100', 
    textClass: 'text-red-800'
  };
}

export function TaskItem({ 
  task, 
  onComplete, 
  onPostpone, 
  showProject = true 
}: TaskItemProps) {
  const { openTaskEditModal } = useModalsStore();
  const config = useTaskItemConfig(task.energyPoints);
  const isCompleted = task.status === 'done';

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openTaskEditModal(task);
  };

  const handleTaskClick = () => {
    if (!isCompleted) {
      openTaskEditModal(task);
    }
  };

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01, y: -1 }}
      onClick={handleTaskClick}
      className={`
        bg-white border border-gray-200 rounded-lg p-4 cursor-pointer
        transition-all duration-200 hover:shadow-md
        ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:border-gray-300'}
      `}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* Header da Tarefa */}
          <div className="flex items-center mb-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${config.bgClass}`}>
              <span className={config.textClass}>
                {config.icon}
              </span>
            </div>
            <div>
              <span className={`text-xs font-medium ${config.textClass}`}>
                {config.label}
              </span>
              {task.project && showProject && (
                <div className="mt-1">
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                    {task.project.icon} {task.project.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Descrição da Tarefa */}
          <p className={`text-sm leading-relaxed mb-3 ${
            isCompleted ? 'line-through text-gray-500' : 'text-gray-800 font-medium'
          }`}>
            {task.description}
          </p>
        </div>
        
        {/* Ações da Tarefa */}
        <div className="ml-4 flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEditClick}
            className="text-gray-500 hover:text-gray-700"
            title="Editar tarefa"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          
          {!isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onPostpone(task.id);
              }}
              className="text-orange-500 border-orange-300 hover:bg-orange-50"
              title="Adiar tarefa"
            >
              <Calendar className="w-4 h-4" />
            </Button>
          )}
          
          <Button
            variant={isCompleted ? "default" : "outline"}
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task.id);
            }}
            disabled={isCompleted}
            className={isCompleted 
              ? "bg-green-500 text-white" 
              : "text-green-600 border-green-300 hover:bg-green-50"
            }
            title={isCompleted ? "Tarefa concluída" : "Marcar como concluída"}
          >
            <CheckCircle2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
}
