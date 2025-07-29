# ============================================================================
# IMPLEMENTAÇÃO: Sistema de Edição de Tarefas
# DESCRIÇÃO: Adiciona funcionalidade para editar tarefas em todas as páginas
# ============================================================================

param(
    [string]$ProjectRoot = "."
)

Write-Host "=== IMPLEMENTAÇÃO: SISTEMA DE EDIÇÃO DE TAREFAS ===" -ForegroundColor Green
Write-Host "📋 Adicionando funcionalidade de edição de tarefas em todas as páginas" -ForegroundColor Cyan

# ============================================================================
# BLOCO 1: Backup e Preparação
# ============================================================================

Write-Host "`n🔄 Criando backups dos arquivos que serão modificados..." -ForegroundColor Yellow

$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupDir = "backups_edit_$timestamp"
New-Item -ItemType Directory -Path $backupDir -Force | Out-Null

$filesToBackup = @(
    "src/types/index.ts",
    "src/stores/tasksStore.ts",
    "src/components/bombeiro/TaskItem.tsx",
    "src/components/bombeiro/BombeiroPage.tsx"
)

foreach ($file in $filesToBackup) {
    $fullPath = Join-Path $ProjectRoot $file
    if (Test-Path $fullPath) {
        $backupPath = Join-Path $backupDir $file.Replace("/", "_").Replace("\", "_")
        Copy-Item $fullPath $backupPath
        Write-Host "✅ Backup criado: $backupPath" -ForegroundColor Green
    }
}

# ============================================================================
# BLOCO 2: Adicionando Tipos para Edição de Tarefas
# ============================================================================

Write-Host "`n🔧 Adicionando tipos para edição de tarefas..." -ForegroundColor Yellow

$typesPath = Join-Path $ProjectRoot "src/types/index.ts"
$currentTypes = Get-Content $typesPath -Raw

$newTypesContent = @'
// ============================================================================
// TYPES - Definições de tipos para o Sistema Cérebro-Compatível
// ============================================================================

export interface User {
  id: string;
  name: string;
  email: string;
  avatar_url?: string;
  settings: UserSettings;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  dailyEnergyBudget: number;
  theme: 'light' | 'dark' | 'bege';
  timezone: string;
  notifications: boolean;
}

// ============================================================================
// THEME SYSTEM TYPES - Sistema completo de personalização de temas
// ============================================================================

export interface ThemeConfig {
  id: string;
  name: string;
  description?: string;
  primaryColor: string;
  secondaryColor: string;
  surfaceColor: string;
  backgroundColor: string;
  textColor: string;
  textSecondaryColor: string;
  borderColor: string;
  shadowColor: string;
  mode: 'light' | 'dark' | 'auto';
  borderRadius: 'none' | 'small' | 'medium' | 'large';
  iconSize: 'small' | 'medium' | 'large';
  spacing: 'compact' | 'normal' | 'comfortable';
  fontFamily: 'system' | 'inter' | 'lora';
  fontSize: 'small' | 'medium' | 'large';
  animations: boolean;
  glassmorphism: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  preview: string;
  config: ThemeConfig;
  category: 'default' | 'custom' | 'community';
}

export interface ColorPalette {
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    surface: string;
    text: string;
  };
}

export interface ThemeStore {
  currentTheme: ThemeConfig;
  presets: ThemePreset[];
  colorPalettes: ColorPalette[];
  customThemes: ThemeConfig[];
  // Actions
  updateTheme: (updates: Partial<ThemeConfig>) => void;
  applyPreset: (presetId: string) => void;
  resetToDefault: () => void;
  exportTheme: () => string;
  importTheme: (themeJson: string) => boolean;
  saveAsPreset: (name: string, description: string) => void;
  deleteCustomTheme: (themeId: string) => void;
  // Color actions
  updatePrimaryColor: (color: string) => void;
  updateSecondaryColor: (color: string) => void;
  // Layout actions
  updateBorderRadius: (radius: ThemeConfig['borderRadius']) => void;
  updateIconSize: (size: ThemeConfig['iconSize']) => void;
  updateSpacing: (spacing: ThemeConfig['spacing']) => void;
  // Typography actions
  updateFontFamily: (family: ThemeConfig['fontFamily']) => void;
  updateFontSize: (size: ThemeConfig['fontSize']) => void;
  // Effects actions
  toggleAnimations: () => void;
  toggleGlassmorphism: () => void;
  // Utilities
  generateThemeId: () => string;
  applyThemeToDocument: (theme: ThemeConfig) => void;
}

// ============================================================================
// EXISTING TYPES - Mantendo compatibilidade
// ============================================================================

export interface Project {
  id: string;
  userId: string;
  name: string;
  icon: string;
  sandboxNotes: string;
  deadline?: string;
  status: 'active' | 'archived' | 'completed';
  backlog: Task[];
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  userId: string;
  projectId?: string;
  description: string;
  energyPoints: EnergyLevel;
  status: TaskStatus;
  scheduledDate?: string;
  dueDate?: string;
  postponedCount: number;
  delegatedTo?: string;
  followUpDate?: string;
  completedAt?: string;
  comments?: TaskComment[];
  project?: {
    name: string;
    icon: string;
  };
  createdAt: string;
  updatedAt: string;
}

// ============================================================================
// NOVOS TYPES - Sistema de Edição e Comentários
// ============================================================================

export interface TaskComment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface TaskEditRequest {
  taskId: string;
  description?: string;
  energyPoints?: EnergyLevel;
  projectId?: string;
  comment?: string;
}

export interface TaskEditModalState {
  isOpen: boolean;
  task: Task | null;
  editData: {
    description: string;
    energyPoints: EnergyLevel;
    projectId?: string;
    comment: string;
  };
}

