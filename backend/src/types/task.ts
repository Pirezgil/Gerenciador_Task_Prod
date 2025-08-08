export type TaskStatus = 'pending' | 'completed' | 'postponed';
export type TaskType = 'task' | 'brick';
export type TaskAction = 'created' | 'completed' | 'postponed' | 'rescheduled' | 'edited';

export interface CreateTaskRequest {
  description: string;
  energyPoints: 1 | 3 | 5;
  type?: TaskType;
  projectId?: string;
  dueDate?: string;
  isRecurring?: boolean;
  isAppointment?: boolean;
  externalLinks?: string[];
  comments?: CreateTaskCommentRequest[];
  attachments?: TaskAttachmentRequest[];
  recurrence?: CreateTaskRecurrenceRequest;
  appointment?: CreateTaskAppointmentRequest;
}

export interface UpdateTaskRequest {
  description?: string;
  status?: TaskStatus;
  energyPoints?: 1 | 3 | 5;
  type?: TaskType;
  projectId?: string;
  dueDate?: string;
  rescheduleDate?: string;
  isRecurring?: boolean;
  isAppointment?: boolean;
  plannedForToday?: boolean;
  plannedDate?: string;
  missedDaysCount?: number;
  externalLinks?: string[];
}

export interface TaskResponse {
  id: string;
  description: string;
  status: TaskStatus;
  energyPoints: number;
  type: TaskType;
  isRecurring: boolean;
  isAppointment: boolean;
  dueDate?: string;
  rescheduleDate?: string;
  postponementCount: number;
  postponementReason?: string;
  plannedForToday: boolean;
  plannedDate?: string;
  missedDaysCount: number;
  externalLinks: string[];
  createdAt: string;
  completedAt?: string;
  postponedAt?: string;
  updatedAt: string;
  project?: {
    id: string;
    name: string;
    icon: string;
    color: string;
  };
  comments: TaskCommentResponse[];
  attachments: TaskAttachmentResponse[];
  history: TaskHistoryResponse[];
  recurrence?: TaskRecurrenceResponse;
  appointment?: TaskAppointmentResponse;
  newAchievements?: Array<{
    id: string;
    type: string;
    subtype?: string;
    relatedId?: string;
    earnedAt: string;
    metadata?: any;
  }>;
}

export interface CreateTaskRecurrenceRequest {
  frequency: 'daily' | 'weekly' | 'custom';
  daysOfWeek?: number[];
}

export interface TaskRecurrenceResponse {
  id: string;
  frequency: string;
  daysOfWeek: number[];
  lastCompleted?: string;
  nextDue?: string;
}

export interface CreateTaskAppointmentRequest {
  scheduledTime: string;
  preparationTime?: number;
  location?: string;
  notes?: string;
  reminderTime?: number;
}

export interface TaskAppointmentResponse {
  id: string;
  scheduledTime: string;
  preparationTime: number;
  location?: string;
  notes?: string;
  reminderTime?: number;
}

export interface CreateTaskCommentRequest {
  author: string;
  content: string;
}

export interface TaskCommentResponse {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}

export interface TaskAttachmentResponse {
  id: string;
  name: string;
  url: string;
  type: string;
  size: string;
  uploadedAt: string;
}

export interface PostponeTaskRequest {
  reason?: string;
  newDate?: string;
}

export interface CompleteTaskRequest {
  completedAt?: string;
}

export interface TaskHistoryResponse {
  id: string;
  field: string;
  oldValue: string;
  newValue: string;
  timestamp: string;
}

export interface TaskAttachmentRequest {
  name: string;
  url: string;
  type: string;
  size: string;
}

export interface EnergyBudgetResponse {
  used: number;
  remaining: number;
  total: number;
  completedTasks: number;
}