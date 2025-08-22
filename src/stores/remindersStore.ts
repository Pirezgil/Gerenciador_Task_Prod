// ============================================================================
// REMINDERS STORE - Gerenciamento de estado local dos lembretes
// ============================================================================

import { create } from 'zustand';
import type { ReminderFormData } from '@/types/reminder';

interface RemindersState {
  // Estados do formulário de lembrete
  showReminderModal: boolean;
  editingReminderId: string | null;
  reminderFormData: ReminderFormData;
  
  // Estados de notificação
  notificationPermission: NotificationPermission;
  lastNotificationCheck: string | null;
  
  // Actions - Modal
  setShowReminderModal: (show: boolean) => void;
  openReminderModal: (reminderId?: string) => void;
  closeReminderModal: () => void;
  
  // Actions - Formulário
  setReminderFormData: (data: Partial<ReminderFormData>) => void;
  resetReminderForm: () => void;
  
  // Actions - Notificações
  requestNotificationPermission: () => Promise<NotificationPermission>;
  setNotificationPermission: (permission: NotificationPermission) => void;
  updateLastNotificationCheck: () => void;
  
  // Actions - Utilitários
  formatScheduledTime: (time: string) => string;
  getDayNames: (daysOfWeek: number[]) => string[];
  getNotificationTypeLabels: (types: ('push' | 'email' | 'sms')[]) => string[];
}

const defaultReminderFormData: ReminderFormData = {
  enabled: false,
  type: 'scheduled',
  scheduledTime: '08:00',
  minutesBefore: 15,
  daysOfWeek: [],
  notificationTypes: ['push'],
  message: '',
  intervalEnabled: false,
  intervalMinutes: 30,
  intervalStartTime: '09:00',
  intervalEndTime: '18:00'
};

export const useRemindersStore = create<RemindersState>((set, get) => ({
  // Estados iniciais
  showReminderModal: false,
  editingReminderId: null,
  reminderFormData: defaultReminderFormData,
  notificationPermission: typeof window !== 'undefined' ? Notification?.permission || 'default' : 'default',
  lastNotificationCheck: null,

  // Actions - Modal
  setShowReminderModal: (show) => {
    set({ showReminderModal: show });
    if (!show) {
      get().resetReminderForm();
    }
  },

  openReminderModal: (reminderId) => {
    set({ 
      showReminderModal: true, 
      editingReminderId: reminderId || null 
    });
  },

  closeReminderModal: () => {
    set({ 
      showReminderModal: false, 
      editingReminderId: null 
    });
    get().resetReminderForm();
  },

  // Actions - Formulário
  setReminderFormData: (data) => {
    set((state) => ({
      reminderFormData: { ...state.reminderFormData, ...data }
    }));
  },

  resetReminderForm: () => {
    set({ reminderFormData: defaultReminderFormData });
  },

  // Actions - Notificações
  requestNotificationPermission: async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return 'denied';
    }

    const permission = await Notification.requestPermission();
    set({ notificationPermission: permission });
    return permission;
  },

  setNotificationPermission: (permission) => {
    set({ notificationPermission: permission });
  },

  updateLastNotificationCheck: () => {
    set({ lastNotificationCheck: new Date().toISOString() });
  },

  // Actions - Utilitários
  formatScheduledTime: (time) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
    return `${displayHour}:${minutes} ${period}`;
  },

  getDayNames: (daysOfWeek) => {
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    return daysOfWeek.map(day => dayNames[day]);
  },

  getNotificationTypeLabels: (types) => {
    const labels = {
      push: '🔔 Push',
      email: '📧 Email',
      sms: '📱 SMS'
    };
    return types.map(type => labels[type]);
  }
}));

// ============================================================================
// UTILITY FUNCTIONS - Funções auxiliares para lembretes
// ============================================================================

export const reminderUtils = {
  // Validar se um horário está no formato correto
  isValidTime: (time: string): boolean => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  },

  // Calcular próxima execução de um lembrete
  getNextExecution: (type: 'before_due' | 'scheduled' | 'recurring', scheduledTime?: string, daysOfWeek?: number[]): Date | null => {
    const now = new Date();
    
    if (type === 'scheduled' && scheduledTime) {
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const next = new Date(now);
      next.setHours(hours, minutes, 0, 0);
      
      if (next <= now) {
        next.setDate(next.getDate() + 1);
      }
      
      return next;
    }
    
    if (type === 'recurring' && scheduledTime && daysOfWeek && daysOfWeek.length > 0) {
      const [hours, minutes] = scheduledTime.split(':').map(Number);
      const currentDay = now.getDay();
      
      // Encontrar próximo dia da semana
      let nextDay = daysOfWeek.find(day => day > currentDay);
      if (!nextDay) {
        nextDay = daysOfWeek[0]; // Próxima semana
      }
      
      const daysUntilNext = nextDay > currentDay ? nextDay - currentDay : 7 + nextDay - currentDay;
      const next = new Date(now);
      next.setDate(now.getDate() + daysUntilNext);
      next.setHours(hours, minutes, 0, 0);
      
      return next;
    }
    
    return null;
  },

  // Converter dias da semana em texto legível
  formatDaysOfWeek: (daysOfWeek: number[]): string => {
    if (daysOfWeek.length === 0) return 'Nenhum dia';
    if (daysOfWeek.length === 7) return 'Todos os dias';
    
    const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const sortedDays = [...daysOfWeek].sort();
    
    // Detectar padrões comuns
    const weekdays = [1, 2, 3, 4, 5];
    const weekend = [0, 6];
    
    if (sortedDays.every(day => weekdays.includes(day)) && sortedDays.length === 5) {
      return 'Dias úteis';
    }
    
    if (sortedDays.every(day => weekend.includes(day)) && sortedDays.length === 2) {
      return 'Final de semana';
    }
    
    return sortedDays.map(day => dayNames[day]).join(', ');
  },

  // Validar dados do formulário de lembrete
  validateReminderForm: (data: ReminderFormData): string[] => {
    const errors: string[] = [];
    
    if (!data.enabled) return errors; // Se não habilitado, não validar
    
    if (!data.notificationTypes || data.notificationTypes.length === 0) {
      errors.push('Selecione pelo menos um tipo de notificação');
    }
    
    if (data.type === 'before_due' && (!data.minutesBefore || data.minutesBefore < 1)) {
      errors.push('Informe quantos minutos antes do vencimento');
    }
    
    if ((data.type === 'scheduled' || data.type === 'recurring') && !reminderUtils.isValidTime(data.scheduledTime)) {
      errors.push('Informe um horário válido no formato HH:MM');
    }
    
    if (data.type === 'recurring' && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
      errors.push('Selecione pelo menos um dia da semana para lembretes recorrentes');
    }
    
    if (data.message && data.message.length > 500) {
      errors.push('Mensagem não pode exceder 500 caracteres');
    }
    
    return errors;
  }
};