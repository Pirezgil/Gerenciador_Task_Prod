# SCRIPT: Executa implementação Python para gerenciamento de tijolos
# DESCRIÇÃO: Salva e executa script Python que modifica os arquivos existentes

param()

Write-Host "===============================================" -ForegroundColor Green
Write-Host "🏗️ IMPLEMENTAÇÃO DE GERENCIAMENTO DE TIJOLOS" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

# Verificar se Python está disponível
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python encontrado: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Python não encontrado, executando modificações diretas..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📝 Modificando arquivos diretamente..." -ForegroundColor Cyan

# ============================================================================
# BLOCO 1: Atualizando tasksStore.ts
# ============================================================================

Write-Host ""
Write-Host "📝 BLOCO 1: Atualizando tasksStore.ts..." -ForegroundColor Cyan

$storeFile = "src\stores\tasksStore.ts"

if (-not (Test-Path $storeFile)) {
    Write-Host "❌ Store não encontrado: $storeFile" -ForegroundColor Red
    exit 1
}

# Backup
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "$storeFile.backup_tijolos_$timestamp"
Copy-Item $storeFile $backupPath
Write-Host "💾 Backup: $backupPath" -ForegroundColor Yellow

# Ler conteúdo atual
$content = Get-Content $storeFile -Raw

# Verificar se as funções já existem
if ($content.Contains("editProjectTask:") -and $content.Contains("deleteProjectTask:") -and $content.Contains("createProjectWithTasks:")) {
    Write-Host "✅ Funções já existem no store!" -ForegroundColor Green
} else {
    # Adicionar as novas funções na interface
    $interfaceAddition = @'
  
  // Actions - Gerenciamento de Tijolos
  editProjectTask: (projectId: string, taskId: string, description: string, energyPoints: 1 | 3 | 5) => void;
  deleteProjectTask: (projectId: string, taskId: string) => void;
  createProjectWithTasks: (name: string, icon: string, notes: string, initialTasks: Array<{description: string, energyPoints: 1 | 3 | 5}>) => void;
'@

    # Adicionar antes de "// Utilities"
    $content = $content.Replace("  // Utilities", $interfaceAddition + "`n  // Utilities")

    # Adicionar implementações
    $implementationAddition = @'

      // Actions - Gerenciamento de Tijolos
      editProjectTask: (projectId, taskId, description, energyPoints) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? {
                  ...project,
                  backlog: project.backlog.map(task =>
                    task.id === taskId
                      ? { ...task, description, energyPoints, updatedAt: new Date().toISOString() }
                      : task
                  ),
                  updatedAt: new Date().toISOString()
                }
              : project
          )
        }));
      },
      
      deleteProjectTask: (projectId, taskId) => {
        set(state => ({
          projects: state.projects.map(project =>
            project.id === projectId
              ? {
                  ...project,
                  backlog: project.backlog.filter(task => task.id !== taskId),
                  updatedAt: new Date().toISOString()
                }
              : project
          )
        }));
      },
      
      createProjectWithTasks: (name, icon, notes, initialTasks) => {
        const state = get();
        
        const newProject: Project = {
          id: state.generateUniqueId(),
          userId: 'user1',
          name,
          icon,
          sandboxNotes: notes,
          status: 'active',
          backlog: initialTasks.map(task => ({
            id: state.generateUniqueId(),
            userId: 'user1',
            description: task.description,
            energyPoints: task.energyPoints,
            status: 'backlog' as const,
            postponedCount: 0,
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          })),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          projects: [...state.projects, newProject],
        }));
        
        return newProject.id;
      },
      
'@

    # Adicionar antes de "// Utilities" na implementação
    $content = $content.Replace("      // Utilities", $implementationAddition + "      // Utilities")

    # Salvar
    $content | Set-Content $storeFile -Encoding UTF8
    Write-Host "✅ tasksStore.ts atualizado!" -ForegroundColor Green
}

# ============================================================================
# BLOCO 2: Atualizando NewProjectModal.tsx
# ============================================================================

Write-Host ""
Write-Host "📝 BLOCO 2: Atualizando NewProjectModal.tsx..." -ForegroundColor Cyan

$modalFile = "src\components\shared\NewProjectModal.tsx"

if (-not (Test-Path $modalFile)) {
    Write-Host "❌ Modal não encontrado: $modalFile" -ForegroundColor Red
    exit 1
}

# Backup
$backupPath = "$modalFile.backup_tijolos_$timestamp"
Copy-Item $modalFile $backupPath
Write-Host "💾 Backup: $backupPath" -ForegroundColor Yellow

