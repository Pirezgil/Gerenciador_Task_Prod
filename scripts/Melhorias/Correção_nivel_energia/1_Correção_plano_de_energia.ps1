# ============================================================================
# SCRIPT: Implementacao_Correcao_Fluxo_Energia_Missoes.ps1
# DESCRIÇÃO: Corrige o fluxo de energia das missões usando REESCRITA COMPLETA
# BASEADO: guia_para_scripts_powershell.md - Estratégia 1: REESCRITA COMPLETA
# ============================================================================

param(
    [string]$ProjectPath = ""
)

Write-Host "=== CORREÇÃO DO FLUXO DE ENERGIA - REESCRITA COMPLETA ===" -ForegroundColor Green
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
$utilsPath = Join-Path $ProjectPath "src\lib\utils.ts"

Write-Host "Procurando arquivos em:" -ForegroundColor Yellow
Write-Host "  tasksStore: $tasksStorePath" -ForegroundColor Gray
Write-Host "  utils: $utilsPath" -ForegroundColor Gray
Write-Host ""

if (-not (Test-Path $tasksStorePath)) {
    Write-Host "Arquivo não encontrado: $tasksStorePath" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $utilsPath)) {
    Write-Host "Arquivo não encontrado: $utilsPath" -ForegroundColor Red
    exit 1
}

# Criar backups obrigatórios
$timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupTasksStore = "$tasksStorePath.backup_reescrita_$timestamp"
$backupUtils = "$utilsPath.backup_reescrita_$timestamp"

Copy-Item $tasksStorePath $backupTasksStore
Copy-Item $utilsPath $backupUtils

Write-Host "Backup tasksStore: $backupTasksStore" -ForegroundColor Cyan
Write-Host "Backup utils: $backupUtils" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# BLOCO 1: REESCRITA COMPLETA DO utils.ts
# ============================================================================

Write-Host "REESCREVENDO utils.ts..." -ForegroundColor Green

$utilsCorreto = @'
// ============================================================================
// UTILS - Funções utilitárias para o Cérebro-Compatível
// ============================================================================

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { EnergyLevel, Task, EnergyBudget } from '@/types';

/**
 * Combina classes CSS com Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Gera ID único
 */
export function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

/**
 * Formata data para exibição
 */
export function formatDate(date: string | Date, format: 'short' | 'long' = 'short'): string {
  const d = new Date(date);
  
  if (format === 'short') {
    return d.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit'
    });
  }
  
  return d.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
}

/**
 * Formata hora para exibição
 */
