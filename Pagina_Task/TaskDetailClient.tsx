'use client';

// ============================================================================
// CLIENTE DE DETALHES DA TAREFA - Design de Painel de Controle Moderno
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { useTasksStore } from '@/stores/tasksStore';
import { useUpdateTask, useTask } from '@/hooks/api/useTasks';
import { useUpdateProject, useUpdateProjectTask, useProjects } from '@/hooks/api/useProjects';
import { Button } from '@/components/ui/button';
import { Edit, Paperclip, MessageSquare, Clock, ArrowLeft, Link as LinkIcon, ChevronLeft, ChevronRight, Grid3X3, Bell, Plus, Settings } from 'lucide-react';
import { CommentSection } from '@/components/task/CommentSection';
import { AttachmentManager } from '@/components/shared/AttachmentManager';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { formatHistoryMessage } from '@/utils/historyFormatter';
import { useTaskReminders, useCreateReminder, useUpdateReminder, useDeleteReminder } from '@/hooks/api/useReminders';
import { useRemindersStore } from '@/stores/remindersStore';
import { useNotification, useAsyncNotification } from '@/hooks/useNotification';
import { StandardReminderSection } from '@/components/shared/StandardReminderCard';
import { ModernReminderModal } from '@/components/shared/ReminderModal';
import { ReminderEditModal } from '@/components/shared/ReminderEditModal';
import ReminderSectionIntegrated from '@/components/reminders/ReminderSectionIntegrated';
import type { CreateReminderData, Reminder } from '@/types/reminder';

// Helper function para exibir tipo da tarefa
const getTaskTypeDisplay = (task: Task): string => {
    const types = [];
    
    if (task.type === 'brick') {
        types.push('🧱 Tijolo');
    } else {
        types.push('📋 Tarefa');
    }
    
    if (task.isRecurring) {
        types.push('🔄 Recorrente');
    }
    
    if (task.isAppointment) {
        types.push('📅 Compromisso');
    }
    
    return types.length > 1 ? types.join(' • ') : types[0];
};

// Helper function para formatar horários
const formatTime = (time: string): string => {
    if (!time) return '';
    try {
        const [hours, minutes] = time.split(':');
        return `${hours}:${minutes}`;
    } catch {
        return time;
    }
};

// Helper function para formatar dias da semana
const formatDaysOfWeek = (days: number[]): string => {
    if (!days || days.length === 0) return '';
    
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    
    if (days.length === 7) return 'Todos os dias';
    if (days.length === 5 && !days.includes(0) && !days.includes(6)) return 'Dias úteis';
    if (days.length === 2 && days.includes(0) && days.includes(6)) return 'Fins de semana';
    
    return days.sort().map(day => dayNames[day]).join(', ');
};

