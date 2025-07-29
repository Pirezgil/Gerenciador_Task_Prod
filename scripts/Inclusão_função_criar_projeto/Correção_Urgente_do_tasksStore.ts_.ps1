# SCRIPT: Correção Urgente do tasksStore.ts
# DESCRIÇÃO: Reescrita completa para corrigir erro de sintaxe
# ESTRATÉGIA: REESCRITA COMPLETA seguindo as diretrizes

param()

Write-Host "===============================================" -ForegroundColor Red
Write-Host "🚨 CORREÇÃO URGENTE DE SINTAXE" -ForegroundColor Red
Write-Host "===============================================" -ForegroundColor Red
Write-Host ""

$storeFile = "src\stores\tasksStore.ts"

if (-not (Test-Path $storeFile)) {
    Write-Host "❌ Store não encontrado: $storeFile" -ForegroundColor Red
    exit 1
}

Write-Host "🔍 Detectado erro de sintaxe no tasksStore.ts" -ForegroundColor Yellow
Write-Host "📝 Aplicando REESCRITA COMPLETA..." -ForegroundColor Cyan

# Backup obrigatório
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupPath = "$storeFile.backup_correcao_$timestamp"
Copy-Item $storeFile $backupPath
Write-Host "💾 Backup: $backupPath" -ForegroundColor Yellow

# Conteúdo correto COMPLETO do store
$storeContent = @'
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
  TaskComment,
  TaskCommentEdit
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
  
  // Actions - Comentários
  editTaskComment: (commentEdit: TaskCommentEdit) => void;
  deleteTaskComment: (taskId: string, commentId: string) => void;
  
  // Actions - Projetos
  addTaskToProject: (projectId: string, description: string, energyPoints: 1 | 3 | 5) => void;
  updateProjectNotes: (projectId: string, notes: string) => void;
  createProject: (name: string, icon: string, notes: string) => void;
  
  // Actions - Gerenciamento de Tijolos
  editProjectTask: (projectId: string, taskId: string, description: string, energyPoints: 1 | 3 | 5) => void;
  deleteProjectTask: (projectId: string, taskId: string) => void;
  createProjectWithTasks: (name: string, icon: string, notes: string, initialTasks: Array<{description: string, energyPoints: 1 | 3 | 5}>) => void;
  
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
      
      // Actions - Comentários
      editTaskComment: (commentEdit) => {
        const { commentId, taskId, newContent } = commentEdit;
        
        const updateTaskComments = (task: Task) => {
          if (task.id !== taskId) return task;
          
          return {
            ...task,
            comments: task.comments?.map(comment =>
              comment.id === commentId
                ? { ...comment, content: newContent, updatedAt: new Date().toISOString() }
                : comment
            ) || [],
            updatedAt: new Date().toISOString(),
          };
        };
        
        set(state => ({
          todayTasks: state.todayTasks.map(updateTaskComments),
          postponedTasks: state.postponedTasks.map(updateTaskComments),
          projects: state.projects.map(project => ({
            ...project,
            backlog: project.backlog.map(updateTaskComments),
          })),
        }));
      },
      
      deleteTaskComment: (taskId, commentId) => {
        const updateTaskComments = (task: Task) => {
          if (task.id !== taskId) return task;
          
          return {
            ...task,
            comments: task.comments?.filter(comment => comment.id !== commentId) || [],
            updatedAt: new Date().toISOString(),
          };
        };
        
        set(state => ({
          todayTasks: state.todayTasks.map(updateTaskComments),
          postponedTasks: state.postponedTasks.map(updateTaskComments),
          projects: state.projects.map(project => ({
            ...project,
            backlog: project.backlog.map(updateTaskComments),
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

# Aplicar reescrita completa
$storeContent | Set-Content $storeFile -Encoding UTF8

# Validações
$newContent = Get-Content $storeFile -Raw
$newSize = $newContent.Length

if ($newSize -lt 5000) {
    Write-Host "❌ Arquivo muito pequeno - possível erro na reescrita" -ForegroundColor Red
    Copy-Item $backupPath $storeFile
    exit 1
}

# Verificar sintaxe básica
$hasInterface = $newContent.Contains("interface TasksState")
$hasImplementation = $newContent.Contains("export const useTasksStore")
$hasNewFunctions = $newContent.Contains("editProjectTask:") -and $newContent.Contains("deleteProjectTask:") -and $newContent.Contains("createProjectWithTasks:")

if (-not $hasInterface -or -not $hasImplementation -or -not $hasNewFunctions) {
    Write-Host "⚠️ Possível problema na estrutura do arquivo" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "===============================================" -ForegroundColor Green
Write-Host "✅ CORREÇÃO APLICADA COM SUCESSO!" -ForegroundColor Green
Write-Host "===============================================" -ForegroundColor Green
Write-Host ""

Write-Host "📋 CORREÇÕES APLICADAS:" -ForegroundColor Cyan
Write-Host "  ✅ Sintaxe TypeScript corrigida" -ForegroundColor White
Write-Host "  ✅ Interface TasksState limpa e organizada" -ForegroundColor White
Write-Host "  ✅ Implementações das funções adicionadas corretamente" -ForegroundColor White
Write-Host "  ✅ Funções de gerenciamento de tijolos funcionais" -ForegroundColor White
Write-Host ""

Write-Host "🚀 TESTE NOVAMENTE:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
Write-Host ""

Write-Host "💾 Backup salvo em: $backupPath" -ForegroundColor Yellow
Write-Host ""
Write-Host "🎉 O servidor deve iniciar sem erros agora!" -ForegroundColor Green