export interface Note {
  id: string;
  userId: string;
  content: string;
  status: 'active' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface WeeklyTree {
  id: string;
  userId: string;
  weekStartDate: string;
  projectId?: string;
  projectName: string;
  icon: string;
  leafCount: number;
  harvested: boolean;
  isGeneral: boolean;
  createdAt: string;
}

export type EnergyLevel = 1 | 3 | 5; // 🔋 🧠 ⚡

export type TaskStatus = 
  | 'backlog'    // No backlog do projeto
  | 'today'      // Agendada para hoje
  | 'pending'    // Em andamento
  | 'done'       // Concluída
  | 'postponed'; // Na Sala de Repanejamento

export type CaptureStep = 
  | 'capture'    // Capturando pensamento
  | 'triage'     // Decidindo destino
  | 'classify'   // Classificando tipo
  | 'schedule';  // Agendando quando

export type ProtocolType =
  | 'low-energy'     // Protocolo de Baixa Energia
  | 'decomposition'  // Protocolo de Decomposição
  | 'emergency'      // Protocolo de Incêndio
  | 'sentinel';      // Protocolo Sentinela

export interface EnergyBudget {
  used: number;
  total: number;
  remaining: number;
  percentage: number;
  isOverBudget: boolean;
  isComplete: boolean;
}

export interface PostponedTask extends Task {
  postponeReason?: string;
  postponedAt: string;
}

export interface DecompositionRequest {
  originalTask: Task;
  firstBrick: string;
  projectName?: string;
}

export interface CaptureState {
  step: CaptureStep;
  content: string;
  type: 'task' | 'project' | '';
  selectedDate: string;
}

export interface TransformNoteRequest {
  note: Note;
  targetType: 'task' | 'project';
  energyPoints?: EnergyLevel;
  scheduleDate?: string;
}

// Interfaces para componentes
export interface TreeProps {
  tree: WeeklyTree;
  animated?: boolean;
}

export interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onPostpone: (taskId: string) => void;
  onEdit?: (taskId: string) => void;
  showProject?: boolean;
}

export interface ProjectContainerProps {
  project: Project;
  isExpanded: boolean;
  onToggle: () => void;
  onAddTask: (projectId: string, description: string, energyPoints: EnergyLevel) => void;
  onMoveTask: (projectId: string, taskId: string) => void;
}

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
}

// Utilities
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
'@

$newTypesContent | Set-Content $typesPath -Encoding UTF8
Write-Host "✅ Tipos atualizados com suporte à edição de tarefas" -ForegroundColor Green

# ============================================================================
# BLOCO 3: Criando Modal de Edição de Tarefas
# ============================================================================

Write-Host "`n🎨 Criando modal de edição de tarefas..." -ForegroundColor Yellow

$editModalPath = Join-Path $ProjectRoot "src/components/shared/TaskEditModal.tsx"
$editModalContent = @'
'use client';

// ============================================================================
// TASK EDIT MODAL - Modal para edição de tarefas
// ============================================================================

import React from 'react';
import { motion } from 'framer-motion';
import { Edit3, Battery, Brain, Zap, MessageSquare, Save, X } from 'lucide-react';
import { Modal } from './Modal';
import { Button } from './Button';
import { useTasksStore } from '@/stores/tasksStore';
import type { EnergyLevel } from '@/types';