# Verificar se já tem a funcionalidade de tijolos
$modalContent = Get-Content $modalFile -Raw

if ($modalContent.Contains("initialTasks") -and $modalContent.Contains("createProjectWithTasks")) {
    Write-Host "✅ Modal já tem funcionalidade de tijolos!" -ForegroundColor Green
} else {
    # Novo conteúdo completo do modal
    $newModalContent = @'
'use client';

// ============================================================================
// NEW PROJECT MODAL - Modal para criação de novos projetos com tijolos iniciais
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, FolderPlus, Save, AlertCircle, Plus, Trash2, Battery, Brain, Zap } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';

interface NewProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface InitialTask {
  id: string;
  description: string;
  energyPoints: 1 | 3 | 5;
}

const PROJECT_ICONS = [
  '🏗️', '📁', '🎯', '🚀', '💡', '📊', '🔧', '🎨', 
  '📝', '💼', '🌟', '⚡', '🔥', '💎', '🏆', '🎪',
  '🌱', '🔬', '🎭', '🏠', '🎵', '📚', '🍕', '✈️'
];

export function NewProjectModal({ isOpen, onClose }: NewProjectModalProps) {
  const { createProjectWithTasks } = useTasksStore();
  
  const [formData, setFormData] = useState({
    name: '',
    icon: '🏗️',
    notes: ''
  });
  
  const [initialTasks, setInitialTasks] = useState<InitialTask[]>([]);
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskEnergy, setNewTaskEnergy] = useState<1 | 3 | 5>(3);
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isCreating, setIsCreating] = useState(false);

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Nome do projeto é obrigatório';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Nome deve ter pelo menos 3 caracteres';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Nome deve ter no máximo 50 caracteres';
    }
    
    if (!formData.icon) {
      newErrors.icon = 'Selecione um ícone para o projeto';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addInitialTask = () => {
    if (!newTaskDescription.trim()) return;
    
    const newTask: InitialTask = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      description: newTaskDescription.trim(),
      energyPoints: newTaskEnergy
    };
    
    setInitialTasks([...initialTasks, newTask]);
    setNewTaskDescription('');
    setNewTaskEnergy(3);
  };

  const removeInitialTask = (taskId: string) => {
    setInitialTasks(initialTasks.filter(task => task.id !== taskId));
  };

  const getEnergyIcon = (points: number) => {
    if (points === 1) return <Battery className="w-4 h-4 text-orange-500" />;
    if (points === 3) return <Brain className="w-4 h-4 text-blue-500" />;
    if (points === 5) return <Zap className="w-4 h-4 text-purple-500" />;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsCreating(true);
    
    try {
      // Simula delay de criação para UX
      await new Promise(resolve => setTimeout(resolve, 500));
      
      createProjectWithTasks(
        formData.name.trim(),
        formData.icon,
        formData.notes.trim(),
        initialTasks.map(task => ({
          description: task.description,
          energyPoints: task.energyPoints
        }))
      );
      
      // Reset form
      setFormData({
        name: '',
        icon: '🏗️',
        notes: ''
      });
      setInitialTasks([]);
      setErrors({});
      
      // Success feedback e fechamento
      onClose();
      
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
      setErrors({ general: 'Erro ao criar projeto. Tente novamente.' });
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    if (isCreating) return;
    
    setFormData({
      name: '',
      icon: '🏗️',
      notes: ''
    });
    setInitialTasks([]);
    setNewTaskDescription('');
    setNewTaskEnergy(3);
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />
        
        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 w-full max-w-2xl mx-4 overflow-hidden max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4 text-white sticky top-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FolderPlus className="w-6 h-6" />
                <h2 className="text-xl font-semibold">Novo Projeto</h2>
              </div>
              <button
                onClick={handleClose}
                disabled={isCreating}
                className="p-1 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-purple-100 text-sm mt-1">
              Organize suas grandes ideias em pequenos tijolos
            </p>
          </div>

          {/* Content */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span className="text-sm">{errors.general}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Coluna Esquerda - Dados do Projeto */}
              <div className="space-y-6">
                {/* Nome do Projeto */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nome do Projeto *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Aprender TypeScript..."
                    className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                    }`}
                    disabled={isCreating}
                    maxLength={50}
                  />
                  {errors.name && (
                    <p className="text-red-600 text-xs mt-1 flex items-center">
                      <AlertCircle className="w-3 h-3 mr-1" />
                      {errors.name}
                    </p>
                  )}
                  <p className="text-gray-500 text-xs mt-1">
                    {formData.name.length}/50 caracteres
                  </p>
                </div>

                {/* Ícone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ícone do Projeto *
                  </label>
                  <div className="grid grid-cols-6 gap-2 p-4 bg-gray-50 rounded-xl max-h-32 overflow-y-auto">
                    {PROJECT_ICONS.map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon })}
                        disabled={isCreating}
                        className={`w-8 h-8 flex items-center justify-center rounded-lg transition-all hover:scale-110 ${
                          formData.icon === icon
                            ? 'bg-purple-100 border-2 border-purple-500 scale-110'
                            : 'bg-white border border-gray-200 hover:border-purple-300'
                        }`}
                      >
                        <span className="text-lg">{icon}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Notas Iniciais */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas Iniciais (Opcional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Objetivos e ideias..."
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
                    disabled={isCreating}
                    maxLength={500}
                  />
                  <p className="text-gray-500 text-xs mt-1">
                    {formData.notes.length}/500 caracteres
                  </p>
                </div>
              </div>

              {/* Coluna Direita - Tijolos Iniciais */}
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🧱 Tijolos Iniciais (Opcional)
                  </label>
                  <p className="text-xs text-gray-500 mb-4">
                    Quebre seu projeto em pequenas tarefas desde o início
                  </p>

                  {/* Adicionar Novo Tijolo */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-4">
                    <div className="space-y-3">
                      <input
                        type="text"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                        placeholder="Descreva um pequeno passo..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                        disabled={isCreating}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addInitialTask())}
                      />
                      
                      <div className="flex items-center justify-between">
                        <div className="flex space-x-2">
                          {[1, 3, 5].map((energy) => (
                            <button
                              key={energy}
                              type="button"
                              onClick={() => setNewTaskEnergy(energy as 1 | 3 | 5)}
                              disabled={isCreating}
                              className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs transition-all ${
                                newTaskEnergy === energy
                                  ? 'bg-purple-100 border-2 border-purple-500 text-purple-700'
                                  : 'bg-white border border-gray-300 text-gray-600 hover:border-purple-300'
                              }`}
                            >
                              {getEnergyIcon(energy)}
                              <span>{energy}</span>
                            </button>
                          ))}
                        </div>
                        
                        <button
                          type="button"
                          onClick={addInitialTask}
                          disabled={isCreating || !newTaskDescription.trim()}
                          className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Adicionar</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Lista de Tijolos */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {initialTasks.map((task) => (
                      <div
                        key={task.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 group hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center space-x-2 flex-1 min-w-0">
                          {getEnergyIcon(task.energyPoints)}
                          <span className="text-sm text-gray-800 truncate">
                            {task.description}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeInitialTask(task.id)}
                          disabled={isCreating}
                          className="opacity-0 group-hover:opacity-100 p-1 text-red-500 hover:bg-red-50 rounded transition-all"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                    
                    {initialTasks.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        <div className="text-2xl mb-2">🧱</div>
                        <p className="text-xs">
                          Nenhum tijolo ainda.<br />
                          Adicione algumas tarefas pequenas!
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={handleClose}
                disabled={isCreating}
                className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating || !formData.name.trim()}
                className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
              >
                {isCreating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Criando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Criar Projeto</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
'@

    $newModalContent | Set-Content $modalFile -Encoding UTF8
    Write-Host "✅ NewProjectModal.tsx atualizado!" -ForegroundColor Green
}

# ============================================================================
# BLOCO 3: Atualizando ProjectContainer.tsx
# ============================================================================

Write-Host ""
Write-Host "📝 BLOCO 3: Atualizando ProjectContainer.tsx..." -ForegroundColor Cyan

$containerFile = "src\components\arquiteto\ProjectContainer.tsx"

if (-not (Test-Path $containerFile)) {
    Write-Host "❌ ProjectContainer não encontrado: $containerFile" -ForegroundColor Red
    exit 1
}

# Backup
$backupPath = "$containerFile.backup_tijolos_$timestamp"
Copy-Item $containerFile $backupPath
Write-Host "💾 Backup: $backupPath" -ForegroundColor Yellow

# Verificar se já tem funcionalidades de edição
$containerContent = Get-Content $containerFile -Raw

if ($containerContent.Contains("editProjectTask") -and $containerContent.Contains("deleteProjectTask")) {
    Write-Host "✅ ProjectContainer já tem funcionalidades de CRUD!" -ForegroundColor Green
} else {
    # Novo conteúdo completo do container
    $newContainerContent = @'
'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderOpen, FileText, Plus, ArrowRight, Battery, Brain, Zap, Edit3, Trash2, Save, X } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';
import type { Project } from '@/types';

interface ProjectContainerProps {
  project: Project;
}

interface EditingTask {
  taskId: string;
  description: string;
  energyPoints: 1 | 3 | 5;
}

export function ProjectContainer({ project }: ProjectContainerProps) {
  const {
    selectedProjectId,
    setSelectedProjectId,
    addTaskToProject,
    editProjectTask,
    deleteProjectTask,
    moveTaskToToday,
    updateProjectNotes,
  } = useTasksStore();

  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskEnergy, setNewTaskEnergy] = useState<1 | 3 | 5>(3);
  const [editingTask, setEditingTask] = useState<EditingTask | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const isExpanded = selectedProjectId === project.id;

  const getEnergyIcon = (points: number) => {
    if (points === 1) return <Battery className="w-4 h-4 text-orange-500" />;
    if (points === 3) return <Brain className="w-4 h-4 text-blue-500" />;
    if (points === 5) return <Zap className="w-4 h-4 text-purple-500" />;
  };

  const handleAddTask = () => {
    if (!newTaskDescription.trim()) return;
    
    addTaskToProject(project.id, newTaskDescription.trim(), newTaskEnergy);
    setNewTaskDescription('');
    setNewTaskEnergy(3);
    setShowAddForm(false);
  };

  const startEditing = (taskId: string, description: string, energyPoints: 1 | 3 | 5) => {
    setEditingTask({ taskId, description, energyPoints });
  };

  const saveEdit = () => {
    if (!editingTask || !editingTask.description.trim()) return;
    
    editProjectTask(project.id, editingTask.taskId, editingTask.description.trim(), editingTask.energyPoints);
    setEditingTask(null);
  };

  const cancelEdit = () => {
    setEditingTask(null);
  };

  const handleDelete = (taskId: string) => {
    if (confirm('Tem certeza que deseja excluir este tijolo?')) {
      deleteProjectTask(project.id, taskId);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">{project.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{project.name}</h3>
              {project.deadline && (
                <p className="text-sm text-gray-500">
                  📅 Prazo: {new Date(project.deadline).toLocaleDateString('pt-BR')}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => setSelectedProjectId(isExpanded ? null : project.id)}
            className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FolderOpen className="w-5 h-5" />
          </button>
        </div>

        <div className="bg-amber-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-amber-800 mb-2 flex items-center">
            <FileText className="w-4 h-4 mr-1" />
            Caixa de Areia do Projeto
          </h4>
          <textarea
            className="w-full h-20 text-sm text-gray-700 bg-transparent resize-none border-none focus:outline-none placeholder-amber-400"
            value={project.sandboxNotes}
            placeholder="Rabisque suas ideias livremente aqui..."
            onChange={(e) => updateProjectNotes(project.id, e.target.value)}
          />
        </div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="p-6 bg-gray-50"
          >
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-md font-medium text-gray-800 flex items-center">
                🧱 Backlog de Tijolos
                <span className="ml-2 text-sm bg-gray-200 text-gray-600 px-2 py-1 rounded-full">
                  {project.backlog.length}
                </span>
              </h4>
              
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-3 py-1 bg-purple-600 text-white rounded-lg text-sm hover:bg-purple-700 transition-colors flex items-center space-x-1"
              >
                <Plus className="w-3 h-3" />
                <span>Novo Tijolo</span>
              </button>
            </div>

            {/* Formulário de Adicionar Tijolo */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mb-4 p-4 bg-white rounded-lg border border-gray-200"
                >
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={newTaskDescription}
                      onChange={(e) => setNewTaskDescription(e.target.value)}
                      placeholder="Descreva um pequeno passo..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddTask()}
                      autoFocus
                    />
                    
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        {[1, 3, 5].map((energy) => (
                          <button
                            key={energy}
                            type="button"
                            onClick={() => setNewTaskEnergy(energy as 1 | 3 | 5)}
                            className={`flex items-center space-x-1 px-3 py-1 rounded-lg text-xs transition-all ${
                              newTaskEnergy === energy
                                ? 'bg-purple-100 border-2 border-purple-500 text-purple-700'
                                : 'bg-gray-100 border border-gray-300 text-gray-600 hover:border-purple-300'
                            }`}
                          >
                            {getEnergyIcon(energy)}
                            <span>{energy}</span>
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowAddForm(false)}
                          className="px-3 py-1 text-gray-600 hover:bg-gray-100 rounded-lg text-xs transition-colors"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleAddTask}
                          disabled={!newTaskDescription.trim()}
                          className="px-3 py-1 bg-purple-600 text-white rounded-lg text-xs hover:bg-purple-700 transition-colors disabled:opacity-50 flex items-center space-x-1"
                        >
                          <Save className="w-3 h-3" />
                          <span>Salvar</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lista de Tijolos */}
            <div className="space-y-2">
              {project.backlog.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 group hover:shadow-sm transition-all"
                >
                  {editingTask?.taskId === task.id ? (
                    // Modo de Edição
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={editingTask.description}
                        onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === 'Enter' && saveEdit()}
                        autoFocus
                      />
                      
                      <div className="flex space-x-1">
                        {[1, 3, 5].map((energy) => (
                          <button
                            key={energy}
                            onClick={() => setEditingTask({ ...editingTask, energyPoints: energy as 1 | 3 | 5 })}
                            className={`p-1 rounded transition-all ${
                              editingTask.energyPoints === energy
                                ? 'bg-purple-100 border border-purple-500'
                                : 'bg-gray-100 border border-gray-300 hover:border-purple-300'
                            }`}
                          >
                            {getEnergyIcon(energy)}
                          </button>
                        ))}
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={saveEdit}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-all"
                          title="Salvar"
                        >
                          <Save className="w-3 h-3" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1 text-gray-500 hover:bg-gray-50 rounded transition-all"
                          title="Cancelar"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    // Modo de Visualização
                    <>
                      <div className="flex items-center flex-1 min-w-0">
                        {getEnergyIcon(task.energyPoints)}
                        <span className="ml-3 text-sm text-gray-800 truncate">
                          {task.description}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => startEditing(task.id, task.description, task.energyPoints)}
                          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-all"
                          title="Editar tijolo"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-all"
                          title="Excluir tijolo"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                        
                        <button
                          onClick={() => moveTaskToToday(project.id, task.id)}
                          className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-medium hover:bg-blue-200 transition-colors flex items-center space-x-1"
                          title="Mover para hoje"
                        >
                          <span>🧱</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}

              {project.backlog.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="text-sm">
                    Nenhum tijolo no backlog ainda! <br />
                    Clique em "Novo Tijolo" para adicionar tarefas.
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
'@

    $newContainerContent | Set-Content $containerFile -Encoding UTF8
    Write-Host "✅ ProjectContainer.tsx atualizado!" -ForegroundColor Green
}

# ============================================================================
# RELATÓRIO FINAL
# ============================================================================

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "🎉 IMPLEMENTAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 FUNCIONALIDADES IMPLEMENTADAS:" -ForegroundColor Cyan
Write-Host "  ✅ Modal de criação com tijolos iniciais" -ForegroundColor White
Write-Host "  ✅ Adicionar tijolos no projeto expandido" -ForegroundColor White
Write-Host "  ✅ Editar tijolos existentes (clique no lápis)" -ForegroundColor White
Write-Host "  ✅ Excluir tijolos (clique na lixeira)" -ForegroundColor White
Write-Host "  ✅ Interface melhorada para gerenciamento" -ForegroundColor White
Write-Host ""

Write-Host "🧪 COMO TESTAR:" -ForegroundColor Cyan
Write-Host "  1. Criar novo projeto com tijolos iniciais" -ForegroundColor White
Write-Host "  2. Expandir projeto existente (clique na pasta)" -ForegroundColor White
Write-Host "  3. Adicionar novos tijolos (botão 'Novo Tijolo')" -ForegroundColor White
Write-Host "  4. Editar tijolos (hover + clique no lápis)" -ForegroundColor White
Write-Host "  5. Excluir tijolos (hover + clique na lixeira)" -ForegroundColor White
Write-Host ""

Write-Host "💾 BACKUPS CRIADOS:" -ForegroundColor Cyan
Write-Host "  📁 tasksStore.ts.backup_tijolos_$timestamp" -ForegroundColor White
Write-Host "  📁 NewProjectModal.tsx.backup_tijolos_$timestamp" -ForegroundColor White
Write-Host "  📁 ProjectContainer.tsx.backup_tijolos_$timestamp" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Todas as funcionalidades de gerenciamento de tijolos foram implementadas!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green