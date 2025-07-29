import { syncedUpdate } from '../lib/syncManager';


// ===== CORREÇÃO ANTI-LOOP INFINITO GLOBAL =====
let isUpdatingEnergy = false;
let lastEnergyUpdate = 0;

const safeEnergyUpdate = (store: any, newValue: number, source: string = 'global') => {
  if (isUpdatingEnergy) {
    console.warn(`[${source}] Energia: Atualização já em progresso, ignorando`);
    return false;
  }
  
  const now = Date.now();
  if (now - lastEnergyUpdate < 150) {
    console.warn(`[${source}] Energia: Throttled - muito rápido`);
    return false;
  }
  
  if (store.energy === newValue) {
    return false;
  }
  
  isUpdatingEnergy = true;
  lastEnergyUpdate = now;
  
  try {
    const safeValue = Math.max(0, Math.min(newValue, store.maxEnergy || 100));
    store.energy = safeValue;
    console.log(`[${source}] Energia atualizada: ${store.energy} → ${safeValue}`);
    return true;
  } finally {
    setTimeout(() => { isUpdatingEnergy = false; }, 200);
  }
};
// ===== FIM CORREÇÃO GLOBAL =====

// ============================================================================
// TASKS STORE - Gerenciamento completo de tarefas com Protocolos Críticos
// PROTOCOLOS IMPLEMENTADOS: Baixa Energia, Decomposição, Incêndio
// ============================================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { 
  Task,
  SandboxLayout,
  MovableNote, 
  Project, 
  Note, 
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

// Tarefas de emergência (1 ponto de energia)
const LIGHT_TASKS = [
  "Beber um copo d'água",
  "Organizar a mesa por 5 minutos",
  "Responder 1 mensagem importante",
  "Fazer 3 respirações profundas",
  "Escrever uma coisa boa que aconteceu hoje",
  "Alongar por 2 minutos",
  "Ler 1 parágrafo de algo interessante",
  "Limpar 1 item da lista de downloads",
  "Mandar um 'oi' para alguém querido",
  "Olhar pela janela por 1 minuto"
];

interface EmergencyTask {
  description: string;
  energyPoints: 1 | 3 | 5;
  projectId?: string;
}

interface TasksState {
  // Estados principais
  todayTasks: Task[];
  projects: Project[];
  notes: Note[];
  postponedTasks: PostponedTask[];
  
  // Estados de UI
  currentPage: 'bombeiro' | 'arquiteto' | 'caixa-de-areia';
  selectedProjectId: string | null;
  editingNote: string | null;
  
  // Estados de Modal
  showCaptureModal: boolean;
  showLowEnergyModal: boolean;
  showDecompositionModal: Task | null;
  showTransformModal: Note | null;
  taskEditModal: TaskEditModalState;
  
  // Estados dos Protocolos Críticos
  showEmergencyModal: boolean;
  emergencyTaskToAdd: EmergencyTask | null;
  
  // Estados de Captura
  captureState: CaptureState;
  
  // Estados de formulário
  newNoteContent: string;  
  
  sandboxLayout: SandboxLayout;

  addingTaskToProject: string | null;
  newTaskDescription: string;
  newTaskEnergy: 1 | 3 | 5;
  
  // Configurações
  energyBudget: {
    total: number;
  };
  
  // Actions - Navegação
  setCurrentPage: (page: 'bombeiro' | 'arquiteto' | 'caixa-de-areia') => void;
  setSelectedProjectId: (id: string | null) => void;
  
  // Actions - Tarefas
  addTaskToToday: (description: string, energyPoints: 1 | 3 | 5, projectId?: string) => boolean;
  completeTask: (taskId: string) => void;
  postponeTask: (taskId: string, reason?: string) => void;
  moveTaskToToday: (projectId: string, taskId: string) => void;
  deleteTask: (taskId: string) => void;
  
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
  
  // Actions - Protocolos Críticos
  setShowEmergencyModal: (show: boolean) => void;
  triggerEmergencyModal: (task: EmergencyTask) => void;
  replaceWithLightTasks: () => void;
  postponeAllTasks: () => void;
  