const EditView = ({ task, onSave, onCancel }: { task: Task, onSave: (updates: Partial<Task>) => void, onCancel: () => void }) => {
    const [description, setDescription] = useState(task.description);
    const [energyPoints, setEnergyPoints] = useState(task.energyPoints);
    const [dueDate, setDueDate] = useState(task.dueDate ? task.dueDate.split('T')[0] : '');
    const [projectId, setProjectId] = useState(task.projectId || '');
    const [taskType, setTaskType] = useState(task.type || 'task');
    const [isRecurring, setIsRecurring] = useState(task.isRecurring || false);
    const [isAppointment, setIsAppointment] = useState(task.isAppointment || false);
    const [scheduledTime, setScheduledTime] = useState(task.appointment?.scheduledTime || '');
    const [preparationTime, setPreparationTime] = useState(task.appointment?.preparationTime || 0);
    const [location, setLocation] = useState(task.appointment?.location || '');
    const [appointmentNotes, setAppointmentNotes] = useState(task.appointment?.notes || '');
    const [recurrenceFrequency, setRecurrenceFrequency] = useState(task.recurrence?.frequency || 'daily');
    const [daysOfWeek, setDaysOfWeek] = useState<number[]>(task.recurrence?.daysOfWeek || []);
    const { data: projects = [], isLoading: projectsLoading } = useProjects();
    
    

    const handleSave = () => {
        const updates: Partial<Task> = {
            description,
            energyPoints,
            dueDate: dueDate || undefined,
            projectId: projectId || undefined,
            type: taskType as 'task' | 'brick',
            isRecurring,
            isAppointment,
        };

        // Configurações de compromisso
        if (isAppointment) {
            updates.appointment = {
                scheduledTime,
                preparationTime,
                location: location || undefined,
                notes: appointmentNotes || undefined,
            };
        }

        // Configurações de recorrência
        if (isRecurring) {
            updates.recurrence = {
                frequency: recurrenceFrequency as 'daily' | 'weekly' | 'custom',
                daysOfWeek: recurrenceFrequency === 'weekly' || recurrenceFrequency === 'custom' ? daysOfWeek : undefined,
            };
        }

        onSave(updates);
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Editar {getTaskTypeDisplay(task)}</h2>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Descrição</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nível de Energia</label>
                    <div className="flex space-x-3">
                        {[1, 3, 5].map((energy) => (
                            <Button
                                key={energy}
                                type="button"
                                onClick={() => setEnergyPoints(energy as 1 | 3 | 5)}
                                variant={energyPoints === energy ? "default" : "outline"}
                                className={`px-4 py-2 rounded-lg transition-all ${
                                    energyPoints === energy
                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                        : 'border-gray-300 hover:border-blue-300'
                                }`}
                            >
                                {energy === 1 && '🔋'} {energy === 3 && '🧠'} {energy === 5 && '⚡'} {energy}
                            </Button>
                        ))}
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Data de Vencimento</label>
                    <input
                        type="date"
                        value={dueDate}
                        onChange={(e) => setDueDate(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>

                {/* Seleção de Projeto */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Projeto</label>
                    {projectsLoading && (
                        <div className="mb-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <div className="flex items-center space-x-2 text-blue-800 text-sm">
                                <span>⏳</span>
                                <span>Carregando projetos...</span>
                            </div>
                        </div>
                    )}
                    <select
                        value={projectId}
                        onChange={(e) => {
                            const newProjectId = e.target.value;
                            setProjectId(newProjectId);
                            // Alterar tipo da tarefa baseado na seleção do projeto
                            setTaskType(newProjectId ? 'brick' : 'task');
                        }}
                        disabled={projectsLoading}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                    >
                        <option value="">
                            {projectsLoading ? 'Carregando projetos...' : 'Nenhum projeto'}
                        </option>
                        {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                                {project.icon} {project.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Opções de Tipo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isRecurring"
                            checked={isRecurring}
                            onChange={(e) => setIsRecurring(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isRecurring" className="text-sm font-medium text-gray-700">
                            🔄 Tarefa Recorrente
                        </label>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="isAppointment"
                            checked={isAppointment}
                            onChange={(e) => setIsAppointment(e.target.checked)}
                            className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="isAppointment" className="text-sm font-medium text-gray-700">
                            📅 Compromisso
                        </label>
                    </div>
                </div>

                {/* Configurações de Recorrência */}
                {isRecurring && (
                    <div className="bg-blue-50 rounded-lg p-4 space-y-4">
                        <h3 className="text-lg font-medium text-blue-900">⚙️ Configurações de Recorrência</h3>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Frequência</label>
                            <select
                                value={recurrenceFrequency}
                                onChange={(e) => setRecurrenceFrequency(e.target.value as "daily" | "weekly" | "custom")}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                                <option value="daily">Diariamente</option>
                                <option value="weekly">Semanalmente</option>
                                <option value="custom">Personalizado</option>
                            </select>
                        </div>

                        {(recurrenceFrequency === 'weekly' || recurrenceFrequency === 'custom') && (
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Dias da Semana</label>
                                <div className="grid grid-cols-7 gap-2">
                                    {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, index) => (
                                        <Button
                                            key={index}
                                            type="button"
                                            onClick={() => {
                                                if (daysOfWeek.includes(index)) {
                                                    setDaysOfWeek(daysOfWeek.filter(d => d !== index));
                                                } else {
                                                    setDaysOfWeek([...daysOfWeek, index]);
                                                }
                                            }}
                                            variant={daysOfWeek.includes(index) ? "default" : "outline"}
                                            className="text-xs p-2"
                                        >
                                            {day}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Configurações de Compromisso */}
                {isAppointment && (
                    <div className="bg-green-50 rounded-lg p-4 space-y-4">
                        <h3 className="text-lg font-medium text-green-900">📅 Configurações de Compromisso</h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Horário</label>
                                <input
                                    type="time"
                                    value={scheduledTime}
                                    onChange={(e) => setScheduledTime(e.target.value)}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                            
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Tempo de Preparação (min)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={preparationTime}
                                    onChange={(e) => setPreparationTime(Number(e.target.value))}
                                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                />
                            </div>
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Local</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                placeholder="Ex: Sala de reuniões, Casa, Online"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notas</label>
                            <textarea
                                value={appointmentNotes}
                                onChange={(e) => setAppointmentNotes(e.target.value)}
                                placeholder="Observações sobre o compromisso"
                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                rows={2}
                            />
                        </div>
                    </div>
                )}

                <div className="flex space-x-3 pt-4">
                    <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
                        Salvar
                    </Button>
                    <Button onClick={onCancel} variant="outline">
                        Cancelar
                    </Button>
                </div>
            </div>
        </div>
    );
};


export function TaskDetailClient({ task: initialTask, onTaskUpdate }: { task: Task, onTaskUpdate?: () => void }) {
    const [isEditing, setIsEditing] = useState(false);
    
    // Usar useTask para manter sincronização com o cache do React Query
    const { data: currentTask } = useTask(initialTask.id);
    const task = currentTask || initialTask; // Fallback para initialTask se currentTask não estiver disponível
    
    const [formData, setFormData] = useState(task);
    const [attachments, setAttachments] = useState<any[]>(task.attachments || []);
    
    const { projects, updateTask, editProjectTask } = useTasksStore();
    const updateTaskMutation = useUpdateTask();
    const updateProjectTaskMutation = useUpdateProjectTask();
    const router = useRouter();
    
    // Hooks de lembretes
    const { data: taskReminders = [], isLoading: remindersLoading } = useTaskReminders(task.id);
    const { openReminderModal, resetReminderForm, showReminderModal, closeReminderModal } = useRemindersStore();
    const updateReminderMutation = useUpdateReminder();
    const deleteReminderMutation = useDeleteReminder();
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // Hooks de notificação
    const { success, error } = useNotification();
    const { withLoading } = useAsyncNotification();

    // Handlers para lembretes
    const handleEditReminder = (reminder: Reminder) => {
        setEditingReminder(reminder);
        setShowEditModal(true);
    };

    const handleUpdateReminder = async (reminderId: string, updates: any) => {
        await updateReminderMutation.mutateAsync({ reminderId, updates });
        setShowEditModal(false);
        setEditingReminder(null);
    };

    const handleDeleteReminder = async (reminderId: string) => {
        if (window.confirm('Tem certeza que deseja excluir este lembrete?')) {
            await deleteReminderMutation.mutateAsync(reminderId);
        }
    };

    // Encontra o projeto e tijolos relacionados
    const currentProject = task.projectId ? projects.find(p => p.id === task.projectId) : null;
    const projectBricks = currentProject ? currentProject.backlog : [];
    const currentBrickIndex = projectBricks.findIndex(b => b.id === task.id);
    const previousBrick = currentBrickIndex > 0 ? projectBricks[currentBrickIndex - 1] : null;
    const nextBrick = currentBrickIndex >= 0 && currentBrickIndex < projectBricks.length - 1 ? projectBricks[currentBrickIndex + 1] : null;

    // Sincronizar formData quando a tarefa for atualizada (incluindo novos comentários)
    useEffect(() => {
        setFormData(task);
        setAttachments(task.attachments || []);
    }, [task]);

    const handleSave = async (updates: Partial<Task>) => {
        try {
            let updatedTask;
            
            if (initialTask.type === 'brick' && initialTask.projectId) {
                editProjectTask(initialTask.projectId, initialTask.id, updates.description || initialTask.description, updates.energyPoints || initialTask.energyPoints);
                
                // Usar withLoading para feedback visual
                updatedTask = await withLoading(
                    () => updateProjectTaskMutation.mutateAsync({
                        projectId: initialTask.projectId || '',
                        taskId: initialTask.id,
                        updates
                    }),
                    {
                        loading: 'Salvando alterações...',
                        success: 'Tarefa atualizada com sucesso!'
                    },
                    {
                        context: 'task_crud'
                    }
                );
            } else {
                // Usar withLoading para feedback visual
                updatedTask = await withLoading(
                    () => updateTaskMutation.mutateAsync({
                        taskId: initialTask.id,
                        updates
                    }),
                    {
                        loading: 'Salvando alterações...',
                        success: 'Tarefa atualizada com sucesso!'
                    },
                    {
                        context: 'task_crud'
                    }
                );
                
                updateTask(initialTask.id, updatedTask);
            }
            
            // Atualizar estado local com dados do servidor
            if (updatedTask) {
                setFormData(updatedTask);
            } else {
                setFormData(prev => ({ ...prev, ...updates }));
            }
            
            setIsEditing(false);
            
            // Refetch dados para garantir sincronia
            if (onTaskUpdate) {
                onTaskUpdate();
            }
        } catch (err) {
            error('Erro ao salvar tarefa', {
                description: err instanceof Error ? err.message : 'Tente novamente',
                context: 'task_crud'
            });
        }
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const getProjectName = (projectId?: string) => {
        if (!projectId) return 'Nenhum';
        return projects.find(p => p.id === projectId)?.name || 'Desconhecido';
    };


    const ReadOnlyView = () => (
        <div className="space-y-8">
                {/* Container de Navegação de Tijolos */}
                {currentProject && projectBricks.length > 1 && (
                    <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl shadow-lg border border-orange-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center">
                                <span className="text-2xl mr-3">{currentProject.icon}</span>
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">🧱 Navegação de Tijolos</h3>
                                    <p className="text-sm text-gray-600">{currentProject.name} • {currentBrickIndex + 1} de {projectBricks.length}</p>
                                </div>
                            </div>
                            <Link href="/arquiteto" className="text-orange-600 hover:text-orange-700 flex items-center text-sm">
                                <Grid3X3 className="w-4 h-4 mr-1" />
                                Ver todos
                            </Link>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-0">
                            {previousBrick ? (
                                <Link href={`/task/${previousBrick.id}`} className="flex items-center bg-white border border-orange-200 rounded-lg p-3 hover:shadow-md transition-all flex-1 sm:mr-2">
                                    <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 mr-2" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs text-orange-600 font-medium">Tijolo anterior</p>
                                        <p className="text-sm text-gray-900 truncate">{previousBrick.description}</p>
                                    </div>
                                </Link>
                            ) : (
                                <div className="flex-1 sm:mr-2 hidden sm:block"></div>
                            )}
                            
                            {nextBrick ? (
                                <Link href={`/task/${nextBrick.id}`} className="flex items-center bg-white border border-orange-200 rounded-lg p-3 hover:shadow-md transition-all flex-1 sm:ml-2">
                                    <div className="min-w-0 flex-1 text-left sm:text-right">
                                        <p className="text-xs text-orange-600 font-medium">Próximo tijolo</p>
                                        <p className="text-sm text-gray-900 truncate">{nextBrick.description}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500 ml-2" />
                                </Link>
                            ) : (
                                <div className="flex-1 sm:ml-2 hidden sm:block"></div>
                            )}
                        </div>
                    </div>
                )}


                {/* Informações Específicas por Tipo */}
                <div className="space-y-6">
                    {/* Informações de Compromisso */}
                    {formData.isAppointment && formData.appointment && (
                        <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-green-200 dark:border-gray-700 p-6">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                                    <span className="text-green-600 text-xl">📅</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Detalhes do Compromisso</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-green-100 dark:border-gray-600">
                                    <div className="text-lg font-bold text-green-700 dark:text-green-400">{formatTime(formData.appointment.scheduledTime)}</div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Horário</div>
                                </div>
                                
                                {formData.appointment.preparationTime > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-green-100 dark:border-gray-600">
                                        <div className="text-lg font-bold text-green-700 dark:text-green-400">{formData.appointment.preparationTime} min</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Preparação</div>
                                    </div>
                                )}
                                
                                {formData.appointment.location && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-green-100 dark:border-gray-600">
                                        <div className="text-lg font-bold text-green-700 dark:text-green-400 truncate">📍 {formData.appointment.location}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Local</div>
                                    </div>
                                )}
                                
                                {formData.appointment.notes && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-green-100 dark:border-gray-600 md:col-span-2 lg:col-span-1">
                                        <div className="text-sm font-medium text-green-700 dark:text-green-400 mb-2">Observações:</div>
                                        <div className="text-sm text-gray-800 dark:text-gray-200">{formData.appointment.notes}</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {/* Informações de Recorrência */}
                    {formData.isRecurring && formData.recurrence && (
                        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-purple-200 dark:border-gray-700 p-6">
                            <div className="flex items-center mb-4">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg mr-3">
                                    <span className="text-purple-600 text-xl">🔄</span>
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">Configuração de Recorrência</h3>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-purple-100 dark:border-gray-600">
                                    <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                                        {formData.recurrence.frequency === 'daily' ? 'Diariamente' : 
                                         formData.recurrence.frequency === 'weekly' ? 'Semanalmente' : 'Personalizado'}
                                    </div>
                                    <div className="text-sm text-gray-600 dark:text-gray-400">Frequência</div>
                                </div>
                                
                                {formData.recurrence.daysOfWeek && formData.recurrence.daysOfWeek.length > 0 && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-purple-100 dark:border-gray-600 md:col-span-2">
                                        <div className="text-lg font-bold text-purple-700 dark:text-purple-400">{formatDaysOfWeek(formData.recurrence.daysOfWeek)}</div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Dias da semana</div>
                                    </div>
                                )}
                                
                                {formData.recurrence.lastCompleted && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-purple-100 dark:border-gray-600">
                                        <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                                            {new Date(formData.recurrence.lastCompleted).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Última conclusão</div>
                                    </div>
                                )}
                                
                                {formData.recurrence.nextDue && (
                                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-purple-100 dark:border-gray-600">
                                        <div className="text-lg font-bold text-purple-700 dark:text-purple-400">
                                            {new Date(formData.recurrence.nextDue).toLocaleDateString('pt-BR')}
                                        </div>
                                        <div className="text-sm text-gray-600 dark:text-gray-400">Próxima data</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Comentários - 2/3 da largura */}
                    <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-blue-200 dark:border-gray-700 p-6 flex flex-col">
                        <div className="flex items-center mb-6">
                            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg mr-3">
                                <MessageSquare className="w-5 h-5 text-blue-600 dark:text-blue-400"/>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Comentários</h2>
                            <span className="ml-auto bg-blue-600 text-white text-xs px-2 py-1 rounded-full">{(formData.comments || []).length}</span>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {(formData.comments || []).map(c => (
                                <div key={c.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-blue-100 dark:border-gray-600">
                                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">{c.content}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 flex items-center">
                                        <span className="w-2 h-2 bg-blue-400 rounded-full mr-2"></span>
                                        {c.author} • {new Date(c.createdAt).toLocaleString()}
                                    </p>
                                </div>
                            ))}
                            {(formData.comments || []).length === 0 && (
                                <div className="text-center py-8">
                                    <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                                    <p className="text-gray-500 dark:text-gray-400">Nenhum comentário ainda</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-blue-200 dark:border-gray-700">
                            <CommentSection task={task} />
                        </div>
                    </div>

                    {/* Histórico - 1/3 da largura */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-amber-200 dark:border-gray-700 p-6">
                        <div className="flex items-center mb-6">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg mr-3">
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400"/>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Histórico</h2>
                            <span className="ml-auto bg-amber-600 text-white text-xs px-2 py-1 rounded-full">{(formData.history || []).length}</span>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {[...(formData.history || [])].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(h => (
                                <div key={h.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-amber-100 dark:border-gray-600">
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <div className="flex-1 text-sm">
                                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                                {formatHistoryMessage(h, projects)}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(h.timestamp).toLocaleDateString('pt-BR')} {new Date(h.timestamp).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</p>
                                            {h.details?.reason && (
                                                <p className="text-xs text-gray-600 mt-1 italic">&quot;{h.details.reason}&quot;</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(formData.history || []).length === 0 && (
                                <div className="text-center py-8">
                                    <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                                    <p className="text-gray-500 dark:text-gray-400">Nenhuma alteração registrada</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Nova Seção de Lembretes Diferenciada */}
                <ReminderSectionIntegrated
                  entity={formData}
                  entityType="task"
                />
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center text-3xl">
                                {formData.type === 'brick' ? '🧱' : 
                                 formData.isAppointment ? '📅' : 
                                 formData.isRecurring ? '🔄' : '📋'}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{formData.description}</h1>
                                <p className="text-blue-100 text-sm mt-1">{getTaskTypeDisplay(formData)}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <Button
                                onClick={() => router.back()}
                                variant="ghost"
                                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors border border-white/30"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Voltar</span>
                            </Button>
                            
                            {!isEditing && (
                                <Button
                                    onClick={() => setIsEditing(true)}
                                    variant="ghost"
                                    className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors border border-white/30"
                                >
                                    <Edit className="w-5 h-5" />
                                    <span>Editar</span>
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Estatísticas Adaptáveis por Tipo */}
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mt-6">
                        {/* Energia */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{formData.energyPoints}</div>
                            <div className="text-sm text-blue-100">Energia</div>
                        </div>
                        
                        {/* Status */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{formData.status === 'completed' ? '✅' : '⏳'}</div>
                            <div className="text-sm text-blue-100">{formData.status === 'completed' ? 'Concluída' : 'Pendente'}</div>
                        </div>
                        
                        {/* Comentários */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{formData.comments?.length || 0}</div>
                            <div className="text-sm text-blue-100">Comentários</div>
                        </div>
                        
                        
                        {/* Horário do Compromisso */}
                        {formData.isAppointment && formData.appointment?.scheduledTime && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                <div className="text-lg font-bold">{formatTime(formData.appointment.scheduledTime)}</div>
                                <div className="text-sm text-blue-100">Horário</div>
                            </div>
                        )}
                        
                        {/* Recorrência */}
                        {formData.isRecurring && formData.recurrence && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                <div className="text-lg font-bold">
                                    {formData.recurrence.frequency === 'daily' ? '📆' : 
                                     formData.recurrence.frequency === 'weekly' ? '📅' : '🗓️'}
                                </div>
                                <div className="text-sm text-blue-100">
                                    {formData.recurrence.frequency === 'daily' ? 'Diário' : 
                                     formData.recurrence.frequency === 'weekly' ? 'Semanal' : 'Custom'}
                                </div>
                            </div>
                        )}
                        
                        {/* Data de Vencimento */}
                        {formData.dueDate && (
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                                <div className="text-lg font-semibold">{
                                    (() => {
                                        try {
                                            let dateStr = formData.dueDate;
                                            
                                            if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                                                const [year, month, day] = dateStr.split('-');
                                                return `${day}/${month}`;
                                            }
                                            
                                            if (dateStr.includes('T')) {
                                                const datePart = dateStr.split('T')[0];
                                                const [year, month, day] = datePart.split('-');
                                                return `${day}/${month}`;
                                            }
                                            
                                            return 'Data inválida';
                                        } catch (err) {
                                            // Não usar console.error aqui pois é apenas formatação
                                            return 'Data inválida';
                                        }
                                    })()
                                }</div>
                                <div className="text-sm text-blue-100">Vencimento</div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isEditing ? (
                <div className="max-w-3xl mx-auto">
                    <EditView task={formData} onSave={handleSave} onCancel={handleCancel} />
                </div>
            ) : (
                <>
                    <ReadOnlyView />
                    
                    {/* Seção de Anexos e Links */}
                    <div className="mt-8">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* Anexos - 1/3 da largura */}
                            <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-green-200 dark:border-gray-700 p-6">
                                <AttachmentManager
                                    taskId={formData.id}
                                    attachments={attachments}
                                    onAttachmentsChange={(newAttachments) => {
                                        setAttachments(newAttachments);
                                        // Atualizar dados locais
                                        setFormData(prev => ({ ...prev, attachments: newAttachments }));
                                        // CORREÇÃO: Não atualizar store local aqui pois causa conflito
                                        // O AttachmentManager já chama a API corretamente
                                    }}
                                />
                            </div>
                            
                            {/* Links - 2/3 da largura */}
                            <div className="lg:col-span-2 bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-cyan-200 dark:border-gray-700 p-6">
                                <div className="flex items-center mb-6">
                                    <div className="p-2 bg-cyan-100 dark:bg-cyan-900 rounded-lg mr-3">
                                        <LinkIcon className="w-5 h-5 text-cyan-600 dark:text-cyan-400"/>
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Links</h3>
                                </div>
                                <div className="text-center py-8">
                                    <LinkIcon className="w-12 h-12 text-gray-300 mx-auto mb-3"/>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Em breve</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Modal de Lembretes */}
            <ModernReminderModal
                entityId={initialTask.id}
                entityType="task"
            />
            
            {/* Modal de Edição de Lembretes */}
            <ReminderEditModal
                isOpen={showEditModal}
                onClose={() => {
                    setShowEditModal(false);
                    setEditingReminder(null);
                }}
                reminder={editingReminder}
                onUpdate={handleUpdateReminder}
                isLoading={updateReminderMutation.isPending}
            />
        </div>
    );
}