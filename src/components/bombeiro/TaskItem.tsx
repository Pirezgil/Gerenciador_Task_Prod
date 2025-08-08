// ============================================================================
// TASK ITEM - Versão simplificada e estável
// CORREÇÃO: Removida complexidade excessiva, extraída lógica para hooks
// ============================================================================

'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTasksStore } from '@/stores/tasksStore';
import { 
  Calendar, 
  CheckCircle2, 
  Battery, 
  Brain, 
  Zap, 
  ChevronDown, 
  MessageSquare, 
  Paperclip, 
  Link2,
  ExternalLink,
  Trash2,
  Clock,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Task } from '@/types';
import { scrollToElementWithDelay } from '@/utils/scrollUtils';


interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onPostpone: (taskId: string) => void;
  showProject?: boolean;
  isExpanded?: boolean;
  onToggleExpansion?: () => void;
  variant?: 'default' | 'missed' | 'completed';
  isCompleting?: boolean;
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

// Funções auxiliares para compatibilidade
const getEnergyIcon = (points: number) => {
  switch (points) {
    case 1: return <Battery className="w-4 h-4 text-green-500" />;
    case 3: return <Brain className="w-4 h-4 text-blue-500" />;
    case 5: return <Zap className="w-4 h-4 text-purple-500" />;
    default: return <Circle className="w-4 h-4" />;
  }
};

const getEnergyLabel = (points: number) => {
  switch (points) {
    case 1: return 'Baixa';
    case 3: return 'Normal';
    case 5: return 'Alta';
    default: return 'Indefinido';
  }
};

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatHistoryMessage } from '@/utils/historyFormatter';

