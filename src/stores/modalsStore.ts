// ============================================================================
// MODALS STORE - Gerenciamento especializado de modals
// Extraído do tasksStore.ts para resolver conflitos de estado
// ============================================================================

import { create } from 'zustand';
import type { Task, Note, TaskEditModalState } from '@/types';

interface ModalsState {
  // Estados de Modal
  showCaptureModal: boolean;
  showLowEnergyModal: boolean;
  showDecompositionModal: Task | null;
  showTransformModal: Note | null;
  showEmergencyModal: boolean;
  showNewProjectModal: boolean;
  showNewTaskModal: boolean;
  preselectedProjectId: string | undefined; // Para pré-selecionar projeto
  transformedNote: Note | null; // Para passar a nota entre modais
  taskEditModal: TaskEditModalState;
  
  // Actions - Modais básicos
  setShowCaptureModal: (show: boolean) => void;
  setShowLowEnergyModal: (show: boolean) => void;
  setShowDecompositionModal: (task: Task | null) => void;
  setShowTransformModal: (note: Note | null) => void;
  setShowEmergencyModal: (show: boolean) => void;
  openNewProjectModal: (show: boolean) => void;
  setShowNewTaskModal: (show: boolean) => void;
  openNewTaskModal: (show: boolean, projectId?: string) => void;
  setTransformedNote: (note: Note | null) => void; // Para armazenar a nota sendo transformada
  
  // Actions - Modal de edição
  openTaskEditModal: (task: Task) => void;
  setTaskEditModal: (state: TaskEditModalState) => void;
  updateTaskEditData: (updates: Partial<TaskEditModalState['editData']>) => void;
  closeTaskEditModal: () => void;
  
  // Utilities
  closeAllModals: () => void;
}

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

export const useModalsStore = create<ModalsState>()((set) => ({
  // Estados iniciais
  showCaptureModal: false,
  showLowEnergyModal: false,
  showDecompositionModal: null,
  showTransformModal: null,
  showEmergencyModal: false,
  showNewProjectModal: false,
  showNewTaskModal: false,
  preselectedProjectId: undefined, // Estado inicial
  transformedNote: null, // Estado inicial para nota transformada
  taskEditModal: initialTaskEditModal,
  
  // Actions - Modais básicos
  setShowCaptureModal: (show) => set({ showCaptureModal: show }),
  setShowLowEnergyModal: (show) => set({ showLowEnergyModal: show }),
  setShowDecompositionModal: (task) => set({ showDecompositionModal: task }),
  setShowTransformModal: (note) => set({ showTransformModal: note }),
  setShowEmergencyModal: (show) => set({ showEmergencyModal: show }),
  openNewProjectModal: (show) => set({ showNewProjectModal: show }),
  setShowNewTaskModal: (show) => set({ showNewTaskModal: show }),
  openNewTaskModal: (show, projectId) => set({ showNewTaskModal: show, preselectedProjectId: projectId }),
  setTransformedNote: (note) => set({ transformedNote: note }), // Implementação para armazenar nota transformada
  
  // Actions - Modal de edição
  openTaskEditModal: (task) => set({
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
  }),
  
  setTaskEditModal: (state) => set({ taskEditModal: state }),
  
  updateTaskEditData: (updates) => set((prevState) => ({
    taskEditModal: {
      ...prevState.taskEditModal,
      editData: { ...prevState.taskEditModal.editData, ...updates },
    },
  })),
  
  closeTaskEditModal: () => set({ taskEditModal: initialTaskEditModal }),
  
  // Utilities
  closeAllModals: () => {
    set({
      showCaptureModal: false,
      showLowEnergyModal: false,
      showDecompositionModal: null,
      showTransformModal: null,
      showEmergencyModal: false,
      showNewProjectModal: false,
      showNewTaskModal: false,
      preselectedProjectId: undefined,
      transformedNote: null,
      taskEditModal: initialTaskEditModal,
    });
  },
}));
