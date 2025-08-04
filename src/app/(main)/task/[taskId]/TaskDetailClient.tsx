'use client';

// ============================================================================
// CLIENTE DE DETALHES DA TAREFA - Design de Painel de Controle Moderno
// ============================================================================

import React, { useState, useEffect } from 'react';
import { Task } from '@/types/task';
import { useTasksStore } from '@/stores/tasksStore';
import { Button } from '@/components/ui/button';
import { Edit, Paperclip, MessageSquare, Clock, ArrowLeft, Link as LinkIcon, ChevronLeft, ChevronRight, Grid3X3 } from 'lucide-react';
import { CommentSection } from '@/components/task/CommentSection';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

const EditView = ({ task, onSave, onCancel }: { task: Task, onSave: (updates: Partial<Task>) => void, onCancel: () => void }) => {
    const [description, setDescription] = useState(task.description);
    const [energyPoints, setEnergyPoints] = useState(task.energyPoints);
    const [dueDate, setDueDate] = useState(task.dueDate || '');
    const { projects } = useTasksStore();

    const handleSave = () => {
        onSave({
            description,
            energyPoints,
            dueDate: dueDate || undefined,
        });
    };

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-6">Editar {task.type === 'brick' ? 'Tijolo' : 'Tarefa'}</h2>
            
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
                            <button
                                key={energy}
                                type="button"
                                onClick={() => setEnergyPoints(energy as 1 | 3 | 5)}
                                className={`px-4 py-2 rounded-lg border transition-all ${
                                    energyPoints === energy
                                        ? 'bg-blue-100 border-blue-500 text-blue-700'
                                        : 'border-gray-300 hover:border-blue-300'
                                }`}
                            >
                                {energy === 1 && '🔋'} {energy === 3 && '🧠'} {energy === 5 && '⚡'} {energy}
                            </button>
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

const fieldLabels: { [key: string]: string } = {
    description: 'Descrição',
    energyPoints: 'Energia',
    dueDate: 'Data de Vencimento',
    projectId: 'Projeto',
    status: 'Status',
};

export function TaskDetailClient({ task: initialTask }: { task: Task }) {
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState(initialTask);
    const { projects, updateTask, editProjectTask } = useTasksStore();
    const router = useRouter();

    // Encontra o projeto e tijolos relacionados
    const currentProject = initialTask.projectId ? projects.find(p => p.id === initialTask.projectId) : null;
    const projectBricks = currentProject ? currentProject.backlog : [];
    const currentBrickIndex = projectBricks.findIndex(b => b.id === initialTask.id);
    const previousBrick = currentBrickIndex > 0 ? projectBricks[currentBrickIndex - 1] : null;
    const nextBrick = currentBrickIndex >= 0 && currentBrickIndex < projectBricks.length - 1 ? projectBricks[currentBrickIndex + 1] : null;

    useEffect(() => {
        setFormData(initialTask);
    }, [initialTask]);

    const handleSave = (updates: Partial<Task>) => {
        if (initialTask.type === 'brick' && initialTask.projectId) {
            editProjectTask(initialTask.projectId, initialTask.id, updates.description || initialTask.description, updates.energyPoints || initialTask.energyPoints);
        } else {
            updateTask(initialTask.id, updates);
        }
        setFormData(prev => ({ ...prev, ...updates }));
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
    };

    const getProjectName = (projectId?: string) => {
        if (!projectId) return 'Nenhum';
        return projects.find(p => p.id === projectId)?.name || 'Desconhecido';
    };

    // Função de formatação de histórico corrigida
    const formatHistoryValue = (field: string, value: string | number | null | undefined) => {
        if (value === null || value === undefined || value === '') return <span className="italic text-gray-500">vazio</span>;
        if (field === 'dueDate' && typeof value === 'string') {
            const [year, month, day] = value.split('-');
            return `${day}/${month}/${year}`;
        }
        if (field === 'projectId') return projects.find(p => p.id === value)?.name || 'Nenhum';
        return <span className="font-semibold text-gray-800 dark:text-gray-200">{value.toString()}</span>;
    };

    const ReadOnlyView = () => (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-8">
            <main className="lg:col-span-3 space-y-8">
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


                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Comentários */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-blue-200 dark:border-gray-700 p-6">
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
                        
                        <div className="mt-4 pt-4 border-t border-blue-200 dark:border-gray-700">
                            <CommentSection task={formData} />
                        </div>
                    </div>

                    {/* Histórico */}
                    <div className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-amber-200 dark:border-gray-700 p-6">
                        <div className="flex items-center mb-6">
                            <div className="p-2 bg-amber-100 dark:bg-amber-900 rounded-lg mr-3">
                                <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400"/>
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Histórico</h2>
                            <span className="ml-auto bg-amber-600 text-white text-xs px-2 py-1 rounded-full">{(formData.history || []).length}</span>
                        </div>
                        
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                            {[...(formData.history || [])].reverse().map(h => (
                                <div key={h.id} className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm border border-amber-100 dark:border-gray-600">
                                    <div className="flex items-start">
                                        <div className="w-2 h-2 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                        <div className="flex-1 text-sm">
                                            <p className="text-gray-800 dark:text-gray-200 leading-relaxed">
                                                <span className="font-medium">{fieldLabels[h.field] || h.field}</span> alterado de {formatHistoryValue(h.field, String(h.oldValue))} para {formatHistoryValue(h.field, String(h.newValue))}
                                            </p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{new Date(h.timestamp).toLocaleString()}</p>
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
            </main>

            <aside className="space-y-6">
                {/* Detalhes */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl shadow-lg border border-green-200 dark:border-gray-700 p-6">
                    <div className="flex items-center mb-6">
                        <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg mr-3">
                            <div className="w-5 h-5 bg-green-600 dark:bg-green-400 rounded-full"></div>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Detalhes</h3>
                    </div>
                    
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-green-100 dark:border-gray-600">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    formData.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    formData.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>{formData.status}</span>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-green-100 dark:border-gray-600">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Energia</span>
                                <div className="flex items-center">
                                    <span className="font-bold text-lg text-green-600 dark:text-green-400">{formData.energyPoints}</span>
                                    <span className="ml-1 text-green-500">
                                        {formData.energyPoints === 1 ? '🔋' : formData.energyPoints === 3 ? '🧠' : '⚡'}
                                    </span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-green-100 dark:border-gray-600">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Projeto</span>
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">{getProjectName(formData.projectId)}</span>
                            </div>
                        </div>
                        
                        <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-green-100 dark:border-gray-600">
                            <div className="flex justify-between items-center">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Criada em</span>
                                <span className="font-semibold text-gray-900 dark:text-white text-sm">{new Date(formData.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                        
                        {formData.dueDate && (
                            <div className="bg-white dark:bg-gray-800 rounded-lg p-3 shadow-sm border border-red-200 dark:border-gray-600">
                                <div className="flex justify-between items-center">
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Vence em</span>
                                    <span className="font-semibold text-red-500 text-sm">{new Date(formData.dueDate + 'T00:00:00').toLocaleDateString()}</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
                
                {/* Anexos e Links */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-purple-200 dark:border-gray-700 p-4">
                        <div className="flex items-center mb-3">
                            <div className="p-1.5 bg-purple-100 dark:bg-purple-900 rounded-lg mr-2">
                                <Paperclip className="w-4 h-4 text-purple-600 dark:text-purple-400"/>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Anexos</h3>
                        </div>
                        <div className="text-center py-4">
                            <Paperclip className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Em breve</p>
                        </div>
                    </div>
                    
                    <div className="bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-gray-800 dark:to-gray-900 rounded-xl shadow-lg border border-cyan-200 dark:border-gray-700 p-4">
                        <div className="flex items-center mb-3">
                            <div className="p-1.5 bg-cyan-100 dark:bg-cyan-900 rounded-lg mr-2">
                                <LinkIcon className="w-4 h-4 text-cyan-600 dark:text-cyan-400"/>
                            </div>
                            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Links</h3>
                        </div>
                        <div className="text-center py-4">
                            <LinkIcon className="w-8 h-8 text-gray-300 mx-auto mb-2"/>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Em breve</p>
                        </div>
                    </div>
                </div>
            </aside>
        </div>
    );

    return (
        <div className="max-w-7xl mx-auto p-4 sm:p-6">
            {/* Header */}
            <div className="mb-8">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
                        <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                {formData.type === 'brick' ? '🧱' : '📋'}
                            </div>
                            <div>
                                <h1 className="text-3xl font-bold">{formData.description}</h1>
                                <p className="text-blue-100 mt-1">{formData.type === 'brick' ? 'Tijolo de Projeto' : 'Tarefa Individual'}</p>
                            </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => router.back()}
                                className="flex items-center space-x-2 px-4 py-2 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors border border-white/30"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                <span>Voltar</span>
                            </button>
                            
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center space-x-2 px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-xl hover:bg-white/30 transition-colors border border-white/30"
                                >
                                    <Edit className="w-5 h-5" />
                                    <span>Editar</span>
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{formData.energyPoints}</div>
                            <div className="text-sm text-blue-100">Energia</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{formData.status === 'completed' ? '✅' : '⏳'}</div>
                            <div className="text-sm text-blue-100">{formData.status === 'completed' ? 'Concluída' : 'Pendente'}</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{formData.comments?.length || 0}</div>
                            <div className="text-sm text-blue-100">Comentários</div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                            <div className="text-2xl font-bold">{getProjectName(formData.projectId) !== 'Nenhum' ? '📁' : '📋'}</div>
                            <div className="text-sm text-blue-100">{getProjectName(formData.projectId) !== 'Nenhum' ? 'Projeto' : 'Individual'}</div>
                        </div>
                    </div>
                </div>
            </div>

            {isEditing ? (
                <div className="max-w-3xl mx-auto">
                    <EditView task={formData} onSave={handleSave} onCancel={handleCancel} />
                </div>
            ) : (
                <ReadOnlyView />
            )}
        </div>
    );
}