export function TaskEditModal() {
  const {
    taskEditModal,
    setTaskEditModal,
    updateTaskEditData,
    saveTaskEdit,
    projects,
  } = useTasksStore();

  const { isOpen, task, editData } = taskEditModal;

  const handleClose = () => {
    setTaskEditModal({
      isOpen: false,
      task: null,
      editData: {
        description: '',
        energyPoints: 3,
        projectId: undefined,
        comment: '',
      },
    });
  };

  const handleSave = () => {
    if (!task) return;
    
    saveTaskEdit({
      taskId: task.id,
      description: editData.description,
      energyPoints: editData.energyPoints,
      projectId: editData.projectId,
      comment: editData.comment,
    });
    
    handleClose();
  };

  const energyOptions = [
    { value: 1, label: 'Bateria Fraca', icon: Battery, color: 'orange' },
    { value: 3, label: 'Cérebro Normal', icon: Brain, color: 'blue' },
    { value: 5, label: 'Cérebro Ligado', icon: Zap, color: 'purple' },
  ];

  if (!isOpen || !task) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Editar Tarefa"
      maxWidth="lg"
    >
      <div className="space-y-6">
        {/* Descrição */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Descrição da Tarefa
          </label>
          <textarea
            value={editData.description}
            onChange={(e) => updateTaskEditData({ description: e.target.value })}
            placeholder="Descreva sua tarefa..."
            className="w-full h-20 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Nível de Energia */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Nível de Energia
          </label>
          <div className="grid grid-cols-3 gap-3">
            {energyOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = editData.energyPoints === option.value;
              
              return (
                <motion.button
                  key={option.value}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => updateTaskEditData({ energyPoints: option.value as EnergyLevel })}
                  className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                    isSelected
                      ? `border-${option.color}-500 bg-${option.color}-50`
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Icon className={`w-6 h-6 mx-auto mb-2 ${
                    isSelected ? `text-${option.color}-600` : 'text-gray-400'
                  }`} />
                  <div className={`text-xs font-medium ${
                    isSelected ? `text-${option.color}-700` : 'text-gray-600'
                  }`}>
                    {option.label}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Projeto */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Projeto (Opcional)
          </label>
          <select
            value={editData.projectId || ''}
            onChange={(e) => updateTaskEditData({ projectId: e.target.value || undefined })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Nenhum projeto</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.icon} {project.name}
              </option>
            ))}
          </select>
        </div>

        {/* Comentário */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Comentário
          </label>
          <textarea
            value={editData.comment}
            onChange={(e) => updateTaskEditData({ comment: e.target.value })}
            placeholder="Adicione um comentário sobre esta tarefa..."
            className="w-full h-24 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        {/* Histórico de Comentários */}
        {task.comments && task.comments.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Histórico de Comentários
            </label>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {task.comments.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <Button
            variant="secondary"
            onClick={handleClose}
            className="flex items-center space-x-2"
          >
            <X className="w-4 h-4" />
            <span>Cancelar</span>
          </Button>
          <Button
            onClick={handleSave}
            disabled={!editData.description.trim()}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Salvar</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
'@

$editModalContent | Set-Content $editModalPath -Encoding UTF8
Write-Host "✅ Modal de edição criado" -ForegroundColor Green

# ============================================================================
# BLOCO 4: Atualizando Store com Funcionalidades de Edição
# ============================================================================

Write-Host "`n🗄️ Atualizando store com funcionalidades de edição..." -ForegroundColor Yellow

$storePath = Join-Path $ProjectRoot "src/stores/tasksStore.ts"

# Vou reescrever o arquivo inteiro para adicionar as funcionalidades de edição
$newStoreContent = @'
// ============================================================================
// TASKS STORE - Gerenciamento completo de tarefas com Zustand
// ESTADO LIMPO: Todos os dados de exemplo foram removidos
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Task, 
  Project, 
  Note, 
  WeeklyTree, 
  EnergyBudget, 
  PostponedTask,
  CaptureState,
  DecompositionRequest,
  TransformNoteRequest,
  TaskEditRequest,
  TaskEditModalState,
  TaskComment
} from '@/types';

interface TasksState {
  // Estados principais
  todayTasks: Task[];
  projects: Project[];
  notes: Note[];
  weeklyTrees: WeeklyTree[];
  postponedTasks: PostponedTask[];
  
  // Estados de UI
  currentPage: 'bombeiro' | 'arquiteto' | 'caixa-de-areia' | 'floresta';
  selectedProjectId: string | null;
  editingNote: string | null;
  
  // Estados de Modal
  showCaptureModal: boolean;
  showLowEnergyModal: boolean;
  showDecompositionModal: Task | null;
  showTransformModal: Note | null;
  taskEditModal: TaskEditModalState;
  
  // Estados de Captura
  captureState: CaptureState;
  
  // Estados de formulário
  newNoteContent: string;
  addingTaskToProject: string | null;
  newTaskDescription: string;
  newTaskEnergy: 1 | 3 | 5;
  
  // Configurações
  energyBudget: {
    total: number;
  };
  
  // Actions - Navegação
  setCurrentPage: (page: 'bombeiro' | 'arquiteto' | 'caixa-de-areia' | 'floresta') => void;
  setSelectedProjectId: (id: string | null) => void;
  
  // Actions - Tarefas
  addTaskToToday: (description: string, energyPoints: 1 | 3 | 5, projectId?: string) => boolean;
  completeTask: (taskId: string) => void;
  postponeTask: (taskId: string, reason?: string) => void;
  moveTaskToToday: (projectId: string, taskId: string) => void;
  
  // Actions - Edição de Tarefas
  openTaskEditModal: (task: Task) => void;
  setTaskEditModal: (state: TaskEditModalState) => void;
  updateTaskEditData: (updates: Partial<TaskEditModalState['editData']>) => void;
  saveTaskEdit: (request: TaskEditRequest) => void;
  
  // Actions - Projetos
  addTaskToProject: (projectId: string, description: string, energyPoints: 1 | 3 | 5) => void;
  updateProjectNotes: (projectId: string, notes: string) => void;
  createProject: (name: string, icon: string, notes: string) => void;
  
  // Actions - Notas
  saveNote: (content: string) => void;
  updateNote: (noteId: string, content: string) => void;
  archiveNote: (noteId: string) => void;
  deleteNote: (noteId: string) => void;
  transformNoteToAction: (request: TransformNoteRequest) => void;
  
  // Actions - Modais
  setShowCaptureModal: (show: boolean) => void;
  setShowLowEnergyModal: (show: boolean) => void;
  setShowDecompositionModal: (task: Task | null) => void;
  setShowTransformModal: (note: Note | null) => void;
  
  // Actions - Captura
  updateCaptureState: (updates: Partial<CaptureState>) => void;
  resetCaptureState: () => void;
  handleCaptureSubmit: () => void;
  handleTriageChoice: (choice: 'sandbox' | 'task') => void;
  handleClassifyChoice: (type: 'task' | 'project') => void;
  handleScheduleChoice: (when: 'today' | 'future', date?: string) => void;
  
  // Actions - Protocolos
  handleDecomposition: (request: DecompositionRequest) => void;
  
  // Actions - Energia
  canAddTask: (energyPoints: number) => boolean;
  getRemainingEnergy: () => number;
  calculateEnergyBudget: () => EnergyBudget;
  
  // Actions - Árvores
  growLeaf: (projectName?: string) => void;
  
  // Utilities
  generateUniqueId: () => string;
}

const initialCaptureState: CaptureState = {
  step: 'capture',
  content: '',
  type: '',
  selectedDate: '',
};

const initialTaskEditModal: TaskEditModalState = {
  isOpen: false,
  task: null,
  editData: {
    description: '',
    energyPoints: 3,
    projectId: undefined,
    comment: '',
  },
};

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      // Estados iniciais - ZERADOS
      todayTasks: [],
      projects: [],
      notes: [],
      weeklyTrees: [],
      postponedTasks: [],
      
      // Estados de UI
      currentPage: 'bombeiro',
      selectedProjectId: null,
      editingNote: null,
      
      // Estados de Modal
      showCaptureModal: false,
      showLowEnergyModal: false,
      showDecompositionModal: null,
      showTransformModal: null,
      taskEditModal: initialTaskEditModal,
      
      // Estados de Captura
      captureState: initialCaptureState,
      
      // Estados de formulário
      newNoteContent: '',
      addingTaskToProject: null,
      newTaskDescription: '',
      newTaskEnergy: 3,
      
      // Orçamento de energia
      energyBudget: {
        total: 12,
      },
      
      // Actions - Navegação
      setCurrentPage: (page) => set({ currentPage: page }),
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
      
      // Actions - Tarefas
      addTaskToToday: (description, energyPoints, projectId) => {
        const state = get();
        const canAdd = state.canAddTask(energyPoints);
        
        if (!canAdd) {
          return false;
        }
        
        const project = projectId ? state.projects.find(p => p.id === projectId) : null;
        const newTask: Task = {
          id: state.generateUniqueId(),
          userId: 'user1',
          projectId,
          description,
          energyPoints,
          status: "pending",
          postponedCount: 0,
          comments: [],
          project: project ? { name: project.name, icon: project.icon } : undefined,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          todayTasks: [...state.todayTasks, newTask]
        }));
        
        return true;
      },
      
      // CORREÇÃO: Energia se mantém ao finalizar tarefa
      completeTask: (taskId) => {
        const state = get();
        const task = state.todayTasks.find(t => t.id === taskId);
        
        set(state => ({
          todayTasks: state.todayTasks.map(t => 
            t.id === taskId 
              ? { ...t, status: 'done', completedAt: new Date().toISOString() }
              : t
          )
        }));
        
        // Crescer folha na árvore
        if (task) {
          state.growLeaf(task.project?.name);
        }
      },
      
      // CORREÇÃO: Energia é removida apenas ao postergar
      postponeTask: (taskId, reason = 'manual') => {
        const state = get();
        const task = state.todayTasks.find(t => t.id === taskId);
        
        if (!task) return;
        
        const newPostponedCount = task.postponedCount + 1;
        
        if (newPostponedCount > 3) {
          state.setShowDecompositionModal({ ...task, postponedCount: newPostponedCount });
          return;
        }
        
        const postponedTask: PostponedTask = {
          ...task,
          status: 'postponed',
          postponedCount: newPostponedCount,
          postponeReason: reason,
          postponedAt: new Date().toISOString(),
        };
        
        set(state => ({
          todayTasks: state.todayTasks.filter(t => t.id !== taskId),
          postponedTasks: [...state.postponedTasks, postponedTask]
        }));
        
        if (newPostponedCount === 3) {
          setTimeout(() => state.setShowDecompositionModal(postponedTask), 500);
        }
      },
      
      moveTaskToToday: (projectId, taskId) => {
        const state = get();
        const project = state.projects.find(p => p.id === projectId);
        const task = project?.backlog.find(t => t.id === taskId);
        
        if (!project || !task) return;
        
        const canAdd = state.canAddTask(task.energyPoints);
        if (!canAdd) {
          return;
        }
        
        const newTask: Task = {
          ...task,
          id: state.generateUniqueId(),
          status: "pending",
          comments: task.comments || [],
          project: { name: project.name, icon: project.icon },
          projectId: project.id,
        };
        
        set(state => ({
          todayTasks: [...state.todayTasks, newTask],
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, backlog: p.backlog.filter(t => t.id !== taskId) }
              : p
          )
        }));
      },
      
      // Actions - Edição de Tarefas
      openTaskEditModal: (task) => {
        const project = task.projectId ? get().projects.find(p => p.id === task.projectId) : null;
        
        set({
          taskEditModal: {
            isOpen: true,
            task,
            editData: {
              description: task.description,
              energyPoints: task.energyPoints,
              projectId: task.projectId,
              comment: '',
            },
          },
        });
      },
      
      setTaskEditModal: (state) => {
        set({ taskEditModal: state });
      },
      
      updateTaskEditData: (updates) => {
        set(state => ({
          taskEditModal: {
            ...state.taskEditModal,
            editData: {
              ...state.taskEditModal.editData,
              ...updates,
            },
          },
        }));
      },
      
      saveTaskEdit: (request) => {
        const state = get();
        const { taskId, description, energyPoints, projectId, comment } = request;
        
        // Atualizar tarefa
        const updateTask = (task: Task) => {
          if (task.id !== taskId) return task;
          
          const project = projectId ? state.projects.find(p => p.id === projectId) : null;
          const newComments = comment?.trim() 
            ? [...(task.comments || []), {
                id: state.generateUniqueId(),
                content: comment,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }]
            : task.comments || [];
          
          return {
            ...task,
            description: description || task.description,
            energyPoints: energyPoints || task.energyPoints,
            projectId: projectId,
            project: project ? { name: project.name, icon: project.icon } : undefined,
            comments: newComments,
            updatedAt: new Date().toISOString(),
          };
        };
        
        set(state => ({
          todayTasks: state.todayTasks.map(updateTask),
          postponedTasks: state.postponedTasks.map(updateTask),
          projects: state.projects.map(project => ({
            ...project,
            backlog: project.backlog.map(updateTask),
          })),
        }));
      },
      
      // Actions - Projetos
      addTaskToProject: (projectId, description, energyPoints) => {
        const state = get();
        
        const newTask: Task = {
          id: state.generateUniqueId(),
          userId: 'user1',
          projectId,
          description,
          energyPoints,
          status: 'backlog',
          postponedCount: 0,
          comments: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, backlog: [...p.backlog, newTask] }
              : p
          ),
          newTaskDescription: '',
          newTaskEnergy: 3,
          addingTaskToProject: null,
        }));
      },
      
      updateProjectNotes: (projectId, notes) => {
        set(state => ({
          projects: state.projects.map(p =>
            p.id === projectId
              ? { ...p, sandboxNotes: notes, updatedAt: new Date().toISOString() }
              : p
          )
        }));
      },
      
      createProject: (name, icon, notes) => {
        const state = get();
        
        const newProject: Project = {
          id: state.generateUniqueId(),
          userId: 'user1',
          name,
          icon,
          sandboxNotes: notes,
          status: 'active',
          backlog: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          projects: [...state.projects, newProject],
        }));
        
        return newProject.id;
      },
      
      // Actions - Notas
      saveNote: (content) => {
        const state = get();
        
        const newNote: Note = {
          id: state.generateUniqueId(),
          userId: 'user1',
          content,
          status: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          notes: [newNote, ...state.notes],
          newNoteContent: '',
        }));
      },
      
      updateNote: (noteId, content) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === noteId 
              ? { ...note, content, updatedAt: new Date().toISOString() }
              : note
          ),
          editingNote: null,
        }));
      },
      
      archiveNote: (noteId) => {
        set(state => ({
          notes: state.notes.map(note =>
            note.id === noteId 
              ? { ...note, status: 'archived', updatedAt: new Date().toISOString() }
              : note
          )
        }));
      },
      
      deleteNote: (noteId) => {
        set(state => ({
          notes: state.notes.filter(note => note.id !== noteId)
        }));
      },
      
      transformNoteToAction: (request) => {
        const state = get();
        const { note, targetType, energyPoints = 3, scheduleDate } = request;
        
        if (targetType === 'project') {
          const projectId = state.createProject(
            note.content.slice(0, 50) + (note.content.length > 50 ? '...' : ''),
            '🗂️',
            note.content
          );
          state.archiveNote(note.id);
          state.setCurrentPage('arquiteto');
        } else if (scheduleDate) {
          // Agendar para o futuro
          state.archiveNote(note.id);
        } else {
          // Adicionar para hoje
          const success = state.addTaskToToday(
            note.content.slice(0, 100) + (note.content.length > 100 ? '...' : ''),
            energyPoints
          );
          
          if (success) {
            state.archiveNote(note.id);
          }
        }
      },
      
      // Actions - Modais
      setShowCaptureModal: (show) => set({ showCaptureModal: show }),
      setShowLowEnergyModal: (show) => set({ showLowEnergyModal: show }),
      setShowDecompositionModal: (task) => set({ showDecompositionModal: task }),
      setShowTransformModal: (note) => set({ showTransformModal: note }),
      
      // Actions - Captura
      updateCaptureState: (updates) => {
        set(state => ({
          captureState: { ...state.captureState, ...updates }
        }));
      },
      
      resetCaptureState: () => {
        set({
          showCaptureModal: false,
          captureState: initialCaptureState,
        });
      },
      
      handleCaptureSubmit: () => {
        const state = get();
        if (!state.captureState.content.trim()) return;
        
        if (state.captureState.step === 'capture') {
          state.updateCaptureState({ step: 'triage' });
        }
      },
      
      handleTriageChoice: (choice) => {
        const state = get();
        
        if (choice === 'sandbox') {
          state.saveNote(state.captureState.content);
          state.resetCaptureState();
          state.setCurrentPage('caixa-de-areia');
        } else if (choice === 'task') {
          state.updateCaptureState({ step: 'classify' });
        }
      },
      
      handleClassifyChoice: (type) => {
        const state = get();
        
        if (type === 'project') {
          state.createProject(
            state.captureState.content.slice(0, 50) + (state.captureState.content.length > 50 ? '...' : ''),
            '🗂️',
            state.captureState.content
          );
          state.resetCaptureState();
          state.setCurrentPage('arquiteto');
        } else if (type === 'task') {
          state.updateCaptureState({ step: 'schedule', type });
        }
      },
      
      handleScheduleChoice: (when, date) => {
        const state = get();
        
        if (when === 'today') {
          const success = state.addTaskToToday(state.captureState.content, 3);
          if (success) state.resetCaptureState();
        } else if (when === 'future' && date) {
          // Simula agendamento
          state.resetCaptureState();
        }
      },
      
      // Actions - Protocolos
      handleDecomposition: (request) => {
        const state = get();
        const { originalTask, firstBrick, projectName } = request;
        
        if (!firstBrick.trim()) return;
        
        // Criar projeto
        const newProject: Project = {
          id: state.generateUniqueId(),
          userId: 'user1',
          name: projectName || originalTask.description,
          icon: '🔧',
          sandboxNotes: `Projeto criado automaticamente após ${originalTask.postponedCount} adiamentos da tarefa original.`,
          status: 'active',
          backlog: [
            {
              id: state.generateUniqueId(),
              userId: 'user1',
              description: firstBrick.trim(),
              energyPoints: 1,
              status: 'backlog',
              postponedCount: 0,
              comments: [],
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        
        set(state => ({
          projects: [...state.projects, newProject],
          postponedTasks: state.postponedTasks.filter(t => t.id !== originalTask.id),
          showDecompositionModal: null,
        }));
      },
      
      // Actions - Energia
      canAddTask: (energyPoints) => {
        const state = get();
        const currentBudget = state.calculateEnergyBudget();
        return (currentBudget.used + energyPoints) <= currentBudget.total;
      },
      
      getRemainingEnergy: () => {
        const state = get();
        const currentBudget = state.calculateEnergyBudget();
        return currentBudget.remaining;
      },
      
      // CORREÇÃO: Inclui tarefas completadas no cálculo
      calculateEnergyBudget: () => {
        const state = get();
        const used = state.todayTasks
          .filter(task => task.status === 'pending' || task.status === 'done')
          .reduce((sum, task) => sum + task.energyPoints, 0);
        
        return {
          used,
          total: state.energyBudget.total,
          remaining: state.energyBudget.total - used,
          percentage: Math.min((used / state.energyBudget.total) * 100, 100),
          isOverBudget: used > state.energyBudget.total,
          isComplete: used === state.energyBudget.total,
        };
      },
      
      // Actions - Árvores
      growLeaf: (projectName) => {
        set(state => ({
          weeklyTrees: state.weeklyTrees.map(tree => {
            if (projectName && tree.projectName === projectName) {
              return { ...tree, leafCount: tree.leafCount + 1 };
            } else if (!projectName && tree.isGeneral) {
              return { ...tree, leafCount: tree.leafCount + 1 };
            }
            return tree;
          })
        }));
      },
      
      // Utilities
      generateUniqueId: () => Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }),
    {
      name: 'cerebro-compativel-tasks',
      version: 3,
    }
  )
);
'@