export function TaskItem({ 
  task, 
  onComplete, 
  onPostpone, 
  showProject = true,
  isExpanded: controlledExpanded,
  onToggleExpansion,
  variant = 'default',
  isCompleting = false
}: TaskItemProps) {
  const [localExpanded, setLocalExpanded] = useState(false);
  const taskRef = useRef<HTMLDivElement>(null);
  const isExpanded = controlledExpanded !== undefined ? controlledExpanded : localExpanded;
  const { projects } = useTasksStore();
  const router = useRouter();
  const project = task.projectId ? projects.find(p => p.id === task.projectId) : null;
  const config = useTaskItemConfig(task.energyPoints);
  const isCompleted = task.status === 'completed';
  
  // Classes CSS baseadas na variante
  const getVariantClasses = () => {
    switch (variant) {
      case 'missed':
        return 'bg-red-50 border-red-200 hover:bg-red-100';
      case 'completed':
        return 'bg-green-50 border-green-200 hover:bg-green-100 opacity-80';
      default:
        return 'bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:shadow-lg';
    }
  };


  const handleToggleExpansion = () => {
    const newExpanded = !isExpanded;
    
    if (onToggleExpansion) {
      onToggleExpansion();
    } else {
      setLocalExpanded(newExpanded);
    }
    
    // Se estamos expandindo, centralizar o elemento após a animação
    if (newExpanded && taskRef.current) {
      scrollToElementWithDelay(taskRef.current, 350, {
        behavior: 'smooth',
        block: 'center',
        offset: -50
      });
    }
  };

  return (
    <motion.div
      ref={taskRef}
      className={`rounded-xl shadow-md transition-all hover:scale-[1.02] ${getVariantClasses()}`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="p-3">
        <div className="flex flex-col gap-2">
          {/* First Line - Task Description */}
          <div className="flex items-center justify-between w-full">
            <Link 
              href={`/task/${task.id}`}
              className="flex-1"
            >
              <div className="flex items-center gap-2">
                {variant === 'completed' && (
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-white" />
                  </div>
                )}
                <h3 className={`text-lg font-semibold hover:text-blue-600 transition-colors cursor-pointer ${
                  task.status === 'completed' 
                    ? 'text-gray-500 line-through' 
                    : 'text-gray-900'
                }`}>
                  {task.description}
                </h3>
              </div>
            </Link>
          </div>
          
          {/* Second Line - Badges and Actions */}
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-3">
              {/* Energia */}
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                task.energyPoints === 1 ? 'bg-green-100 text-green-700 border border-green-200' :
                task.energyPoints === 3 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                'bg-purple-100 text-purple-700 border border-purple-200'
              }`}>
                {task.energyPoints === 1 ? <Battery className="w-4 h-4 text-green-500" /> :
                 task.energyPoints === 3 ? <Brain className="w-4 h-4 text-blue-500" /> :
                 <Zap className="w-4 h-4 text-purple-500" />}
                <span>{task.energyPoints === 1 ? 'Baixa' : task.energyPoints === 3 ? 'Normal' : 'Alta'}</span>
              </div>

              {/* Data de vencimento */}
              {task.dueDate && (
                <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 border-red-200 border rounded-full text-xs font-medium">
                  <Clock className="w-3 h-3" />
                  <span>{new Date(task.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                </div>
              )}

              {/* Projeto badge */}
              {task.project && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                  <span>{task.project.icon}</span>
                  <span>{task.project.name}</span>
                </div>
              )}

              {/* Projeto */}
              {project && showProject && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 border border-amber-200">
                  <span>📁</span>
                  <span>{project.name}</span>
                </div>
              )}

              {/* Horário de conclusão para tarefas completadas */}
              {variant === 'completed' && task.completedAt && (
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 border border-green-200">
                  <Clock className="w-3 h-3" />
                  <span>Concluída às {new Date(task.completedAt).toLocaleTimeString('pt-BR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}</span>
                </div>
              )}
            </div>

            {/* Actions - mantendo os originais */}
            <div className="flex items-center gap-3">
              {!isCompleted && variant !== 'completed' && (
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
              
              {variant !== 'completed' && (
                <Button
                  variant={isCompleted ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    e.preventDefault();
                    if (!isCompleted) {
                      console.log('🎯 Completando tarefa:', task.id);
                      onComplete(task.id);
                    }
                  }}
                  disabled={isCompleted || variant === 'completed'}
                className={isCompleted 
                  ? "bg-green-500 text-white" 
                  : "text-green-600 border-green-300 hover:bg-green-50"
                }
                title={isCompleted ? "Tarefa concluída" : "Marcar como concluída"}
                >
                  <CheckCircle2 className="w-4 h-4" />
                </Button>
              )}

              
              <Button
                onClick={handleToggleExpansion}
                variant="ghost"
                size="icon"
                className="border bg-background border-transparent w-9 h-9 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronDown className={`w-4 h-4 transition-transform ${
                  isExpanded ? 'rotate-180' : ''
                }`} />
              </Button>
            </div>
          </div>

          {/* Informações de Compromisso */}
          {task.isAppointment && task.appointment && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mt-2">
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
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Comentários */}
              <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-5 border border-gray-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">💬</span>
                  </div>
                  <h4 className="font-semibold text-gray-800">Comentários ({task.comments?.length || 0})</h4>
                </div>
                {task.comments?.length ? (
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {task.comments.map((comment) => (
                      <div key={comment.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-gray-200/50 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-semibold text-gray-700">{comment.author.charAt(0).toUpperCase()}</span>
                          </div>
                          <span className="font-medium text-sm text-gray-700">{comment.author}</span>
                          <span className="text-xs text-gray-500 ml-auto">{new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-gray-500 text-xl">💬</span>
                    </div>
                    <p className="text-sm text-gray-500">Nenhum comentário ainda</p>
                  </div>
                )}
              </div>
              
              {/* Histórico */}
              <div className="bg-gradient-to-br from-slate-50 to-gray-100 rounded-xl p-5 border border-slate-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-slate-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">📋</span>
                  </div>
                  <h4 className="font-semibold text-gray-800">Histórico ({task.history?.length || 0})</h4>
                </div>
                {task.history?.length ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {task.history.map((entry) => (
                      <div key={entry.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-slate-200/50 shadow-sm">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${
                              entry.action === 'created' ? 'bg-green-400' :
                              entry.action === 'completed' ? 'bg-blue-400' :
                              entry.action === 'postponed' ? 'bg-yellow-400' :
                              entry.action === 'edited' ? 'bg-purple-400' : 'bg-gray-400'
                            }`}></div>
                            <span className="font-medium text-sm text-gray-900">
                              {formatHistoryMessage(entry, projects)}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{new Date(entry.timestamp).toLocaleDateString('pt-BR')} {new Date(entry.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                        </div>
                        {entry.details?.reason && (
                          <p className="text-xs text-gray-600 ml-4 mt-1 italic">&quot;{entry.details.reason}&quot;</p>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-slate-500 text-xl">📋</span>
                    </div>
                    <p className="text-sm text-gray-500">Nenhuma edição registrada</p>
                  </div>
                )}
              </div>
              
              {/* Links Externos */}
              <div className="bg-gradient-to-br from-indigo-50 to-blue-100 rounded-xl p-5 border border-indigo-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-indigo-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">🔗</span>
                  </div>
                  <h4 className="font-semibold text-gray-800">Links Úteis ({task.externalLinks?.length || 0})</h4>
                </div>
                {task.externalLinks?.length ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {task.externalLinks.map((link, index) => (
                      <div key={index} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-indigo-200/50 shadow-sm hover:shadow-md transition-shadow">
                        <a 
                          href={link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm transition-colors"
                        >
                          <ExternalLink className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">{link.length > 40 ? link.substring(0, 40) + '...' : link}</span>
                        </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-indigo-500 text-xl">🔗</span>
                    </div>
                    <p className="text-sm text-gray-500">Nenhum link cadastrado</p>
                  </div>
                )}
              </div>
              
              {/* Anexos */}
              <div className="bg-gradient-to-br from-orange-50 to-amber-100 rounded-xl p-5 border border-orange-200 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">📁</span>
                  </div>
                  <h4 className="font-semibold text-gray-800">Anexos ({task.attachments?.length || 0})</h4>
                </div>
                {task.attachments?.length ? (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {task.attachments.map((attachment) => (
                      <div key={attachment.id} className="bg-white/80 backdrop-blur-sm rounded-lg p-3 border border-orange-200/50 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <span className="text-orange-600 text-xs font-semibold">
                                {attachment.type && attachment.type.includes('image') ? '🖼️' :
                                 attachment.type && attachment.type.includes('pdf') ? '📄' :
                                 attachment.type && attachment.type.includes('doc') ? '📝' : '📁'}
                              </span>
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-sm text-gray-700 truncate">{attachment.name}</p>
                              {attachment.size && (
                                <p className="text-xs text-gray-500">{(attachment.size / 1024).toFixed(1)} KB</p>
                              )}
                            </div>
                          </div>
                          <a 
                            href={attachment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-orange-500 hover:bg-orange-600 text-white px-3 py-1 rounded-lg text-xs font-medium transition-colors flex-shrink-0"
                          >
                            Baixar
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <span className="text-orange-500 text-xl">📁</span>
                    </div>
                    <p className="text-sm text-gray-500">Nenhum anexo disponível</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