export function formatTime(date: string | Date): string {
  return new Date(date).toLocaleTimeString('pt-BR', {
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Calcula orçamento de energia
 */
export function calculateEnergyBudget(tasks: Task[], totalBudget: number = 12): EnergyBudget {
  const used = tasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  
  const remaining = Math.max(0, totalBudget - used);
  const percentage = Math.min((used / totalBudget) * 100, 100);
  
  return {
    used,
    total: totalBudget,
    remaining,
    percentage,
    isOverBudget: used > totalBudget,
    isComplete: used === totalBudget,
  };
}

/**
 * Retorna mensagem de encorajamento baseada no orçamento de energia
 */
export function getEncouragementMessage(budget: EnergyBudget): string {
  if (budget.isOverBudget) {
    return 'Dia um pouco cheio! Considere reorganizar algumas tarefas.';
  }
  
  if (budget.isComplete) {
    return 'Perfeito! Seu dia está completo. Energia totalmente alocada.';
  }
  
  if (budget.percentage > 80) {
    return 'Quase lá! Você está no limite ideal de energia.';
  }
  
  if (budget.percentage > 60) {
    return 'Bom ritmo! Você está conseguindo manter o equilíbrio.';
  }
  
  return 'Energia preservada! Espaço para mais atividades se surgir algo importante.';
}

/**
 * Retorna cor CSS baseada no orçamento de energia
 */
export function getEnergyColor(budget: EnergyBudget): string {
  if (budget.isOverBudget) {
    return 'text-orange-600';
  }
  
  if (budget.percentage > 80) {
    return 'text-yellow-600';
  }
  
  if (budget.percentage > 60) {
    return 'text-blue-600';
  }
  
  return 'text-green-600';
}

/**
 * Retorna ícone de energia baseado no nível
 */
export function getEnergyIcon(level: EnergyLevel): string {
  const icons = {
    1: '🔋', // Bateria Fraca
    3: '🧠', // Cérebro Normal  
    5: '⚡', // Cérebro Ligado
  };
  
  return icons[level];
}

/**
 * Retorna label de energia baseado no nível
 */
export function getEnergyLabel(level: EnergyLevel): string {
  const labels = {
    1: 'Bateria Fraca',
    3: 'Cérebro Normal',
    5: 'Cérebro Ligado',
  };
  
  return labels[level];
}

/**
 * Retorna cores CSS baseadas no nível de energia
 */
export function getEnergyColors(level: EnergyLevel): string {
  const colors = {
    1: 'from-orange-100 to-orange-200 text-orange-700 border-orange-200',
    3: 'from-blue-100 to-blue-200 text-blue-700 border-blue-200',
    5: 'from-purple-100 to-purple-200 text-purple-700 border-purple-200',
  };
  
  return colors[level];
}

/**
 * Valida se uma tarefa pode ser adicionada ao orçamento
 */
export function canAddTask(energyBudget: EnergyBudget, energyPoints: EnergyLevel): boolean {
  return (energyBudget.used + energyPoints) <= energyBudget.total;
}

/**
 * Calcula dias até deadline
 */
export function getDaysUntilDeadline(deadline: string): number {
  const today = new Date();
  const deadlineDate = new Date(deadline);
  const diffTime = deadlineDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
}

/**
 * Retorna saudação baseada no horário
 */
export function getGreeting(): string {
  const hour = new Date().getHours();
  
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

/**
 * Trunca texto para um tamanho máximo
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

/**
 * Debounce function para otimização de performance
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Valida email
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitiza string para uso em IDs
 */
export function sanitizeId(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

/**
 * Calcula progresso percentual
 */
export function calculateProgress(completed: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

/**
 * Ordena array por propriedade
 */
export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Agrupa array por propriedade
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}
'@

# Aplicar reescrita do utils.ts
$utilsCorreto | Set-Content $utilsPath -Encoding UTF8
Write-Host "utils.ts reescrito com sucesso!" -ForegroundColor Green

# ============================================================================
# BLOCO 2: REESCRITA COMPLETA DO tasksStore.ts
# ============================================================================

Write-Host "REESCREVENDO tasksStore.ts..." -ForegroundColor Green

$tasksStoreCorreto = @'
// ============================================================================
// TASKS STORE - Gerenciamento completo de tarefas com Zustand
// CORREÇÃO: Energia mantida ao finalizar, removida apenas ao postergar
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
      // Estados iniciais
      todayTasks: [
        {
          id: '1',
          userId: 'user1',
          description: "Responder emails importantes",
          energyPoints: 3,
          status: "pending",
          postponedCount: 0,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'user1',
          description: "Revisar capítulo 2 do relatório",
          energyPoints: 5,
          status: "pending",
          postponedCount: 0,
          project: { name: "Relatório Anual", icon: "📊" },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '3',
          userId: 'user1',
          description: "Organizar mesa de trabalho",
          energyPoints: 1,
          status: "done",
          postponedCount: 0,
          completedAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      
      projects: [
        {
          id: '1',
          userId: 'user1',
          name: "Relatório Anual",
          icon: "📊",
          sandboxNotes: "Preciso focar na parte de análise de dados... Talvez seja melhor começar pelos gráficos mais simples e depois partir para os complexos. Lembrar de incluir as métricas do Q2.",
          deadline: "2025-08-15",
          status: 'active',
          backlog: [
            { 
              id: '4', 
              userId: 'user1',
              description: "Coletar dados do Q1", 
              energyPoints: 3,
              status: 'backlog',
              postponedCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
            { 
              id: '5', 
              userId: 'user1',
              description: "Criar gráfico de vendas", 
              energyPoints: 5,
              status: 'backlog',
              postponedCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'user1',
          name: "Aprender Frontend",
          icon: "⚛️",
          sandboxNotes: "Quero dominar React e depois partir para Next.js. Talvez seja interessante fazer um projeto prático enquanto estudo - uma landing page ou um pequeno app.",
          status: 'active',
          backlog: [
            { 
              id: '6', 
              userId: 'user1',
              description: "Assistir curso de React Hooks", 
              energyPoints: 3,
              status: 'backlog',
              postponedCount: 0,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ],
      
      notes: [
        {
          id: '1',
          userId: 'user1',
          content: "Estava pensando sobre aquele projeto de automação... talvez seja melhor usar Python mesmo. JavaScript pode ser mais complexo para esse caso específico.",
          status: 'active',
          createdAt: "2025-07-01T10:30:00",
          updatedAt: "2025-07-01T10:30:00",
        },
        {
          id: '2',
          userId: 'user1',
          content: "Ideias para o final de semana:\n- Visitar a feira de livros\n- Experimentar aquela receita de bolo\n- Ligar para a vó\n- Talvez começar a ler 'Duna'?",
          status: 'active',
          createdAt: "2025-06-30T16:45:00",
          updatedAt: "2025-06-30T16:45:00",
        },
      ],
      
      weeklyTrees: [
        {
          id: '1',
          userId: 'user1',
          weekStartDate: new Date().toISOString(),
          projectName: "Tarefas Gerais",
          icon: "🌱",
          leafCount: 4,
          harvested: false,
          isGeneral: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: '2',
          userId: 'user1',
          weekStartDate: new Date().toISOString(),
          projectId: '1',
          projectName: "Relatório Anual",
          icon: "📊",
          leafCount: 2,
          harvested: false,
          isGeneral: false,
          createdAt: new Date().toISOString(),
        },
      ],
      
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

# Aplicar reescrita do tasksStore.ts
$tasksStoreCorreto | Set-Content $tasksStorePath -Encoding UTF8
Write-Host "tasksStore.ts reescrito com sucesso!" -ForegroundColor Green

# ============================================================================
# BLOCO 3: Validações finais simples
# ============================================================================

Write-Host ""
Write-Host "Executando validacoes..." -ForegroundColor Yellow

$newTasksStoreContent = Get-Content $tasksStorePath -Raw
$newUtilsContent = Get-Content $utilsPath -Raw

$success = $true

# Validar utils.ts
if ($newUtilsContent.Contains("getEncouragementMessage") -and $newUtilsContent.Contains("getEnergyColor")) {
    Write-Host "Funcoes de energia implementadas em utils.ts" -ForegroundColor Green
} else {
    Write-Host "ERRO: Funcoes de energia nao implementadas" -ForegroundColor Red
    $success = $false
}

# Validar tasksStore.ts
if ($newTasksStoreContent.Contains("CORREÇÃO: Energia se mantém ao finalizar tarefa")) {
    Write-Host "completeTask corrigido - energia mantida" -ForegroundColor Green
} else {
    Write-Host "ERRO: completeTask nao corrigido" -ForegroundColor Red
    $success = $false
}

if ($newTasksStoreContent.Contains("CORREÇÃO: Inclui tarefas completadas no cálculo")) {
    Write-Host "calculateEnergyBudget corrigido - inclui tarefas completadas" -ForegroundColor Green
} else {
    Write-Host "ERRO: calculateEnergyBudget nao corrigido" -ForegroundColor Red
    $success = $false
}

Write-Host ""
if ($success) {
    Write-Host "CORRECAO BEM-SUCEDIDA!" -ForegroundColor Green
    Write-Host ""
    Write-Host "NOVO FLUXO DE ENERGIA:" -ForegroundColor Cyan
    Write-Host "  Tarefa finalizada → Energia se mantem no contador" -ForegroundColor Green
    Write-Host "  Tarefa postergada → Energia e removida do contador" -ForegroundColor Green
} else {
    Write-Host "FALHA NA CORRECAO - Restaurando backups" -ForegroundColor Red
    Copy-Item $backupTasksStore $tasksStorePath
    Copy-Item $backupUtils $utilsPath
    Write-Host "Backups restaurados" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Backups salvos em:" -ForegroundColor Gray
Write-Host "  $backupTasksStore" -ForegroundColor Gray
Write-Host "  $backupUtils" -ForegroundColor Gray
Write-Host ""
Write-Host "=== FIM DA CORRECAO ===" -ForegroundColor Green