$newStoreContent | Set-Content $storePath -Encoding UTF8
Write-Host "✅ Store atualizada com funcionalidades de edição" -ForegroundColor Green

# ============================================================================
# BLOCO 5: Atualizando TaskItem para incluir edição
# ============================================================================

Write-Host "`n🎯 Atualizando TaskItem para incluir funcionalidade de edição..." -ForegroundColor Yellow

$taskItemPath = Join-Path $ProjectRoot "src/components/bombeiro/TaskItem.tsx"
$newTaskItemContent = @'
'use client';

// ============================================================================
// TASK ITEM - Item individual de tarefa com anexos e edição
// ============================================================================

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle2, 
  Battery, 
  Brain, 
  Zap, 
  Paperclip, 
  ChevronDown, 
  ChevronUp,
  Edit3,
  MessageSquare 
} from 'lucide-react';
import { FileUpload, useFileUpload } from '@/components/shared/FileUpload';
import { useTasksStore } from '@/stores/tasksStore';
import type { Task, Attachment } from '@/types';

interface TaskItemProps {
  task: Task;
  onComplete: (taskId: string) => void;
  onPostpone: (taskId: string) => void;
  onUpdateAttachments?: (taskId: string, attachments: Attachment[]) => void;
  showProject?: boolean;
}

