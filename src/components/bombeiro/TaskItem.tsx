// ============================================================================
// TASK ITEM - Versão simplificada e estável
// CORREÇÃO: Removida complexidade excessiva, extraída lógica para hooks
// ============================================================================

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasksStore } from '@/stores/tasksStore';
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

import Link from 'next/link';

export function TaskItem({ 
  task, 
  onComplete, 
  onPostpone, 
  showProject = true 
}: TaskItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { projects } = useTasksStore();
  const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
  const config = useTaskItemConfig(task.energyPoints);
  const isCompleted = task.status === 'completed';

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01, y: -1 }}
      className={`
        bg-white border border-gray-200 rounded-lg p-3 sm:p-4 
        transition-all duration-200 hover:shadow-md
        ${isCompleted ? 'bg-green-50 border-green-200' : 'hover:border-gray-300'}
      `}
    >
      <div className="flex items-start justify-between">
        <Link href={`/task/${task.id}`} passHref className="flex-1 cursor-pointer">
          <div >
            {/* Header da Tarefa */}
            <div className="flex items-center mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${config.bgClass} ${
                task.type === 'brick' ? 'border-2 border-orange-300' : ''
              }`}>
                <span className={config.textClass}>
                  {task.type === 'brick' ? '🧱' : config.icon}
                </span>
              </div>
              <div>
                <span className={`text-xs font-medium ${config.textClass}`}>
                  {task.type === 'brick' ? '🧱 Tijolo de Projeto' : config.label}
                </span>
                {project && showProject && (
                  <div className="mt-1">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      task.type === 'brick' 
                        ? 'bg-orange-100 text-orange-700 border border-orange-200' 
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {project.icon} {project.name}
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Descrição da Tarefa */}
            <p className={`text-sm leading-relaxed mb-2 ${
              isCompleted ? 'line-through text-gray-500' : 'text-gray-800 font-medium'
            }`}>
              {task.description}
            </p>

            {/* Data de vencimento */}
            {task.dueDate && (
              <div className="text-xs text-gray-600 mb-2">
                📅 Vence em: {new Date(task.dueDate).toLocaleDateString('pt-BR')}
              </div>
            )}

            {/* Informações de Compromisso */}
            {task.isAppointment && task.appointment && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mb-3">
                <div className="flex items-center space-x-2 text-purple-800">
                  <Calendar className="w-4 h-4" />
                  <span className="text-xs font-medium">📅 Compromisso</span>
                </div>
                <div className="mt-1 text-xs text-purple-700 space-y-1">
                  <div>⏰ {task.appointment.scheduledTime}</div>
                  {task.appointment.location && (
                    <div>📍 {task.appointment.location}</div>
                  )}
                  <div className="text-purple-600">
                    🚀 Preparação: {task.appointment.preparationTime} min antes
                  </div>
                </div>
              </div>
            )}
          </div>
        </Link>
        
        {/* Ações da Tarefa */}
        <div className="ml-2 sm:ml-4 flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(_e) => {
              // Futuramente, pode abrir um menu de edição rápida aqui
            }}
            className="text-gray-500 hover:text-gray-700 hidden sm:flex"
            title="Editar tarefa"
          >
            <Edit3 className="w-4 h-4" />
          </Button>
          
          {!isCompleted && (
            <Button
              variant="outline"
              size="sm"
              onClick={(_e) => {
                onPostpone(task.id);
              }}
              className="text-orange-500 border-orange-300 hover:bg-orange-50 px-2 sm:px-3"
              title="Adiar tarefa"
            >
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
            </Button>
          )}
          
          <Button
            variant={isCompleted ? "default" : "outline"}
            size="sm"
            onClick={(_e) => {
              onComplete(task.id);
            }}
            disabled={isCompleted}
            className={`px-2 sm:px-3 ${isCompleted 
              ? "bg-green-500 text-white" 
              : "text-green-600 border-green-300 hover:bg-green-50"
            }`}
            title={isCompleted ? "Tarefa concluída" : "Marcar como concluída"}
          >
            <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 px-2 sm:px-3"
            title={isExpanded ? "Recolher detalhes" : "Expandir detalhes"}
          >
            <motion.div animate={{ rotate: isExpanded ? 180 : 0 }}>
              <ChevronDown className="w-3 h-3 sm:w-4 sm:h-4" />
            </motion.div>
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            {/* Comentários */}
            {task.comments && task.comments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><MessageSquare className="w-4 h-4 mr-2" /> Comentários</h4>
                <div className="space-y-2">
                  {task.comments.map(comment => (
                    <div key={comment.id} className="text-xs bg-gray-100 p-2 rounded-md">
                      <p className="text-gray-800 whitespace-pre-wrap">{comment.content}</p>
                      <p className="text-gray-500 text-right mt-1">- {comment.author} em {new Date(comment.createdAt).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Anexos */}
            {task.attachments && task.attachments.length > 0 && (
              <div className="mb-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><Paperclip className="w-4 h-4 mr-2" /> Anexos</h4>
                <div className="flex flex-wrap gap-2">
                  {task.attachments.map(attachment => (
                    <a href={attachment.url} target="_blank" rel="noopener noreferrer" key={attachment.name} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full hover:bg-blue-200">
                      {attachment.name}
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Links Externos */}
            {task.externalLinks && task.externalLinks.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center"><Link2 className="w-4 h-4 mr-2" /> Links</h4>
                <div className="flex flex-col space-y-1">
                  {task.externalLinks.map((link, index) => (
                    <a href={link} target="_blank" rel="noopener noreferrer" key={index} className="text-xs text-indigo-600 hover:underline truncate">
                      {link}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
