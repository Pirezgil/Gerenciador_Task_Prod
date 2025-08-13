'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTodayTasks, useUpdateTask } from '@/hooks/api/useTasks';
import { Button } from '@/components/ui/button';
import { useStandardAlert } from '@/components/shared/StandardAlert';
import { Clock, ChevronDown, ExternalLink, Battery, Brain, Zap } from 'lucide-react';
import Link from 'next/link';
import { formatHistoryMessage } from '@/utils/historyFormatter';

export function PostponedTasksRoom() {
  const { data: todayTasks = [] } = useTodayTasks();
  const updateTaskMutation = useUpdateTask();
  const { showAlert, AlertComponent } = useStandardAlert();
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  
  console.log('🔍 PostponedTasksRoom Debug - Todas as tarefas:', todayTasks.map(t => ({
    id: t.id,
    description: t.description,
    status: t.status,
    postponedAt: t.postponedAt
  })));
  
  // Filtrar apenas tarefas adiadas hoje
  const today = new Date().toISOString().split('T')[0];
  const postponedTasks = todayTasks.filter(task => task.status === 'postponed' || task.status === 'POSTPONED');
  
  console.log('🔍 PostponedTasksRoom Debug - Tarefas POSTPONED:', postponedTasks.length);
  
  const todayPostponedTasks = postponedTasks.filter(task => {
    if (!task.postponedAt) return false;
    const postponedDate = new Date(task.postponedAt).toISOString().split('T')[0];
    const match = postponedDate === today;
    console.log('🔍 PostponedTasksRoom Debug - Tarefa:', task.description, 'postponedDate:', postponedDate, 'today:', today, 'match:', match);
    return match;
  });
  
  console.log('🔍 PostponedTasksRoom Debug - Tarefas adiadas hoje:', todayPostponedTasks.length);

  const handleToggleExpansion = (taskId: string) => {
    setExpandedTasks(prev => {
      const newSet = new Set(prev);
      if (newSet.has(taskId)) {
        newSet.delete(taskId);
      } else {
        newSet.add(taskId);
      }
      return newSet;
    });
  };

  return (
    <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-6 shadow-xl border border-yellow-200/50">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center mr-3">
          <span className="text-white text-sm">⏳</span>
        </div>
        Sala de Replanejamento
        <span className="ml-2 text-sm bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">{todayPostponedTasks.length}</span>
      </h3>
      <div className="space-y-2">
        {todayPostponedTasks.map((postponedTask) => {
          const isExpanded = expandedTasks.has(postponedTask.id);
          return (
            <motion.div
              key={postponedTask.id}
              className="rounded-xl shadow-md transition-all hover:scale-[1.02] bg-gradient-to-r from-white to-gray-50 border-gray-200 hover:shadow-lg"
              whileHover={{ scale: 1.02 }}
            >
              <div className="p-3">
                <div className="flex flex-col gap-2">
                  {/* First Line - Task Description */}
                  <div className="flex items-center justify-between w-full">
                    <Link 
                      href={`/task/${postponedTask.id}`}
                      className="flex-1"
                    >
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold hover:text-blue-600 transition-colors cursor-pointer text-gray-900">
                          {postponedTask.description}
                        </h3>
                      </div>
                    </Link>
                  </div>
                  
                  {/* Second Line - Badges and Actions */}
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-3">
                      {/* Energia */}
                      <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                        postponedTask.energyPoints === 1 ? 'bg-green-100 text-green-700 border border-green-200' :
                        postponedTask.energyPoints === 3 ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                        'bg-purple-100 text-purple-700 border border-purple-200'
                      }`}>
                        {postponedTask.energyPoints === 1 ? <Battery className="w-4 h-4 text-green-500" /> :
                         postponedTask.energyPoints === 3 ? <Brain className="w-4 h-4 text-blue-500" /> :
                         <Zap className="w-4 h-4 text-purple-500" />}
                        <span>{postponedTask.energyPoints === 1 ? 'Baixa' : postponedTask.energyPoints === 3 ? 'Normal' : 'Alta'}</span>
                      </div>

                      {/* Data de vencimento */}
                      {postponedTask.dueDate && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 border-red-200 border rounded-full text-xs font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{new Date(postponedTask.dueDate + 'T00:00:00').toLocaleDateString('pt-BR')}</span>
                        </div>
                      )}

                      {/* Projeto */}
                      {postponedTask.projectId && (
                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700 border border-purple-200">
                          <span>💻</span>
                          <span>Projeto</span>
                        </div>
                      )}

                      {/* Badge Adiado */}
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 border border-yellow-200">
                        <span>⏳</span>
                        <span>Adiado {postponedTask.postponementCount || 1}x</span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      <Button
                        onClick={() => handleToggleExpansion(postponedTask.id)}
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
                          <h4 className="font-semibold text-gray-800">Comentários ({postponedTask.comments?.length || 0})</h4>
                        </div>
                        {postponedTask.comments?.length ? (
                          <div className="space-y-3 max-h-40 overflow-y-auto">
                            {postponedTask.comments.map((comment) => (
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
                          <h4 className="font-semibold text-gray-800">Histórico ({postponedTask.history?.length || 0})</h4>
                        </div>
                        {postponedTask.history?.length ? (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {postponedTask.history.map((entry) => (
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
                                      {formatHistoryMessage(entry, [])}
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
                          <h4 className="font-semibold text-gray-800">Links Úteis ({postponedTask.externalLinks?.length || 0})</h4>
                        </div>
                        {postponedTask.externalLinks?.length ? (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {postponedTask.externalLinks.map((link, index) => (
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
                          <h4 className="font-semibold text-gray-800">Anexos ({postponedTask.attachments?.length || 0})</h4>
                        </div>
                        {postponedTask.attachments?.length ? (
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {postponedTask.attachments.map((attachment) => (
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
        })}
      </div>
      <AlertComponent />
    </div>
  );
}