export function TaskItem({ 
  task, 
  onComplete, 
  onPostpone, 
  onUpdateAttachments, 
  showProject = true 
}: TaskItemProps) {
  const [showAttachments, setShowAttachments] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const { uploadFiles } = useFileUpload();
  const { openTaskEditModal } = useTasksStore();

  const getEnergyIcon = (points: number) => {
    if (points === 1) return <Battery className="w-4 h-4 text-orange-500" />;
    if (points === 3) return <Brain className="w-4 h-4 text-blue-500" />;
    if (points === 5) return <Zap className="w-4 h-4 text-purple-500" />;
  };

  const handleUpload = async (files: File[]) => {
    if (!onUpdateAttachments) return [];
    
    const newAttachments = await uploadFiles(files);
    const updatedAttachments = [...(task.attachments || []), ...newAttachments];
    onUpdateAttachments(task.id, updatedAttachments);
    return newAttachments;
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    if (!onUpdateAttachments) return;
    
    const updatedAttachments = (task.attachments || []).filter(att => att.id !== attachmentId);
    onUpdateAttachments(task.id, updatedAttachments);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openTaskEditModal(task);
  };

  const handleTaskClick = () => {
    if (task.status !== 'done') {
      openTaskEditModal(task);
    }
  };

  const hasAttachments = task.attachments && task.attachments.length > 0;
  const hasComments = task.comments && task.comments.length > 0;

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02, y: -2 }}
      onClick={handleTaskClick}
      className={`bg-white/70 backdrop-blur-xl rounded-2xl p-5 border-l-4 shadow-lg border cursor-pointer ${
        task.status === 'done' 
          ? 'border-l-green-400 bg-green-50/50 border-green-100' 
          : 'border-l-gray-200 hover:border-l-blue-400 border-white/20 hover:shadow-xl'
      } transition-all duration-300`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center mb-3">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 ${
              task.energyPoints === 1 ? 'bg-gradient-to-r from-orange-100 to-orange-200' :
              task.energyPoints === 3 ? 'bg-gradient-to-r from-blue-100 to-blue-200' :
              'bg-gradient-to-r from-purple-100 to-purple-200'
            }`}>
              {getEnergyIcon(task.energyPoints)}
            </div>
            <div>
              <span className="text-xs text-gray-500 font-medium">
                {task.energyPoints === 1 ? "Bateria Fraca" : 
                 task.energyPoints === 3 ? "Cérebro Normal" : "Cérebro Ligado"}
              </span>
              {task.project && showProject && (
                <div className="mt-1">
                  <span className="text-xs bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600 px-3 py-1 rounded-full border border-gray-200">
                    {task.project.icon} {task.project.name}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          <p className={`text-sm leading-relaxed mb-3 ${
            task.status === 'done' ? 'text-gray-500 line-through' : 'text-gray-800 font-medium'
          }`}>
            {task.description}
          </p>

          {/* Indicadores de anexos e comentários */}
          <div className="flex items-center space-x-4 mb-3">
            {hasAttachments && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowAttachments(!showAttachments);
                }}
                className="flex items-center space-x-2 text-xs text-blue-600 hover:text-blue-700 transition-colors"
              >
                <Paperclip className="w-3 h-3" />
                <span>{task.attachments!.length} anexo{task.attachments!.length !== 1 ? 's' : ''}</span>
                {showAttachments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
            
            {hasComments && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowComments(!showComments);
                }}
                className="flex items-center space-x-2 text-xs text-purple-600 hover:text-purple-700 transition-colors"
              >
                <MessageSquare className="w-3 h-3" />
                <span>{task.comments!.length} comentário{task.comments!.length !== 1 ? 's' : ''}</span>
                {showComments ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
            )}
          </div>
        </div>
        
        <div className="ml-4 flex items-center space-x-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEditClick}
            className="w-8 h-8 rounded-xl transition-all duration-300 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-blue-100 hover:to-blue-200 text-gray-400 hover:text-blue-600 shadow-md hover:shadow-lg flex items-center justify-center"
            title="Editar tarefa"
          >
            <Edit3 className="w-4 h-4" />
          </motion.button>
          
          {task.status !== 'done' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onPostpone(task.id);
              }}
              className="w-8 h-8 rounded-xl transition-all duration-300 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-orange-100 hover:to-orange-200 text-gray-400 hover:text-orange-600 shadow-md hover:shadow-lg flex items-center justify-center"
              title="Adiar tarefa"
            >
              <Calendar className="w-4 h-4" />
            </motion.button>
          )}
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onComplete(task.id);
            }}
            disabled={task.status === 'done'}
            className={`w-10 h-10 rounded-full transition-all duration-300 ${
              task.status === 'done'
                ? 'bg-gradient-to-r from-green-100 to-green-200 text-green-600 cursor-default shadow-lg'
                : 'bg-gradient-to-r from-gray-100 to-gray-200 hover:from-green-100 hover:to-green-200 text-gray-400 hover:text-green-600 shadow-md hover:shadow-lg'
            } flex items-center justify-center`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      {/* Seção de anexos */}
      <AnimatePresence>
        {showAttachments && onUpdateAttachments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <FileUpload
              attachments={task.attachments || []}
              onUpload={handleUpload}
              onRemove={handleRemoveAttachment}
              maxFiles={3}
              maxSize={5}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Seção de comentários */}
      <AnimatePresence>
        {showComments && hasComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {task.comments!.map((comment) => (
                <div key={comment.id} className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-800">{comment.content}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {new Date(comment.createdAt).toLocaleDateString()} às {new Date(comment.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
'@

$newTaskItemContent | Set-Content $taskItemPath -Encoding UTF8
Write-Host "✅ TaskItem atualizado com funcionalidade de edição" -ForegroundColor Green

# ============================================================================
# BLOCO 6: Atualizando BombeiroPage para incluir o modal de edição
# ============================================================================

Write-Host "`n🚒 Atualizando BombeiroPage para incluir modal de edição..." -ForegroundColor Yellow

