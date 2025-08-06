import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEnergyStore, type EnergyBudget } from './energyStore';
import { useModalsStore } from './modalsStore';
import { useNotesStore } from './notesStore';
import type { Task, Project, Comment } from '@/types/task';
import type { CaptureState } from '@/types';

// ============================================================================
// TASKS STORE - Versão Refatorada e Simplificada
// ============================================================================

interface TasksState {
  todayTasks: Task[];
  projects: Project[];
  postponedTasks: Task[]; // Usando o tipo Task diretamente
  lastCompletedTask: Task | null; // Rastreia a última tarefa para celebrações
  selectedProjectId: string | null; // Rastreia o projeto selecionado para expandir/recolher
  
  // Capture System
  captureState: CaptureState;
  showCaptureModal: boolean;

  // Ações
  addTaskToProject: (projectId: string, description: string, energyPoints: 1 | 3 | 5, deadline?: string) => void;
  editProjectTask: (projectId: string, taskId: string, description: string, energyPoints: 1 | 3 | 5) => void;
  deleteProjectTask: (projectId: string, taskId: string) => void;
  moveTaskToToday: (projectId: string, taskId: string) => void;
  updateProjectNotes: (projectId: string, notes: string) => void;
  setSelectedProjectId: (projectId: string | null) => void;
  addTask: (taskData: Omit<Task, 'id' | 'status' | 'createdAt'>) => boolean;
  completeTask: (taskId: string) => void;
  postponeTask: (taskId: string) => void;
  deleteTask: (taskId: string) => void;
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addComment: (taskId: string, comment: Omit<Comment, 'id' | 'createdAt'>) => void;
  clearLastCompletedTask: () => void; // Limpa o estado da celebração

  // Funções de cálculo (selectors)
  calculateEnergyBudget: () => EnergyBudget; 
  canAddTask: (energyCost: number) => boolean;
  getRemainingEnergy: () => number;
  addTaskToToday: (description: string, energyPoints: 1 | 3 | 5, projectId?: string) => boolean;
  removePostponedTask: (taskId: string) => void;
  
  // Capture System Actions
  resetCaptureState: () => void;
  updateCaptureState: (updates: Partial<CaptureState>) => void;
  handleCaptureSubmit: () => void;
  handleTriageChoice: (choice: 'sandbox' | 'task') => void;
  handleClassifyChoice: (classification: 'task' | 'project') => void;
  handleScheduleChoice: (schedule: 'today' | 'future', date?: string) => void;
  
  // Project Creation
  createProjectWithTasks: (data: { name: string; icon: string; color: string; tasks: string[] }) => void;
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      // Estado Inicial
      todayTasks: [],
      projects: [],
      postponedTasks: [],
      lastCompletedTask: null,
      selectedProjectId: null,
      
      // Capture System State
      captureState: {
        step: 'capture',
        content: '',
        selectedDate: '',
        type: undefined,
        classification: undefined,
      },
      showCaptureModal: false,

      // Implementação das Ações
      setSelectedProjectId: (projectId) => set({ selectedProjectId: projectId }),

