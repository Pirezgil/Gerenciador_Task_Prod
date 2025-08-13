export interface Reminder {
  id: string;
  userId: string;
  entityId?: string;
  entityType: 'task' | 'habit' | 'standalone';
  type: 'before_due' | 'scheduled' | 'recurring';
  scheduledTime?: string;
  minutesBefore?: number;
  daysOfWeek: number[];
  notificationTypes: ('push' | 'email' | 'sms')[];
  message?: string;
  isActive: boolean;
  lastSentAt?: string;
  nextScheduledAt?: string;
  
  // Novos campos para suporte aos intervalos
  intervalEnabled: boolean;
  intervalMinutes?: number;
  intervalStartTime?: string;
  intervalEndTime?: string;
  
  // Campo para identificar sub-tipo de lembrete
  subType?: 'main' | 'interval' | 'prepare' | 'urgent';
  parentReminderId?: string;
  
  createdAt: string;
  updatedAt: string;
}

export interface CreateReminderData {
  entityId?: string;
  entityType: 'task' | 'habit' | 'standalone';
  type: 'before_due' | 'scheduled' | 'recurring';
  scheduledTime?: string;
  minutesBefore?: number;
  daysOfWeek?: number[];
  notificationTypes: ('push' | 'email' | 'sms')[];
  message?: string;
  isActive?: boolean;
  
  // Novos campos para intervalos
  intervalEnabled?: boolean;
  intervalMinutes?: number;
  intervalStartTime?: string;
  intervalEndTime?: string;
  
  // Sub-tipo de lembrete
  subType?: 'main' | 'interval' | 'prepare' | 'urgent';
  parentReminderId?: string;
}

export interface UpdateReminderData {
  type?: 'before_due' | 'scheduled' | 'recurring';
  scheduledTime?: string;
  minutesBefore?: number;
  daysOfWeek?: number[];
  notificationTypes?: ('push' | 'email' | 'sms')[];
  message?: string;
  isActive?: boolean;
  
  // Novos campos para intervalos
  intervalEnabled?: boolean;
  intervalMinutes?: number;
  intervalStartTime?: string;
  intervalEndTime?: string;
  
  // Sub-tipo de lembrete
  subType?: 'main' | 'interval' | 'prepare' | 'urgent';
  parentReminderId?: string;
}

export interface ReminderFormData {
  enabled: boolean;
  type: 'before_due' | 'scheduled' | 'recurring';
  scheduledTime: string;
  minutesBefore: number;
  daysOfWeek: number[];
  notificationTypes: ('push' | 'email' | 'sms')[];
  message: string;
  
  // Novos campos para intervalos
  intervalEnabled: boolean;
  intervalMinutes: number;
  intervalStartTime: string;
  intervalEndTime: string;
}

export interface ReminderFilter {
  entityType?: 'task' | 'habit' | 'standalone';
  entityId?: string;
  type?: 'before_due' | 'scheduled' | 'recurring';
  isActive?: boolean;
}

// Tipos específicos para diferentes configurações de lembretes

export interface TaskReminderConfig {
  enabled: boolean;
  reminderDate: string; // "YYYY-MM-DD"
  reminderTime: string; // "HH:MM"
  notificationTypes: ('push' | 'email')[];
  message?: string; // Mensagem personalizada opcional
}

export interface RecurringTaskReminderConfig {
  enabled: boolean;
  recurrenceType: 'daily' | 'specific_days';
  daysOfWeek: number[]; // [0,1,2,3,4,5,6] onde 0=domingo
  reminderTime: string; // "08:00"
  
  // Lembretes em intervalo
  intervalEnabled: boolean;
  intervalMinutes: number; // 30, 60, etc.
  intervalStartTime: string; // "09:00"
  intervalEndTime: string; // "18:00"
  notificationTypes: ('push' | 'email')[];
}

export interface HabitReminderConfig {
  enabled: boolean;
  recurrenceType: 'daily' | 'specific_days';
  daysOfWeek: number[];
  reminderTime: string;
  
  // Lembretes em intervalo (igual às tarefas recorrentes)
  intervalEnabled: boolean;
  intervalMinutes: number;
  intervalStartTime: string;
  intervalEndTime: string;
  notificationTypes: ('push' | 'email')[];
}

export interface AppointmentAutoReminder {
  // Calculado automaticamente
  prepareReminder: {
    time: string; // compromisso - (2 * preparationTime + 10min)
    message: string;
    type: 'prepare';
  };
  urgentReminder: {
    time: string; // compromisso - (2 * preparationTime)
    message: string;
    type: 'urgent';
  };
}