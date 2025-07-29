# ============================================================================
# SCRIPT: Implementacao_Zerar_Missoes_Exemplo.ps1
# DESCRIÇÃO: Zera todas as missões e dados de exemplo do projeto
# BASEADO: guia_para_scripts_powershell.md - Estratégia 1: REESCRITA COMPLETA
# ============================================================================

param(
    [string]$ProjectPath = ""
)

Write-Host "=== ZERANDO MISSÕES E DADOS DE EXEMPLO ===" -ForegroundColor Green
Write-Host ""

# Auto-detectar a raiz do projeto
if ([string]::IsNullOrEmpty($ProjectPath)) {
    $currentDir = Get-Location
    
    # Se estamos em scripts/Melhorias, subir 2 níveis
    if ($currentDir.Path.EndsWith("scripts\Melhorias")) {
        $ProjectPath = Join-Path $currentDir "..\..\"
        Write-Host "Detectado execucao em scripts/Melhorias - usando projeto: $ProjectPath" -ForegroundColor Cyan
    }
    # Se estamos em scripts, subir 1 nível  
    elseif ($currentDir.Path.EndsWith("scripts")) {
        $ProjectPath = Join-Path $currentDir "..\"
        Write-Host "Detectado execucao em scripts - usando projeto: $ProjectPath" -ForegroundColor Cyan
    }
    # Caso contrário, usar diretório atual
    else {
        $ProjectPath = "."
        Write-Host "Usando diretorio atual como projeto: $ProjectPath" -ForegroundColor Cyan
    }
}

# Verificações iniciais
$tasksStorePath = Join-Path $ProjectPath "src\stores\tasksStore.ts"

Write-Host "Procurando arquivo em:" -ForegroundColor Yellow
Write-Host "  tasksStore: $tasksStorePath" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $tasksStorePath)) {
    Write-Host "Arquivo nao encontrado: $tasksStorePath" -ForegroundColor Red
    exit 1
}

# Criar backup obrigatório
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupTasksStore = "$tasksStorePath.backup_zerar_$timestamp"

Copy-Item $tasksStorePath $backupTasksStore
Write-Host "Backup criado: $backupTasksStore" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# BLOCO 1: REESCRITA COMPLETA DO tasksStore.ts COM DADOS ZERADOS
# ============================================================================

Write-Host "REESCREVENDO tasksStore.ts com dados zerados..." -ForegroundColor Green

$tasksStoreZerado = @'
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
  TransformNoteRequest 
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
            '🏗️',
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
            '🏗️',
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
      version: 1,
    }
  )
);
'@

# Aplicar reescrita do tasksStore.ts com dados zerados
$tasksStoreZerado | Set-Content $tasksStorePath -Encoding UTF8
Write-Host "tasksStore.ts reescrito com dados zerados!" -ForegroundColor Green

# ============================================================================
# BLOCO 2: Validações finais
# ============================================================================

Write-Host ""
Write-Host "Executando validacoes..." -ForegroundColor Yellow

$newTasksStoreContent = Get-Content $tasksStorePath -Raw

$success = $true

# Validar se os arrays estão vazios
if ($newTasksStoreContent.Contains("todayTasks: [],") -and 
    $newTasksStoreContent.Contains("projects: [],") -and 
    $newTasksStoreContent.Contains("notes: [],")) {
    Write-Host "Dados de exemplo removidos com sucesso" -ForegroundColor Green
} else {
    Write-Host "ERRO: Dados de exemplo nao foram removidos" -ForegroundColor Red
    $success = $false
}

# Validar se manteve as correções de energia
if ($newTasksStoreContent.Contains("CORREÇÃO: Energia se mantém ao finalizar tarefa")) {
    Write-Host "Correcoes de energia mantidas" -ForegroundColor Green
} else {
    Write-Host "ERRO: Correcoes de energia perdidas" -ForegroundColor Red
    $success = $false
}

Write-Host ""
if ($success) {
    Write-Host "DADOS ZERADOS COM SUCESSO!" -ForegroundColor Green
    Write-Host ""
    Write-Host "ESTADO ATUAL:" -ForegroundColor Cyan
    Write-Host "  Tarefas de hoje: 0" -ForegroundColor Green
    Write-Host "  Projetos: 0" -ForegroundColor Green
    Write-Host "  Notas: 0" -ForegroundColor Green
    Write-Host "  Arvores semanais: 0" -ForegroundColor Green
    Write-Host "  Tarefas postergadas: 0" -ForegroundColor Green
    Write-Host ""
    Write-Host "Agora voce pode comecar a usar o sistema com dados limpos!" -ForegroundColor Yellow
} else {
    Write-Host "FALHA AO ZERAR DADOS - Restaurando backup" -ForegroundColor Red
    Copy-Item $backupTasksStore $tasksStorePath
    Write-Host "Backup restaurado" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Backup salvo em:" -ForegroundColor Gray
Write-Host "  $backupTasksStore" -ForegroundColor Gray
Write-Host ""
Write-Host "=== FIM DA OPERACAO ===" -ForegroundColor Green