      addTaskToProject: (projectId, description, energyPoints, deadline) => {
        const newTask: Task = {
          id: Date.now().toString(),
          description,
          energyPoints,
          status: 'pending',
          projectId,
          type: 'brick',
          createdAt: new Date().toISOString(),
          deadline,
          comments: [],
          attachments: [],
          history: [],
        };

        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, backlog: [...p.backlog, newTask] } : p
          ),
        }));
      },

      editProjectTask: (projectId, taskId, description, energyPoints) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  backlog: p.backlog.map((t) =>
                    t.id === taskId
                      ? { 
                          ...t, 
                          description, 
                          energyPoints,
                          history: [
                            ...(t.history || []),
                            {
                              id: Date.now().toString(),
                              field: 'description',
                              oldValue: t.description,
                              newValue: description,
                              timestamp: new Date().toISOString()
                            },
                            ...(t.energyPoints !== energyPoints ? [{
                              id: (Date.now() + 1).toString(),
                              field: 'energyPoints',
                              oldValue: t.energyPoints.toString(),
                              newValue: energyPoints.toString(),
                              timestamp: new Date().toISOString()
                            }] : [])
                          ]
                        }
                      : t
                  ),
                }
              : p
          ),
        }));
      },

      deleteProjectTask: (projectId, taskId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, backlog: p.backlog.filter((t) => t.id !== taskId) }
              : p
          ),
        }));
      },

      updateProjectNotes: (projectId, notes) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, sandboxNotes: notes } : p
          ),
        }));
      },

      moveTaskToToday: (projectId, taskId) => {
        const project = get().projects.find((p) => p.id === projectId);
        if (!project) return;

        const task = project.backlog.find((t) => t.id === taskId);
        if (!task) return;

        set((state) => ({
          todayTasks: [...state.todayTasks, task],
          projects: state.projects.map((p) =>
            p.id === projectId
              ? { ...p, backlog: p.backlog.filter((t) => t.id !== taskId) }
              : p
          ),
        }));
      },
      addTask: (taskData) => {
        const budget = get().calculateEnergyBudget();

        if (budget.remaining < taskData.energyPoints) {
          useModalsStore.getState().setShowLowEnergyModal(true);
          return false;
        }

        const newTask: Task = {
          ...taskData,
          id: Date.now().toString(),
          status: 'pending',
          type: 'task',
          createdAt: new Date().toISOString(),
          comments: [],
          attachments: [],
        };

        set((state) => ({ todayTasks: [...state.todayTasks, newTask] }));
        return true;
      },

      addComment: (taskId, commentData) => {
        const newComment: Comment = {
          ...commentData,
          id: Date.now().toString(),
          createdAt: new Date().toISOString(),
        };
        const task = get().todayTasks.find(t => t.id === taskId) || get().postponedTasks.find(t => t.id === taskId);
        if (task) {
          get().updateTask(taskId, { comments: [...task.comments, newComment] });
        }
      },

      updateTask: (taskId, updates) => {
        set((state) => {
          // Primeiro, procura nas tarefas do dia e adiadas
          const taskInTodayTasks = state.todayTasks.find((t) => t.id === taskId);
          const taskInPostponed = state.postponedTasks.find((t) => t.id === taskId);
          
          if (taskInTodayTasks || taskInPostponed) {
            const taskToUpdate = taskInTodayTasks || taskInPostponed;
            const updatedTask = { ...taskToUpdate, ...updates };

            return {
              todayTasks: state.todayTasks.map((t) => (t.id === taskId ? updatedTask : t)),
              postponedTasks: state.postponedTasks.map((t) => (t.id === taskId ? updatedTask : t)),
            };
          }

          // Se não encontrou, procura nos projetos
          let foundInProject = false;
          const updatedProjects = state.projects.map((project) => {
            const taskIndex = project.backlog.findIndex((t) => t.id === taskId);
            if (taskIndex !== -1) {
              foundInProject = true;
              const oldTask = project.backlog[taskIndex];
              const updatedTask = { ...oldTask, ...updates };
              
              // Adiciona histórico se necessário
              if (updates.description && updates.description !== oldTask.description) {
                updatedTask.history = [
                  ...(oldTask.history || []),
                  {
                    id: Date.now().toString(),
                    field: 'description',
                    oldValue: oldTask.description,
                    newValue: updates.description,
                    timestamp: new Date().toISOString()
                  }
                ];
              }
              
              if (updates.energyPoints && updates.energyPoints !== oldTask.energyPoints) {
                updatedTask.history = [
                  ...(updatedTask.history || oldTask.history || []),
                  {
                    id: (Date.now() + 1).toString(),
                    field: 'energyPoints',
                    oldValue: oldTask.energyPoints.toString(),
                    newValue: updates.energyPoints.toString(),
                    timestamp: new Date().toISOString()
                  }
                ];
              }

              if (updates.dueDate && updates.dueDate !== oldTask.dueDate) {
                updatedTask.history = [
                  ...(updatedTask.history || oldTask.history || []),
                  {
                    id: (Date.now() + 2).toString(),
                    field: 'dueDate',
                    oldValue: oldTask.dueDate || '',
                    newValue: updates.dueDate,
                    timestamp: new Date().toISOString()
                  }
                ];
              }

              const newBacklog = [...project.backlog];
              newBacklog[taskIndex] = updatedTask;
              return { ...project, backlog: newBacklog };
            }
            return project;
          });

          if (foundInProject) {
            return { ...state, projects: updatedProjects };
          }

          return state;
        });
      },

      completeTask: (taskId) => {
        const task = get().todayTasks.find((t) => t.id === taskId);
        if (task) {
            get().updateTask(taskId, { status: 'completed', completedAt: new Date().toISOString() });
            set({ lastCompletedTask: { ...task, status: 'completed' } });
        }
      },

      postponeTask: (taskId, reason?: string, newDate?: string) => {
        const task = get().todayTasks.find((t) => t.id === taskId);
        if (task) {
          const postponementCount = (task.postponementCount || 0) + 1;
          
          // Adicionar entrada no histórico
          const historyEntry = {
            id: Date.now().toString(),
            action: 'postponed' as const,
            timestamp: new Date().toISOString(),
            details: {
              reason: reason || 'Sem motivo especificado',
              newDate: newDate || 'Data não especificada',
              postponementCount
            }
          };

          const updatedTask = { 
            ...task, 
            status: 'postponed' as const, 
            postponedAt: new Date().toISOString(),
            postponementCount,
            postponementReason: reason,
            rescheduleDate: newDate,
            history: [...(task.history || []), historyEntry]
          };
          
          set((state) => ({
            todayTasks: state.todayTasks.filter((t) => t.id !== taskId),
            postponedTasks: [...state.postponedTasks, updatedTask],
          }));
        }
      },

      clearLastCompletedTask: () => set({ lastCompletedTask: null }),

      deleteTask: (taskId) => {
        set((state) => ({
          todayTasks: state.todayTasks.filter((t) => t.id !== taskId),
          postponedTasks: state.postponedTasks.filter((t) => t.id !== taskId),
        }));
      },

      // Implementação dos Selectors
      calculateEnergyBudget: () => {
        const energyStore = useEnergyStore.getState();
        const usedEnergy = get().todayTasks
          .filter(task => task.status === 'pending' || task.status === 'completed')
          .reduce((sum, task) => sum + task.energyPoints, 0);
        return energyStore.calculateBudget(usedEnergy);
      },

      canAddTask: (energyCost) => {
        return get().calculateEnergyBudget().remaining >= energyCost;
      },

      getRemainingEnergy: () => {
        return get().calculateEnergyBudget().remaining;
      },

      addTaskToToday: (description, energyPoints, projectId) => {
        const canAdd = get().canAddTask(energyPoints);
        if (canAdd) {
          get().addTask({ 
            description, 
            energyPoints, 
            projectId,
            type: 'brick', // Todas as tarefas criadas pelo addTaskToToday são tijolos
            comments: [], 
            attachments: [], 
            history: [] 
          });
          return true;
        }
        return false;
      },

      removePostponedTask: (taskId) => {
        set((state) => ({
          postponedTasks: state.postponedTasks.filter((t) => t.id !== taskId),
        }));
      },

      // Capture System Implementation
      resetCaptureState: () => {
        set({
          captureState: {
            step: 'capture',
            content: '',
            selectedDate: '',
            type: undefined,
            classification: undefined,
          },
          showCaptureModal: false,
        });
      },

      updateCaptureState: (updates) => {
        set((state) => ({
          captureState: { ...state.captureState, ...updates },
        }));
      },

      handleCaptureSubmit: () => {
        set((state) => ({
          captureState: { ...state.captureState, step: 'triage' },
        }));
      },

      handleTriageChoice: (choice) => {
        if (choice === 'sandbox') {
          const { content } = get().captureState;
          useNotesStore.getState().saveNote(content);
          get().resetCaptureState();
        } else {
          set((state) => ({
            captureState: { ...state.captureState, step: 'classify', type: choice },
          }));
        }
      },

      handleClassifyChoice: (classification) => {
        set((state) => ({
          captureState: { ...state.captureState, step: 'schedule', classification },
        }));
      },

      handleScheduleChoice: (schedule, date) => {
        const { content, classification } = get().captureState;
        
        if (schedule === 'today') {
          if (classification === 'task') {
            get().addTaskToToday(content, 3);
          } else {
            // TODO: Implementar criação de projeto
            console.log('Criando projeto:', content);
          }
        } else if (schedule === 'future' && date) {
          // TODO: Implementar agendamento futuro
          console.log('Agendando para:', date, content);
        }
        
        get().resetCaptureState();
      },

      // Project Creation Implementation
      createProjectWithTasks: (data) => {
        const projectId = Date.now().toString();
        const newProject: Project = {
          id: projectId,
          name: data.name,
          icon: data.icon,
          color: data.color,
          status: 'active',
          sandboxNotes: '',
          backlog: data.tasks.map((description, index) => ({
            id: `${Date.now()}_${index}`,
            description,
            energyPoints: 3 as const,
            status: 'pending' as const,
            projectId: projectId,
            type: 'brick' as const,
            createdAt: new Date().toISOString(),
            comments: [],
            attachments: [],
            history: [],
          })),
        };

        set((state) => ({
          projects: [...state.projects, newProject],
        }));
      },
    }),
    {
      name: 'gerenciador-tasks-store',
      version: 1,
    }
  )
);