$bombeiroPagePath = Join-Path $ProjectRoot "src/components/bombeiro/BombeiroPage.tsx"
$newBombeiroPageContent = @'
'use client';

// ============================================================================
// PÁGINA BOMBEIRO - Painel principal de tarefas do dia
// ============================================================================

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { useTasksStore } from '@/stores/tasksStore';
import { EnergyMeter } from './EnergyMeter';
import { TaskItem } from './TaskItem';
import { WeeklyGarden } from './WeeklyGarden';
import { PostponedTasksRoom } from './PostponedTasksRoom';
import { WeeklyStats } from './WeeklyStats';
import { TaskEditModal } from '@/components/shared/TaskEditModal';

export function BombeiroPage() {
  const {
    todayTasks,
    postponedTasks,
    setShowLowEnergyModal,
    completeTask,
    postponeTask,
  } = useTasksStore();

  const completedTasks = todayTasks.filter(task => task.status === 'done').length;
  const pendingTasks = todayTasks.filter(task => task.status === 'pending');

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <EnergyMeter />

          {/* Sala de Replanejamento */}
          {postponedTasks.length > 0 && <PostponedTasksRoom />}

          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-800 flex items-center">
                🎯 Missões de Hoje
                <span className="ml-3 text-sm bg-gradient-to-r from-blue-100 to-blue-200 text-blue-700 px-3 py-1.5 rounded-full border border-blue-200 font-medium">
                  {completedTasks}/{todayTasks.length}
                </span>
              </h2>
              
              <div className="flex space-x-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowLowEnergyModal(true)}
                  className="px-4 py-2.5 bg-gradient-to-r from-orange-100 to-red-100 text-orange-700 rounded-xl text-sm font-medium hover:from-orange-200 hover:to-red-200 transition-all duration-300 border border-orange-200"
                >
                  🔋 Não consigo começar hoje...
                </motion.button>
              </div>
            </div>

            <div className="space-y-3">
              <AnimatePresence>
                {todayTasks.map((task) => (
                  <TaskItem 
                    key={task.id} 
                    task={task}
                    onComplete={completeTask}
                    onPostpone={postponeTask}
                    showProject={true}
                  />
                ))}
              </AnimatePresence>
            </div>

            {pendingTasks.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="text-6xl mb-4">🎉</div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Todas as missões concluídas!
                </h3>
                <p className="text-gray-600">
                  Excelente trabalho! Seu jardim está florescendo.
                </p>
              </motion.div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <WeeklyGarden />
          <WeeklyStats />
        </div>
      </div>

      {/* Modal de Edição */}
      <TaskEditModal />
    </>
  );
}
'@

