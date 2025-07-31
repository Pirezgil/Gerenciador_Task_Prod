import { syncedUpdate } from '../lib/syncManager';


// Sistema de energia simplificado - sem proteções excessivas

// ============================================================================
// TASKS STORE - Gerenciamento completo de tarefas com Protocolos Críticos
// PROTOCOLOS IMPLEMENTADOS: Baixa Energia, Decomposição, Incêndio
// ============================================================================

import { create } from 'zustand';
import { useEnergyStore } from './energyStore';
import type { EnergyBudget } from './energyStore';
import { useModalsStore } from './modalsStore';

import { useAuthStore } from './authStore';
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
  // Estados de modal movidos para modalsStore.ts
  
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
      
      
      // Actions - Energia
      canAddTask: (energyPoints) => {
        const state = get();
        const energyStore = useEnergyStore.getState();
        const usedEnergy = state.todayTasks
          .filter(task => task.status === 'pending' || task.status === 'done')
          .reduce((sum, task) => sum + task.energyPoints, 0);
        return energyStore.canPerformAction(energyPoints, usedEnergy);
      },
      
      getRemainingEnergy: () => {
        const state = get();
        const energyStore = useEnergyStore.getState();
        const usedEnergy = state.todayTasks
          .filter(task => task.status === 'pending' || task.status === 'done')
          .reduce((sum, task) => sum + task.energyPoints, 0);
        return energyStore.getRemainingEnergy(usedEnergy);
      },
      
      calculateEnergyBudget: () => {
        const state = get();
        const energyStore = useEnergyStore.getState();
        const usedEnergy = state.todayTasks
          .filter(task => task.status === 'pending' || task.status === 'done')
          .reduce((sum, task) => sum + task.energyPoints, 0);
        return energyStore.calculateBudget(usedEnergy);
      },

      // Actions - Navegação
      setCurrentPage: (page) => set({ currentPage: page }),
      setSelectedProjectId: (id) => set({ selectedProjectId: id }),
      
      // Actions - Tarefas (com Protocolo de Incêndio)
      addTaskToToday: (description, energyPoints, projectId) => {
        const state = get();
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
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
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
},

      
      moveTaskToToday: (projectId, taskId) => {
        const state = get();
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
},

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
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
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
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
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
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
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
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
},

      
      // Actions - Notas
      saveNote: (content) => {
        const state = get();
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
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
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
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
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
},

      
      // PROTOCOLO DE BAIXA ENERGIA: Adiar o dia inteiro
      postponeAllTasks: () => {
        const state = get();
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
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
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
},

      
      handleTriageChoice: (choice) => {
        const state = get();
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
},

      
      handleClassifyChoice: (type) => {
        const state = get();
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
},

      
      handleScheduleChoice: (when, date) => {
        const state = get();
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
},

      
      // Actions - Protocolos
      handleDecomposition: (request) => {
        const state = get();
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
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
  const energyStore = useEnergyStore.getState();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.canPerformAction(energyPoints, usedEnergy);
},


      
      getRemainingEnergy: () => {
        const state = get();
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
},

      
      // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
},

      
      // Actions - Sandbox Movível
      convertNotesToMovable: () => {
        const state = get();
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
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
        
        // Energia gerenciada pelo // Função movida para energyStore.ts
calculateEnergyBudget: () => {
  const energyStore = useEnergyStore.getState();
  const state = get();
  const usedEnergy = state.todayTasks
    .filter(task => task.status === 'pending' || task.status === 'done')
    .reduce((sum, task) => sum + task.energyPoints, 0);
  return energyStore.calculateBudget(usedEnergy);
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