  // Actions - Captura
  updateCaptureState: (updates: Partial<CaptureState>) => void;
  resetCaptureState: () => void;
  handleCaptureSubmit: () => void;
  handleTriageChoice: (choice: 'sandbox' | 'task') => void;
  handleClassifyChoice: (type: 'task' | 'project') => void;
  handleScheduleChoice: (when: 'today' | 'future', date?: string) => void;
  
  // Actions - Protocolos
  handleDecomposition: (request: DecompositionRequest) => void;
  
  // Actions - Remoção
  removePostponedTask: (taskId: string) => void;
  
  // Actions - Energia
  canAddTask: (energyPoints: number) => boolean;
  getRemainingEnergy: () => number;
  calculateEnergyBudget: () => EnergyBudget;
  
  // Actions - Sandbox Movível
  convertNotesToMovable: () => void;
  updateNotePosition: (noteId: string, x: number, y: number) => void;
  updateNoteSize: (noteId: string, width: number, height: number) => void;
  updateNoteZIndex: (noteId: string, zIndex: number) => void;
  toggleNoteExpanded: (noteId: string) => void;
  updateNoteColor: (noteId: string, color: string) => void;
  selectNote: (noteId: string | null) => void;

  // Actions - Layout Management
  setLayoutMode: (mode: 'free' | 'grid' | 'list' | 'masonry') => void;
  setSnapToGrid: (snap: boolean) => void;
  setGridSize: (size: number) => void;
  setShowGrid: (show: boolean) => void;
  reorganizeNotes: (mode: 'free' | 'grid' | 'list' | 'masonry') => void;
      
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
      // Estados iniciais
      todayTasks: [],
      projects: [],
      notes: [],
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
      
      // Estados dos Protocolos Críticos
      showEmergencyModal: false,
      emergencyTaskToAdd: null,
      
      // Estados de Captura
      captureState: initialCaptureState,
      
      // Estados de formulário
      newNoteContent: '',
      
      // Estados de Sandbox com Layout Customizável
      sandboxLayout: {
        notes: [],
        selectedNoteId: null,
        gridSize: 20,
        showGrid: false,
        layoutMode: 'free',
        snapToGrid: true,
        density: 'normal',
      },
      
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
      