$newBombeiroPageContent | Set-Content $bombeiroPagePath -Encoding UTF8
Write-Host "✅ BombeiroPage atualizada com modal de edição" -ForegroundColor Green

# ============================================================================
# BLOCO 7: Atualizando outras páginas para incluir o modal de edição
# ============================================================================

Write-Host "`n🏗️ Atualizando outras páginas para incluir modal de edição..." -ForegroundColor Yellow

# Arquiteto Page
$arquitetoPagePath = Join-Path $ProjectRoot "src/components/arquiteto/ArquitetoPage.tsx"
if (Test-Path $arquitetoPagePath) {
    $arquitetoContent = Get-Content $arquitetoPagePath -Raw
    
    # Adicionar import do TaskEditModal
    $arquitetoContent = $arquitetoContent -replace "import { useTasksStore } from '@/stores/tasksStore';", "import { useTasksStore } from '@/stores/tasksStore';`nimport { TaskEditModal } from '@/components/shared/TaskEditModal';"
    
    # Adicionar o modal no final do JSX
    $arquitetoContent = $arquitetoContent -replace "    </div>`n  );`n}", "    </div>`n      `n      {/* Modal de Edição */}`n      <TaskEditModal />`n    </>`n  );`n}"
    
    # Trocar div por React.Fragment
    $arquitetoContent = $arquitetoContent -replace "  return (`n    <div", "  return (`n    <>`n    <div"
    
    $arquitetoContent | Set-Content $arquitetoPagePath -Encoding UTF8
    Write-Host "✅ ArquitetoPage atualizada" -ForegroundColor Green
}

