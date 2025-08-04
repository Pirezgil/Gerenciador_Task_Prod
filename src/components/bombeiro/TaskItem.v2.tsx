// ============================================================================
// TASK ITEM V2 - Integrado com API Backend
// ============================================================================

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCompleteTask, usePostponeTask } from '@/hooks/api/useTasks';
import { 
  Calendar, 
  CheckCircle2, 
  Battery, 
  Brain, 
  Zap, 
  Edit3, 
  ChevronDown, 
  MessageSquare, 
  Paperclip, 
  Link2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Task } from '@/types';

interface TaskItemProps {
  task: Task;
  showProject?: boolean;
  onEdit?: (task: Task) => void;
}

export function TaskItem({ task, showProject = false, onEdit }: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Hooks para mutations da API
  const completeTask = useCompleteTask();
  const postponeTask = usePostponeTask();

  // Handlers otimizados
  const handleComplete = async () => {
    try {
      await completeTask.mutateAsync(task.id);
    } catch (error) {
      console.error('Erro ao completar tarefa:', error);
      // Toast ou notificação de erro aqui
    }
  };

  const handlePostpone = async () => {
    try {
      await postponeTask.mutateAsync({ taskId: task.id, reason: 'Adiado pelo usuário' });
    } catch (error) {
      console.error('Erro ao adiar tarefa:', error);
      // Toast ou notificação de erro aqui
    }
  };

  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  // Configurações visuais baseadas na energia
  const getEnergyConfig = (points: number) => {
    switch (points) {
      case 1:
        return {
          icon: Battery,
          color: 'text-green-500',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          label: 'Baixa Energia'
        };
      case 3:
        return {
          icon: Brain,
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          label: 'Média Energia'
        };
      case 5:
        return {
          icon: Zap,
          color: 'text-red-500',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          label: 'Alta Energia'
        };
      default:
        return {
          icon: Battery,
          color: 'text-gray-500',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          label: 'Energia Indefinida'
        };
    }
  };

  const energyConfig = getEnergyConfig(task.energyPoints);
  const EnergyIcon = energyConfig.icon;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`
        relative p-4 rounded-lg border-2 transition-all duration-200
        ${energyConfig.bgColor} ${energyConfig.borderColor}
        hover:shadow-md hover:scale-[1.01]
        ${task.status === 'completed' ? 'opacity-60' : ''}
      `}
    >
      {/* Header da Tarefa */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          {/* Título e Projeto */}
          <div className="flex items-center gap-2 mb-2">
            <EnergyIcon className={`w-4 h-4 ${energyConfig.color} flex-shrink-0`} />
            {showProject && task.projectId && (
              <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                Projeto
              </span>
            )}
          </div>
          
          <p className={`text-sm leading-relaxed ${task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {task.description}
          </p>

          {/* Metadados */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            {task.dueDate && (
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                <span>{new Date(task.dueDate).toLocaleDateString('pt-BR')}</span>
              </div>
            )}
            
            {task.comments?.length > 0 && (
              <div className="flex items-center gap-1">
                <MessageSquare className="w-3 h-3" />
                <span>{task.comments.length}</span>
              </div>
            )}
            
            {task.attachments?.length > 0 && (
              <div className="flex items-center gap-1">
                <Paperclip className="w-3 h-3" />
                <span>{task.attachments.length}</span>
              </div>
            )}
            
            {task.externalLinks?.length > 0 && (
              <div className="flex items-center gap-1">
                <Link2 className="w-3 h-3" />
                <span>{task.externalLinks.length}</span>
              </div>
            )}
          </div>
        </div>

        {/* Ações */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {task.status === 'pending' && (
            <>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleEdit}
                className="h-8 w-8 p-0 hover:bg-blue-100"
                title="Editar tarefa"
              >
                <Edit3 className="w-4 h-4" />
              </Button>
              
              <Button
                size="sm"
                variant="ghost"
                onClick={handlePostpone}
                disabled={postponeTask.isPending}
                className="h-8 px-2 text-orange-600 hover:bg-orange-100"
                title="Adiar tarefa"
              >
                {postponeTask.isPending ? '...' : 'Adiar'}
              </Button>
              
              <Button
                size="sm"
                onClick={handleComplete}
                disabled={completeTask.isPending}
                className="h-8 px-3 bg-green-600 hover:bg-green-700 text-white"
                title="Completar tarefa"
              >
                {completeTask.isPending ? (
                  '...'
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1" />
                    OK
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Botão de Expandir (se houver comentários ou detalhes) */}
      {(task.comments?.length > 0 || task.externalLinks?.length > 0) && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 mt-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <ChevronDown className={`w-3 h-3 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
          {isExpanded ? 'Ocultar detalhes' : 'Ver detalhes'}
        </button>
      )}

      {/* Detalhes Expandidos */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pt-3 mt-3 border-t border-gray-200">
              {/* Comentários */}
              {task.comments?.length > 0 && (
                <div className="mb-3">
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Comentários:</h4>
                  <div className="space-y-2">
                    {task.comments.map(comment => (
                      <div key={comment.id} className="text-xs bg-white p-2 rounded border">
                        <div className="font-medium text-gray-600">{comment.author}</div>
                        <div className="text-gray-800 mt-1">{comment.content}</div>
                        <div className="text-gray-400 mt-1">
                          {new Date(comment.createdAt).toLocaleDateString('pt-BR')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Links Externos */}
              {task.externalLinks?.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 mb-2">Links:</h4>
                  <div className="space-y-1">
                    {task.externalLinks.map((link, index) => (
                      <a
                        key={index}
                        href={link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 underline block truncate"
                      >
                        {link}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}