'use client';

// ============================================================================
// NEW TASK MODAL - Versão Final com Funcionalidades Completas
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Battery, Brain, Zap, CheckSquare, AlertCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Stores e Tipos
import { useTasksStore } from '@/stores/tasksStore';
import { useModalsStore } from '@/stores/modalsStore';
import { useAuthStore } from '@/stores/authStore';
import type { Attachment } from '@/types/task';

// Componentes
import { FileUpload } from '@/components/shared/FileUpload';
import { AutoExpandingTextarea } from './AutoExpandingTextarea';

export function NewTaskModal() {
  const router = useRouter();
  
  // Estado dos Stores
  const { projects, addTask, addTaskToProject, canAddTask, calculateEnergyBudget } = useTasksStore();
  const { showCaptureModal, setShowCaptureModal, showNewTaskModal, setShowNewTaskModal, preselectedProjectId, transformedNote, setTransformedNote } = useModalsStore();
  const { user } = useAuthStore();

  // Estado local do formulário
  const [description, setDescription] = useState('');
  const [energyPoints, setEnergyPoints] = useState<1 | 3 | 5>(3);
  const [projectId, setProjectId] = useState<string | undefined>();
  const [dueDate, setDueDate] = useState('');
  const [comment, setComment] = useState('');
  const [attachment, setAttachment] = useState<Attachment | null>(null);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [selectedDays, setSelectedDays] = useState<number[]>([]);
  const [isAppointment, setIsAppointment] = useState(false);
  const [appointmentTime, setAppointmentTime] = useState('');
  const [preparationTime, setPreparationTime] = useState(30);
  const [appointmentLocation, setAppointmentLocation] = useState('');
  const [appointmentNotes, setAppointmentNotes] = useState('');
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isCreating, setIsCreating] = useState(false);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);

  const energyBudget = calculateEnergyBudget();

  // Effect para pré-popular com nota transformada e projeto pré-selecionado
  useEffect(() => {
    if (transformedNote && showNewTaskModal) {
      setDescription(transformedNote.content);
    }
    if (preselectedProjectId && showNewTaskModal) {
      setProjectId(preselectedProjectId);
    }
  }, [transformedNote, preselectedProjectId, showNewTaskModal]);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    if (!description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (description.trim().length < 3) newErrors.description = 'Descrição deve ter no mínimo 3 caracteres';
    if (!canAddTask(energyPoints)) newErrors.energy = `Energia insuficiente! Disponível: ${energyBudget.remaining}`;
    if (isAppointment && !appointmentTime) newErrors.appointmentTime = 'Horário é obrigatório para compromissos';
    if (isAppointment && !dueDate) newErrors.dueDate = 'Data é obrigatória para compromissos';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleClose = () => {
    if (isCreating) return;
    // Resetar estado
    setDescription('');
    setEnergyPoints(3);
    setProjectId(undefined);
    setDueDate('');
    setComment('');
    setAttachment(null);
    setIsRecurring(false);
    setRecurrenceFrequency('daily');
    setSelectedDays([]);
    setIsAppointment(false);
    setAppointmentTime('');
    setPreparationTime(30);
    setAppointmentLocation('');
    setAppointmentNotes('');
    setErrors({});
    setShowCaptureModal(false);
    setShowNewTaskModal(false);
    setTransformedNote(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setIsCreating(true);
    try {
      if (projectId) {
        // Se projectId estiver definido, adicionar como tijolo no projeto
        addTaskToProject(projectId, description, energyPoints, dueDate);
      } else {
        // Caso contrário, adicionar como tarefa do dia
        addTask({
          description,
          energyPoints,
          projectId,
          dueDate,
          isRecurring,
          recurrence: isRecurring ? {
            frequency: recurrenceFrequency,
            daysOfWeek: recurrenceFrequency === 'weekly' || recurrenceFrequency === 'custom' ? selectedDays : undefined,
          } : undefined,
          isAppointment,
          appointment: isAppointment ? {
            scheduledTime: appointmentTime,
            preparationTime,
            location: appointmentLocation,
            notes: appointmentNotes,
            reminderTime: 15, // Default 15 minutes before
          } : undefined,
          comments: comment ? [{
            id: Date.now().toString(),
            author: user?.name || 'Usuário',
            content: comment,
            createdAt: new Date().toISOString(),
          }] : [],
          attachments: attachment ? [attachment] : [],
          history: [],
        });
      }
      
      // Mostrar animação de sucesso
      setShowSuccessAnimation(true);
      
      // Aguardar animação e redirecionar
      setTimeout(() => {
        handleClose();
        router.push('/tarefas');
      }, 1500);

    } catch (error) {
      console.error('Erro ao criar tarefa:', error);
      setErrors({ general: 'Erro ao criar tarefa. Tente novamente.' });
      setIsCreating(false);
    }
  };

  if (!showCaptureModal && !showNewTaskModal) return null;

  return (
    <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-surface rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 text-white shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <CheckSquare className="w-6 h-6" />
                  <h2 className="text-xl font-semibold">Nova Tarefa</h2>
                </div>
                <button
                  onClick={handleClose}
                  disabled={isCreating}
                  className="p-1 hover:bg-surface/20 rounded-lg transition-colors disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-blue-100 text-sm mt-1">
                Transforme sua ideia em uma ação concreta
              </p>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
              {errors.general && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span className="text-sm">{errors.general}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                  {/* Descrição */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição da Tarefa *</label>
                    <AutoExpandingTextarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          const textarea = e.currentTarget;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const newValue = description.substring(0, start) + '\n' + description.substring(end);
                          setDescription(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + 1;
                          }, 0);
                        }
                      }}
                      placeholder="Adicione uma descrição detalhada... (Ctrl+Enter para nova linha)"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={4}
                    />
                    {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                  </div>

                  {/* Nível de Energia */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Energia *</label>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { value: 1, label: 'Simples', icon: Battery, color: 'green', desc: '5-15 min' },
                        { value: 3, label: 'Média', icon: Brain, color: 'blue', desc: '30-60 min' },
                        { value: 5, label: 'Complexa', icon: Zap, color: 'purple', desc: '2+ horas' }
                      ].map((level) => {
                        const Icon = level.icon;
                        return (
                          <button
                            key={level.value}
                            type="button"
                            onClick={() => setEnergyPoints(level.value as 1 | 3 | 5)}
                            className={`p-3 rounded-xl border-2 transition-all ${
                              energyPoints === level.value
                                ? `border-${level.color}-500 bg-${level.color}-50`
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <Icon className={`w-5 h-5 mx-auto mb-1 ${
                              energyPoints === level.value ? `text-${level.color}-600` : 'text-gray-400'
                            }`} />
                            <div className="text-sm font-medium">{level.label}</div>
                            <div className="text-xs text-gray-500">{level.desc}</div>
                          </button>
                        );
                      })}
                    </div>
                    {errors.energy && <p className="text-red-500 text-xs mt-1">{errors.energy}</p>}
                  </div>

                  {/* Data de Vencimento - Apenas se não for recorrente */}
                  {!isRecurring && (
                    <div>
                      <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                        Data de Vencimento{isAppointment && ' *'}
                      </label>
                      <input
                        type="date"
                        id="dueDate"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.dueDate && <p className="text-red-500 text-xs mt-1">{errors.dueDate}</p>}
                    </div>
                  )}

                  {/* Recorrência */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        id="isRecurring"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">🔄 Tarefa Recorrente</label>
                    </div>
                    
                    {isRecurring && (
                      <div className="space-y-3 pl-6 border-l-2 border-blue-200">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Frequência</label>
                          <select
                            value={recurrenceFrequency}
                            onChange={(e) => setRecurrenceFrequency(e.target.value as 'daily' | 'weekly' | 'custom')}
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="daily">Todos os dias</option>
                            <option value="weekly">Semanalmente</option>
                            <option value="custom">Dias específicos</option>
                          </select>
                        </div>
                        
                        {(recurrenceFrequency === 'weekly' || recurrenceFrequency === 'custom') && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Dias da semana</label>
                            <div className="grid grid-cols-7 gap-1">
                              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map((day, index) => (
                                <button
                                  key={index}
                                  type="button"
                                  onClick={() => {
                                    setSelectedDays(prev => 
                                      prev.includes(index) 
                                        ? prev.filter(d => d !== index)
                                        : [...prev, index]
                                    );
                                  }}
                                  className={`p-2 text-xs rounded-md transition-all ${
                                    selectedDays.includes(index)
                                      ? 'bg-blue-100 text-blue-700 border-2 border-blue-500'
                                      : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                                  }`}
                                >
                                  {day}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sistema de Compromissos */}
                  <div>
                    <div className="flex items-center space-x-2 mb-3">
                      <input
                        type="checkbox"
                        id="isAppointment"
                        checked={isAppointment}
                        onChange={(e) => setIsAppointment(e.target.checked)}
                        className="rounded border-gray-300 text-purple-600 focus:ring-purple-500"
                      />
                      <label htmlFor="isAppointment" className="text-sm font-medium text-gray-700">📅 Compromisso com Horário</label>
                    </div>
                    
                    {isAppointment && (
                      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
                        <div className="flex items-start space-x-2">
                          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                          <div className="text-sm text-amber-800">
                            <p className="font-medium mb-1">⚠️ Aviso Importante sobre Compromissos</p>
                            <p>
                              Considerando sua condição neurodivergente, recomendamos <strong>dobrar o tempo que você acredita ser necessário</strong> para preparação e execução deste compromisso. 
                              Sua percepção de tempo pode ser diferente, e este buffer extra ajudará a reduzir ansiedade e garantir melhor performance.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {isAppointment && (
                      <div className="space-y-3 pl-6 border-l-2 border-purple-200">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                            <input
                              type="time"
                              value={appointmentTime}
                              onChange={(e) => setAppointmentTime(e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            />
                            {errors.appointmentTime && <p className="text-red-500 text-xs mt-1">{errors.appointmentTime}</p>}
                          </div>
                          
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Preparação</label>
                            <select
                              value={preparationTime}
                              onChange={(e) => setPreparationTime(Number(e.target.value))}
                              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            >
                              <option value={15}>15 minutos</option>
                              <option value={30}>30 minutos</option>
                              <option value={45}>45 minutos</option>
                              <option value={60}>1 hora</option>
                              <option value={90}>1h 30min</option>
                              <option value={120}>2 horas</option>
                            </select>
                          </div>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Local (opcional)</label>
                          <input
                            type="text"
                            value={appointmentLocation}
                            onChange={(e) => setAppointmentLocation(e.target.value)}
                            placeholder="Ex: Escritório, Casa, Reunião online..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Notas do Compromisso</label>
                          <textarea
                            value={appointmentNotes}
                            onChange={(e) => setAppointmentNotes(e.target.value)}
                            placeholder="Preparativos necessários, materiais, agenda..."
                            className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                            rows={2}
                          />
                        </div>
                        
                        {appointmentTime && (
                          <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                            <div className="text-sm text-purple-800">
                              <div className="font-medium mb-1">⏰ Cronograma Sugerido:</div>
                              <div className="space-y-1 text-xs">
                                {(() => {
                                  const appointmentDate = new Date(`2000-01-01T${appointmentTime}`);
                                  const preparationStart = new Date(appointmentDate.getTime() - preparationTime * 60000);
                                  const reminderTime = new Date(appointmentDate.getTime() - 15 * 60000);
                                  
                                  return (
                                    <>
                                      <div>
                                        🔔 Lembrete: {reminderTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} (15min antes)
                                      </div>
                                      <div>
                                        🚀 Preparação: {preparationStart.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} até {appointmentTime}
                                      </div>
                                      <div>
                                        ✨ Compromisso: {appointmentTime}
                                      </div>
                                    </>
                                  );
                                })()}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">

                  {/* Projeto */}
                  <div>
                    <label htmlFor="projectId" className="block text-sm font-medium text-gray-700 mb-2">Projeto</label>
                    <select 
                      id="projectId" 
                      value={projectId || ''} 
                      onChange={(e) => setProjectId(e.target.value || undefined)} 
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      disabled={!!preselectedProjectId}
                    >
                      <option value="">Nenhum projeto</option>
                      {projects.map(p => <option key={p.id} value={p.id}>{p.icon} {p.name}</option>)}
                    </select>
                    {projectId && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-center space-x-2">
                          <span className="text-blue-600">🧱</span>
                          <span className="text-sm text-blue-800 font-medium">Esta tarefa será tratada como um tijolo do projeto</span>
                        </div>
                        <p className="text-xs text-blue-600 mt-1">
                          Tijolos podem ser movidos para o dia a qualquer momento através da página do Arquiteto
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Comentário */}
                  <div>
                    <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">Comentário Inicial</label>
                    <AutoExpandingTextarea
                      id="comment"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.ctrlKey) {
                          const textarea = e.currentTarget;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const newValue = comment.substring(0, start) + '\n' + comment.substring(end);
                          setComment(newValue);
                          setTimeout(() => {
                            textarea.selectionStart = textarea.selectionEnd = start + 1;
                          }, 0);
                        }
                      }}
                      placeholder="Adicionar um comentário inicial (opcional)... (Ctrl+Enter para nova linha)"
                      className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                      rows={3}
                    />
                  </div>

                  {/* Anexo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Anexos</label>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-4">
                      <FileUpload
                        attachments={attachment ? [attachment] : []}
                        onUpload={(files) => {
                          const newAttachment = {
                            id: Date.now().toString(),
                            name: files[0].name,
                            url: URL.createObjectURL(files[0]), // Simulação
                            type: files[0].type,
                            size: files[0].size,
                            uploadedAt: new Date().toISOString(),
                          };
                          setAttachment(newAttachment);
                          return Promise.resolve([newAttachment]);
                        }}
                        onRemove={() => setAttachment(null)}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="text-sm text-gray-500">
                  * Campos obrigatórios
                </div>
                <div className="flex space-x-3">
                  <button 
                    type="button" 
                    onClick={handleClose}
                    disabled={isCreating}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-xl font-medium transition-colors disabled:opacity-50"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={isCreating || !description.trim()}
                    className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isCreating ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Criando...</span>
                      </>
                    ) : (
                      <>
                        <CheckSquare className="w-4 h-4" />
                        <span>Criar Tarefa</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Animação de Sucesso */}
          <AnimatePresence>
            {showSuccessAnimation && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-br from-green-500/90 to-emerald-600/90 rounded-2xl flex items-center justify-center z-10"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", duration: 0.8 }}
                  className="text-center text-white"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                    className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"
                  >
                    <CheckSquare className="w-10 h-10" />
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="text-2xl font-bold mb-2"
                  >
                    ✨ Tarefa Criada!
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-white/90"
                  >
                    Redirecionando para suas tarefas...
                  </motion.p>
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.9, repeat: Infinity, duration: 1 }}
                    className="mt-4"
                  >
                    <div className="flex justify-center space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
    </AnimatePresence>
  );
}