# Caixa de Areia Page
$caixaAreiaaPagePath = Join-Path $ProjectRoot "src/components/caixa-de-areia/CaixaDeAreiaPage.tsx"
if (Test-Path $caixaAreiaaPagePath) {
    $caixaAreiaContent = Get-Content $caixaAreiaaPagePath -Raw
    
    # Adicionar import do TaskEditModal
    $caixaAreiaContent = $caixaAreiaContent -replace "import { useTasksStore } from '@/stores/tasksStore';", "import { useTasksStore } from '@/stores/tasksStore';`nimport { TaskEditModal } from '@/components/shared/TaskEditModal';"
    
    # Adicionar o modal no final do JSX
    $caixaAreiaContent = $caixaAreiaContent -replace "    </div>`n  );`n}", "    </div>`n      `n      {/* Modal de Edição */}`n      <TaskEditModal />`n    </>`n  );`n}"
    
    # Trocar div por React.Fragment
    $caixaAreiaContent = $caixaAreiaContent -replace "  return (`n    <div", "  return (`n    <>`n    <div"
    
    $caixaAreiaContent | Set-Content $caixaAreiaaPagePath -Encoding UTF8
    Write-Host "✅ CaixaDeAreiaPage atualizada" -ForegroundColor Green
}

# Floresta Page
$florestaPagePath = Join-Path $ProjectRoot "src/components/floresta/FlorestaPage.tsx"
if (Test-Path $florestaPagePath) {
    $florestaContent = Get-Content $florestaPagePath -Raw
    
    # Adicionar import do TaskEditModal
    $florestaContent = $florestaContent -replace "import { useTasksStore } from '@/stores/tasksStore';", "import { useTasksStore } from '@/stores/tasksStore';`nimport { TaskEditModal } from '@/components/shared/TaskEditModal';"
    
    # Adicionar o modal no final do JSX
    $florestaContent = $florestaContent -replace "    </div>`n  );`n}", "    </div>`n      `n      {/* Modal de Edição */}`n      <TaskEditModal />`n    </>`n  );`n}"
    
    # Trocar div por React.Fragment
    $florestaContent = $florestaContent -replace "  return (`n    <div", "  return (`n    <>`n    <div"
    
    $florestaContent | Set-Content $florestaPagePath -Encoding UTF8
    Write-Host "✅ FlorestaPage atualizada" -ForegroundColor Green
}

# ============================================================================
# BLOCO 8: Verificação final e limpeza
# ============================================================================

Write-Host "`n🔍 Verificação final dos arquivos criados/modificados..." -ForegroundColor Yellow

$createdFiles = @(
    "src/components/shared/TaskEditModal.tsx"
)

$modifiedFiles = @(
    "src/types/index.ts",
    "src/stores/tasksStore.ts",
    "src/components/bombeiro/TaskItem.tsx",
    "src/components/bombeiro/BombeiroPage.tsx"
)

Write-Host "`n📁 Arquivos criados:" -ForegroundColor Green
foreach ($file in $createdFiles) {
    $fullPath = Join-Path $ProjectRoot $file
    if (Test-Path $fullPath) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file" -ForegroundColor Red
    }
}

Write-Host "`n📝 Arquivos modificados:" -ForegroundColor Green
foreach ($file in $modifiedFiles) {
    $fullPath = Join-Path $ProjectRoot $file
    if (Test-Path $fullPath) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file" -ForegroundColor Red
    }
}

Write-Host "`n🎉 IMPLEMENTAÇÃO CONCLUÍDA COM SUCESSO!" -ForegroundColor Green
Write-Host "🔧 Funcionalidades implementadas:" -ForegroundColor Cyan
Write-Host "  • Sistema de edição de tarefas em todas as páginas" -ForegroundColor White
Write-Host "  • Modal de edição com campos para descrição, energia e projeto" -ForegroundColor White
Write-Host "  • Sistema de comentários para tarefas" -ForegroundColor White
Write-Host "  • Clique nas tarefas para abrir modal de edição" -ForegroundColor White
Write-Host "  • Botão de edição em todas as tarefas" -ForegroundColor White
Write-Host "  • Histórico de comentários por tarefa" -ForegroundColor White
Write-Host "  • Integração com sistema de projetos existente" -ForegroundColor White

Write-Host "`n💡 Como usar:" -ForegroundColor Yellow
Write-Host "  1. Clique em qualquer tarefa para abrir o modal de edição" -ForegroundColor White
Write-Host "  2. Ou use o botão de edição (ícone de lápis) em cada tarefa" -ForegroundColor White
Write-Host "  3. Edite a descrição, nível de energia e projeto" -ForegroundColor White
Write-Host "  4. Adicione comentários que serão salvos no histórico" -ForegroundColor White
Write-Host "  5. Clique em 'Salvar' para aplicar as alterações" -ForegroundColor White

Write-Host "`n📋 Backups criados em: $backupDir" -ForegroundColor Cyan
Write-Host "⚠️  Teste a aplicação e verifique se tudo está funcionando corretamente" -ForegroundColor Yellow
Write-Host "🚀 Execute 'npm run dev' para testar as funcionalidades" -ForegroundColor Green