      // Actions - Tarefas (com Protocolo de Incêndio)
      addTaskToToday: (description, energyPoints, projectId) => {
        const state = get();
        const canAdd = state.canAddTask(energyPoints);
        
        if (!canAdd) {
          // PROTOCOLO DE INCÊNDIO: Orçamento cheio
          state.triggerEmergencyModal({
            description,
            energyPoints,
            projectId
          });
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
        
        // Verificar se essa tarefa existe em postponed (restauração)
        const existingPostponed = state.postponedTasks.find(t => 
          t.description === description && t.energyPoints === energyPoints
        );
        
        set(state => ({
          todayTasks: [...state.todayTasks, newTask],
          // Remover de postponed se for uma restauração
          postponedTasks: existingPostponed 
            ? state.postponedTasks.filter(t => t.id !== existingPostponed.id)
            : state.postponedTasks
        }));
        
        return true;
      },
      
      completeTask: (taskId) => {
        set(state => ({
          todayTasks: state.todayTasks.map(t => 
            t.id === taskId 
              ? { ...t, status: 'done', completedAt: new Date().toISOString() }
              : t
          )
        }));
      },
      
      // PROTOCOLO DE DECOMPOSIÇÃO: Melhorado
      postponeTask: (taskId, reason = 'manual') => {
        const state = get();
        const task = state.todayTasks.find(t => t.id === taskId);
        
        if (!task) return;
        
        const newPostponedCount = task.postponedCount + 1;
        
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
        
        // PROTOCOLO DE DECOMPOSIÇÃO: Trigger automático em 3 adiamentos
        if (newPostponedCount >= 3) {
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
          // PROTOCOLO DE INCÊNDIO: Trigger se orçamento cheio
          state.triggerEmergencyModal({
            description: task.description,
            energyPoints: task.energyPoints,
            projectId: project.id
          });
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
      
      // NOVA: Função deleteTask que estava faltando
      deleteTask: (taskId) => {
        set(state => ({
          todayTasks: state.todayTasks.filter(t => t.id !== taskId),
          postponedTasks: state.postponedTasks.filter(t => t.id !== taskId),
        }));
      },
      
      // Actions - Edição de Tarefas
      openTaskEditModal: (task) => {
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
          notes: state.notes.filter(note => note.id !== noteId),
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.filter(note => note.id !== noteId)
          }
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
          state.archiveNote(note.id);
        } else {
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
      
      // Actions - Protocolos Críticos
      setShowEmergencyModal: (show) => set({ showEmergencyModal: show }),
      
      triggerEmergencyModal: (task) => {
        set({
          showEmergencyModal: true,
          emergencyTaskToAdd: task
        });
      },
      
      // PROTOCOLO DE BAIXA ENERGIA: Substituir por tarefas leves
      replaceWithLightTasks: () => {
        const state = get();
        const pendingTasks = state.todayTasks.filter(task => task.status === 'pending');
        
        if (pendingTasks.length === 0) return;
        
        // Mover todas as tarefas pendentes para sala de replanejamento
        const postponedTasks = pendingTasks.map(task => ({
          ...task,
          status: 'postponed' as const,
          postponedCount: task.postponedCount + 1,
          postponeReason: 'replaced_with_light_tasks',
          postponedAt: new Date().toISOString(),
        }));
        
        // Adicionar tarefas leves aleatórias
        const selectedLightTasks = LIGHT_TASKS
          .sort(() => 0.5 - Math.random())
          .slice(0, Math.min(3, pendingTasks.length))
          .map(description => ({
            id: state.generateUniqueId(),
            userId: 'user1',
            description,
            energyPoints: 1 as const,
            status: 'pending' as const,
            postponedCount: 0,
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }));
        
        set(state => ({
          todayTasks: [...state.todayTasks.filter(task => task.status !== 'pending'), ...selectedLightTasks],
          postponedTasks: [...state.postponedTasks, ...postponedTasks]
        }));
      },
      
      // PROTOCOLO DE BAIXA ENERGIA: Adiar o dia inteiro
      postponeAllTasks: () => {
        const state = get();
        const pendingTasks = state.todayTasks.filter(task => task.status === 'pending');
        
        if (pendingTasks.length === 0) return;
        
        const postponedTasks = pendingTasks.map(task => ({
          ...task,
          status: 'postponed' as const,
          postponedCount: task.postponedCount + 1,
          postponeReason: 'postponed_entire_day',
          postponedAt: new Date().toISOString(),
        }));
        
        set(state => ({
          todayTasks: state.todayTasks.filter(task => task.status !== 'pending'),
          postponedTasks: [...state.postponedTasks, ...postponedTasks]
        }));
      },
      
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
          state.resetCaptureState();
        }
      },
      
      // Actions - Protocolos
      handleDecomposition: (request) => {
        const state = get();
        const { originalTask, firstBrick, projectName } = request;
        
        if (!firstBrick.trim()) return;
        
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
      
      // Actions - Remoção
      removePostponedTask: (taskId) => {
        set(state => ({
          postponedTasks: state.postponedTasks.filter(t => t.id !== taskId)
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
      
      // Actions - Sandbox Movível
      convertNotesToMovable: () => {
        const state = get();
        const existingNotes = state.sandboxLayout.notes;
        
        const newMovableNotes = state.notes
          .filter(note => note.status === 'active')
          .filter(note => !existingNotes.some(existing => existing.content === note.content))
          .map((note, index) => ({
            id: note.id,
            content: note.content,
            position: { 
              x: 100 + (index % 3) * 250, 
              y: 150 + Math.floor(index / 3) * 200 
            },
            size: { width: 300, height: 200 },
            isExpanded: false,
            color: '#fbbf24',
            zIndex: 1 + index,
            createdAt: note.createdAt,
            updatedAt: note.updatedAt,
          }));
        
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: [...existingNotes, ...newMovableNotes],
          },
        }));
      },
      
      updateNotePosition: (noteId, x, y) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.map(note =>
              note.id === noteId
                ? { ...note, position: { x, y }, updatedAt: new Date().toISOString() }
                : note
            ),
          },
        }));
      },
      
      updateNoteSize: (noteId, width, height) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.map(note =>
              note.id === noteId
                ? { ...note, size: { width, height }, updatedAt: new Date().toISOString() }
                : note
            ),
          },
        }));
      },
      
      updateNoteZIndex: (noteId, zIndex) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.map(note =>
              note.id === noteId
                ? { ...note, zIndex, updatedAt: new Date().toISOString() }
                : note
            ),
          },
        }));
      },
      
      toggleNoteExpanded: (noteId) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.map(note =>
              note.id === noteId
                ? { ...note, isExpanded: !note.isExpanded, updatedAt: new Date().toISOString() }
                : note
            ),
          },
        }));
      },
      
      updateNoteColor: (noteId, color) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            notes: state.sandboxLayout.notes.map(note =>
              note.id === noteId
                ? { ...note, color, updatedAt: new Date().toISOString() }
                : note
            ),
          },
        }));
      },
      
      selectNote: (noteId) => {
        set(state => ({
          sandboxLayout: {
            ...state.sandboxLayout,
            selectedNoteId: noteId,
          },
        }));
      },

      // Actions - Layout Management
      setLayoutMode: (mode) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, layoutMode: mode }
        }));
      },
      
      setSnapToGrid: (snap) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, snapToGrid: snap }
        }));
      },
      
      setGridSize: (size) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, gridSize: size }
        }));
      },
      
      setShowGrid: (show) => {
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, showGrid: show }
        }));
      },
      
      reorganizeNotes: (mode) => {
        const state = get();
        const notes = state.sandboxLayout.notes;
        const newNotes = [...notes];
        
        switch (mode) {
          case 'grid':
            const cols = Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1200) / 320);
            newNotes.forEach((note, index) => {
              const col = index % cols;
              const row = Math.floor(index / cols);
              note.position = {
                x: 50 + (col * 320),
                y: 150 + (row * 220)
              };
            });
            break;
          
          case 'list':
            newNotes.forEach((note, index) => {
              note.position = {
                x: 50,
                y: 150 + (index * 180)
              };
            });
            break;
            
          case 'masonry':
            const masonryCols = Math.floor((typeof window !== 'undefined' ? window.innerWidth : 1200) / 300);
            const columnHeights = new Array(masonryCols).fill(150);
            
            newNotes.forEach((note) => {
              const shortestCol = columnHeights.indexOf(Math.min(...columnHeights));
              note.position = {
                x: 50 + (shortestCol * 300),
                y: columnHeights[shortestCol]
              };
              columnHeights[shortestCol] += note.size.height + 20;
            });
            break;
        }
        
        set(state => ({
          sandboxLayout: { ...state.sandboxLayout, notes: newNotes }
        }));
      },
      
      // Utilities
      generateUniqueId: () => Date.now().toString() + Math.random().toString(36).substr(2, 9),
    }),
    {
      name: 'cerebro-compativel-tasks',
      version: 5,
      migrate: (persistedState: any, version: number) => {
        // Função de migração para preservar dados existentes
        console.log('🔄 Migrando store do Zustand, versão:', version);
        
        // Se é versão anterior, adicionar novos campos dos protocolos críticos
        if (version < 5) {
          return {
            ...persistedState,
            // Novos campos dos protocolos críticos
            showEmergencyModal: false,
            emergencyTaskToAdd: null,
            // Preservar todos os dados existentes
            todayTasks: persistedState.todayTasks || [],
            projects: persistedState.projects || [],
            notes: persistedState.notes || [],
            postponedTasks: persistedState.postponedTasks || [],
            currentPage: persistedState.currentPage || 'bombeiro',
            energyBudget: persistedState.energyBudget || { total: 12 },
            sandboxLayout: persistedState.sandboxLayout || {
              notes: [],
              selectedNoteId: null,
              gridSize: 20,
              showGrid: false,
              layoutMode: 'free',
              snapToGrid: true,
              density: 'normal',
            }
          };
        }
        
        // Versão atual, retornar como está
        return persistedState;
      }
    }
  )
);
