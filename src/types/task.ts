// ============================================================================
// TIPOS DE TAREFA - Definições centrais para tarefas e projetos
// ============================================================================

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: string; // ex: 'image/png', 'application/pdf'
  size: number;
  uploadedAt: string;
}

export interface Comment {
  id: string;
  author: string; // Ou um tipo User mais complexo
  content: string;
  createdAt: string;
}

export interface HistoryEntry {
  id: string;
  action: 'created' | 'completed' | 'postponed' | 'rescheduled' | 'edited';
  timestamp: string;
  details?: {
    reason?: string;
    newDate?: string;
    postponementCount?: number;
    field?: string;
    oldValue?: unknown;
    newValue?: unknown;
  };
}

export interface Task {
  id: string;
  description: string;
  status: 'pending' | 'completed' | 'postponed';
  energyPoints: 1 | 3 | 5;
  projectId?: string;
  type?: 'task' | 'brick';
  isRecurring?: boolean;
  recurrence?: RecurrenceConfig;
  isAppointment?: boolean;
  appointment?: AppointmentConfig;
  createdAt: string;
  completedAt?: string;
  postponedAt?: string;
  postponementCount?: number;
  postponementReason?: string;
  rescheduleDate?: string;
  dueDate?: string;
  comments: Comment[];
  attachments: Attachment[];
  history: HistoryEntry[];
  externalLinks?: string[];
}

export interface AppointmentConfig {
  scheduledTime: string; // HH:MM
  preparationTime: number; // minutos necessários para se preparar
  location?: string;
  notes?: string;
  reminderTime?: number; // minutos antes para lembrete
}

export interface RecurrenceConfig {
  frequency: 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[]; // 0-6 (domingo a sábado)
  lastCompleted?: string;
  nextDue?: string;
}

export interface Project {
  id: string;
  name: string;
  icon: string;
  color: string;
  status?: 'active' | 'completed' | 'archived' | 'planning';
  deadline?: string;
  sandboxNotes?: string;
  backlog: Task[];
}
