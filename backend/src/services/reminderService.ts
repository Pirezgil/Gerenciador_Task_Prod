import { prisma } from '../app';
import { 
  CreateReminderRequest, 
  UpdateReminderRequest, 
  ReminderResponse,
  ReminderFilter,
  TaskReminderConfig,
  RecurringTaskReminderConfig,
  HabitReminderConfig,
  AppointmentAutoReminder
} from '../types/reminder';
import {
  ReminderValidationError,
  ReminderLimitError,
  ReminderNotFoundError
} from '../lib/errors';
import { ReminderCalculator } from './reminderCalculator';

// ===== FUNÇÕES AUXILIARES =====

/**
 * Conta lembretes efetivos para uma entidade, considerando que lembretes intervalados 
 * devem contar como um só, independente de quantos horários tenham
 */
const countEffectiveReminders = async (userId: string, entityId: string): Promise<number> => {
  const existingReminders = await prisma.reminder.findMany({
    where: {
      userId,
      entityId,
      isActive: true
    },
    select: {
      id: true,
      intervalEnabled: true,
      subType: true,
      parentReminderId: true
    }
  });

  let effectiveCount = 0;
  const intervalGroups = new Set<string>();

  for (const reminder of existingReminders) {
    if (reminder.intervalEnabled || reminder.subType === 'interval') {
      // Lembrete intervalado: agrupar por parentReminderId ou próprio ID
      const groupId = reminder.parentReminderId || reminder.id;
      intervalGroups.add(groupId);
    } else {
      // Lembrete individual: conta normalmente
      effectiveCount++;
    }
  }

  // Adicionar grupos de lembretes intervalados (cada grupo conta como 1)
  effectiveCount += intervalGroups.size;

  console.log(`🔍 DEBUG - Lembretes para ${entityId}: ${existingReminders.length} total, ${effectiveCount} efetivos (intervalados agrupados)`);
  
  return effectiveCount;
};

// ===== FUNÇÕES PRINCIPAIS =====

export const getUserReminders = async (userId: string, filters?: ReminderFilter): Promise<ReminderResponse[]> => {
  const whereClause: any = { 
    userId,
    isActive: true
  };

  if (filters?.entityType) {
    whereClause.entityType = filters.entityType;
  }
  if (filters?.entityId) {
    whereClause.entityId = filters.entityId;
  }
  if (filters?.type) {
    whereClause.type = filters.type;
  }
  if (filters?.isActive !== undefined) {
    whereClause.isActive = filters.isActive;
  }

  const reminders = await prisma.reminder.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' }
  });

  return reminders.map(reminder => ({
    id: reminder.id,
    userId: reminder.userId,
    entityId: reminder.entityId ?? undefined,
    entityType: reminder.entityType as any,
    type: reminder.type as any,
    scheduledTime: reminder.scheduledTime ?? undefined,
    minutesBefore: reminder.minutesBefore ?? undefined,
    daysOfWeek: reminder.daysOfWeek,
    notificationTypes: reminder.notificationTypes,
    message: reminder.message ?? undefined,
    isActive: reminder.isActive,
    lastSentAt: reminder.lastSentAt?.toISOString(),
    nextScheduledAt: reminder.nextScheduledAt?.toISOString(),
    intervalEnabled: reminder.intervalEnabled,
    intervalMinutes: reminder.intervalMinutes ?? undefined,
    intervalStartTime: reminder.intervalStartTime ?? undefined,
    intervalEndTime: reminder.intervalEndTime ?? undefined,
    subType: reminder.subType as any,
    parentReminderId: reminder.parentReminderId ?? undefined,
    createdAt: reminder.createdAt.toISOString(),
    updatedAt: reminder.updatedAt.toISOString()
  }));
};

export const createReminder = async (userId: string, data: CreateReminderRequest): Promise<ReminderResponse> => {
  console.log('🔧 DEBUG - createReminder recebeu:', {
    userId,
    data: JSON.stringify(data, null, 2),
    intervalEnabled: data.intervalEnabled,
    subType: data.subType,
    intervalMinutes: data.intervalMinutes,
    intervalStartTime: data.intervalStartTime,
    intervalEndTime: data.intervalEndTime
  });

  // SECURITY: Rate limiting por usuário - máximo 100 lembretes ativos
  const totalUserReminders = await prisma.reminder.count({
    where: {
      userId,
      isActive: true
    }
  });

  console.log(`🛡️  SECURITY CHECK - Total de lembretes ativos para usuário ${userId}: ${totalUserReminders}`);
  
  if (totalUserReminders >= 100) {
    console.log('🚫 SECURITY BLOCK - Rate limit atingido para usuário');
    throw new ReminderLimitError(100, `usuário ${userId}`);
  }

  // Validações específicas por tipo de lembrete
  if (data.type === 'scheduled' && !data.scheduledTime) {
    throw new ReminderValidationError('scheduledTime é obrigatório para lembretes do tipo scheduled', 'scheduledTime');
  }
  if (data.type === 'recurring' && (!data.daysOfWeek || data.daysOfWeek.length === 0)) {
    throw new ReminderValidationError('daysOfWeek é obrigatório para lembretes do tipo recurring', 'daysOfWeek');
  }
  if (data.type === 'before_due' && !data.minutesBefore) {
    throw new ReminderValidationError('minutesBefore é obrigatório para lembretes do tipo before_due', 'minutesBefore');
  }

  // Validar limite de lembretes por entidade (máximo 5)
  // CORREÇÃO: Lembretes intervalados devem contar como um só
  if (data.entityId) {
    const effectiveCount = await countEffectiveReminders(userId, data.entityId);
    
    if (effectiveCount >= 5) {
      console.log('🚫 LIMITE ATINGIDO - Rejeitando criação');
      throw new ReminderLimitError(5, data.entityId);
    }
  }

  // Calcular nextScheduledAt baseado no tipo
  let nextScheduledAt: Date | undefined;
  
  if (data.type === 'scheduled' && data.scheduledTime) {
    const now = new Date();
    const [hours, minutes] = data.scheduledTime.split(':').map(Number);
    nextScheduledAt = new Date(now);
    nextScheduledAt.setHours(hours, minutes, 0, 0);
    
    // Se o horário já passou hoje, agendar para amanhã
    if (nextScheduledAt <= now) {
      nextScheduledAt.setDate(nextScheduledAt.getDate() + 1);
    }
  } else if (data.type === 'recurring' && data.daysOfWeek && data.daysOfWeek.length > 0) {
    const now = new Date();
    const currentDay = now.getDay();
    
    // CORREÇÃO: Verificar se hoje é um dia válido e se o horário ainda não passou
    let nextDay: number;
    let daysUntilNext: number;
    
    if (data.daysOfWeek.includes(currentDay) && data.scheduledTime) {
      // Se hoje é um dia válido, verificar se o horário ainda não passou
      const [hours, minutes] = data.scheduledTime.split(':').map(Number);
      const todayScheduledTime = new Date(now);
      todayScheduledTime.setHours(hours, minutes, 0, 0);
      
      if (todayScheduledTime > now) {
        // Horário ainda não passou hoje - usar hoje
        nextDay = currentDay;
        daysUntilNext = 0;
      } else {
        // Horário já passou hoje - encontrar próximo dia
        nextDay = data.daysOfWeek.find(day => day > currentDay) || data.daysOfWeek[0];
        daysUntilNext = nextDay > currentDay ? nextDay - currentDay : 7 + nextDay - currentDay;
      }
    } else {
      // Hoje não é um dia válido - encontrar próximo dia
      nextDay = data.daysOfWeek.find(day => day > currentDay) || data.daysOfWeek[0];
      daysUntilNext = nextDay > currentDay ? nextDay - currentDay : 7 + nextDay - currentDay;
    }
    
    nextScheduledAt = new Date(now);
    nextScheduledAt.setDate(now.getDate() + daysUntilNext);
    
    if (data.scheduledTime) {
      const [hours, minutes] = data.scheduledTime.split(':').map(Number);
      nextScheduledAt.setHours(hours, minutes, 0, 0);
    } else {
      nextScheduledAt.setHours(9, 0, 0, 0); // Horário padrão 9h
    }
  } else if (data.type === 'before_due' && data.minutesBefore && data.entityId) {
    // Para lembretes before_due, precisa buscar a data de vencimento da tarefa/hábito
    try {
      let dueDateQuery;
      if (data.entityType === 'task') {
        dueDateQuery = await prisma.task.findUnique({
          where: { id: data.entityId },
          select: { dueDate: true }
        });
      } else if (data.entityType === 'habit') {
        dueDateQuery = await prisma.habit.findUnique({
          where: { id: data.entityId },
          select: { createdAt: true }
        });
      }
      
      if (dueDateQuery) {
        const dueDate = data.entityType === 'task' ? (dueDateQuery as any).dueDate : (dueDateQuery as any).createdAt;
        if (dueDate) {
          nextScheduledAt = new Date(dueDate);
          nextScheduledAt.setMinutes(nextScheduledAt.getMinutes() - data.minutesBefore);
        }
      }
    } catch (error) {
      console.warn(`Erro ao buscar data de vencimento para ${data.entityType} ${data.entityId}:`, error);
    }
  }

  // CORREÇÃO: Quando intervalEnabled=true, forçar subType='interval' e ajustar lógica
  console.log('🔧 DEBUG - Verificando subType:', {
    intervalEnabled: data.intervalEnabled,
    subType: data.subType,
    tipoSubType: typeof data.subType,
    isUndefined: data.subType === undefined,
    isNull: data.subType === null,
    isEmpty: !data.subType
  });
  
  if (data.intervalEnabled && (!data.subType || data.subType === null || data.subType === undefined)) {
    console.log('🔧 LOGIC - Lembrete intervalado detectado, definindo subType=interval');
    data.subType = 'interval';
    console.log('🔧 LOGIC - subType definido como:', data.subType);
  }

  console.log('🔧 DEBUG - Dados antes do Prisma.create:', {
    intervalEnabled: data.intervalEnabled,
    subType: data.subType,
    intervalMinutes: data.intervalMinutes,
    intervalStartTime: data.intervalStartTime,
    intervalEndTime: data.intervalEndTime,
    parentReminderId: data.parentReminderId
  });

  const reminder = await prisma.reminder.create({
    data: {
      userId,
      entityId: data.entityId,
      entityType: data.entityType,
      type: data.type,
      scheduledTime: data.scheduledTime,
      minutesBefore: data.minutesBefore,
      daysOfWeek: data.daysOfWeek || [],
      notificationTypes: data.notificationTypes,
      message: data.message,
      isActive: data.isActive ?? true,
      intervalEnabled: data.intervalEnabled ?? false,
      intervalMinutes: data.intervalMinutes,
      intervalStartTime: data.intervalStartTime,
      intervalEndTime: data.intervalEndTime,
      subType: data.subType,
      parentReminderId: data.parentReminderId,
      nextScheduledAt
    }
  });

  console.log('🔧 DEBUG - Reminder criado no banco:', {
    id: reminder.id,
    intervalEnabled: reminder.intervalEnabled,
    subType: reminder.subType,
    intervalMinutes: reminder.intervalMinutes,
    intervalStartTime: reminder.intervalStartTime,
    intervalEndTime: reminder.intervalEndTime
  });

  return {
    id: reminder.id,
    userId: reminder.userId,
    entityId: reminder.entityId ?? undefined,
    entityType: reminder.entityType as any,
    type: reminder.type as any,
    scheduledTime: reminder.scheduledTime ?? undefined,
    minutesBefore: reminder.minutesBefore ?? undefined,
    daysOfWeek: reminder.daysOfWeek,
    notificationTypes: reminder.notificationTypes,
    message: reminder.message ?? undefined,
    isActive: reminder.isActive,
    lastSentAt: reminder.lastSentAt?.toISOString(),
    nextScheduledAt: reminder.nextScheduledAt?.toISOString(),
    intervalEnabled: reminder.intervalEnabled,
    intervalMinutes: reminder.intervalMinutes ?? undefined,
    intervalStartTime: reminder.intervalStartTime ?? undefined,
    intervalEndTime: reminder.intervalEndTime ?? undefined,
    subType: reminder.subType as any,
    parentReminderId: reminder.parentReminderId ?? undefined,
    createdAt: reminder.createdAt.toISOString(),
    updatedAt: reminder.updatedAt.toISOString()
  };
};

export const updateReminder = async (userId: string, reminderId: string, data: UpdateReminderRequest): Promise<ReminderResponse> => {
  // Verificar se o lembrete pertence ao usuário
  const existingReminder = await prisma.reminder.findFirst({
    where: { id: reminderId, userId }
  });

  if (!existingReminder) {
    throw new ReminderNotFoundError(reminderId);
  }

  // Recalcular nextScheduledAt se necessário
  let nextScheduledAt: Date | undefined = existingReminder.nextScheduledAt ?? undefined;
  
  if (data.scheduledTime && (data.type === 'scheduled' || existingReminder.type === 'scheduled')) {
    const now = new Date();
    const [hours, minutes] = data.scheduledTime.split(':').map(Number);
    nextScheduledAt = new Date(now);
    nextScheduledAt.setHours(hours, minutes, 0, 0);
    
    if (nextScheduledAt <= now) {
      nextScheduledAt.setDate(nextScheduledAt.getDate() + 1);
    }
  }

  const reminder = await prisma.reminder.update({
    where: { id: reminderId },
    data: {
      type: data.type,
      scheduledTime: data.scheduledTime,
      minutesBefore: data.minutesBefore,
      daysOfWeek: data.daysOfWeek,
      notificationTypes: data.notificationTypes,
      message: data.message,
      isActive: data.isActive,
      intervalEnabled: data.intervalEnabled,
      intervalMinutes: data.intervalMinutes,
      intervalStartTime: data.intervalStartTime,
      intervalEndTime: data.intervalEndTime,
      subType: data.subType,
      parentReminderId: data.parentReminderId,
      nextScheduledAt,
      updatedAt: new Date()
    }
  });

  return {
    id: reminder.id,
    userId: reminder.userId,
    entityId: reminder.entityId ?? undefined,
    entityType: reminder.entityType as any,
    type: reminder.type as any,
    scheduledTime: reminder.scheduledTime ?? undefined,
    minutesBefore: reminder.minutesBefore ?? undefined,
    daysOfWeek: reminder.daysOfWeek,
    notificationTypes: reminder.notificationTypes,
    message: reminder.message ?? undefined,
    isActive: reminder.isActive,
    lastSentAt: reminder.lastSentAt?.toISOString(),
    nextScheduledAt: reminder.nextScheduledAt?.toISOString(),
    intervalEnabled: reminder.intervalEnabled,
    intervalMinutes: reminder.intervalMinutes ?? undefined,
    intervalStartTime: reminder.intervalStartTime ?? undefined,
    intervalEndTime: reminder.intervalEndTime ?? undefined,
    subType: reminder.subType as any,
    parentReminderId: reminder.parentReminderId ?? undefined,
    createdAt: reminder.createdAt.toISOString(),
    updatedAt: reminder.updatedAt.toISOString()
  };
};

export const deleteReminder = async (userId: string, reminderId: string): Promise<void> => {
  const existingReminder = await prisma.reminder.findFirst({
    where: { id: reminderId, userId }
  });

  if (!existingReminder) {
    throw new ReminderNotFoundError(reminderId);
  }

  await prisma.reminder.delete({
    where: { id: reminderId }
  });
};

export const getReminder = async (userId: string, reminderId: string): Promise<ReminderResponse> => {
  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, userId }
  });

  if (!reminder) {
    throw new ReminderNotFoundError(reminderId);
  }

  return {
    id: reminder.id,
    userId: reminder.userId,
    entityId: reminder.entityId ?? undefined,
    entityType: reminder.entityType as any,
    type: reminder.type as any,
    scheduledTime: reminder.scheduledTime ?? undefined,
    minutesBefore: reminder.minutesBefore ?? undefined,
    daysOfWeek: reminder.daysOfWeek,
    notificationTypes: reminder.notificationTypes,
    message: reminder.message ?? undefined,
    isActive: reminder.isActive,
    lastSentAt: reminder.lastSentAt?.toISOString(),
    nextScheduledAt: reminder.nextScheduledAt?.toISOString(),
    intervalEnabled: reminder.intervalEnabled,
    intervalMinutes: reminder.intervalMinutes ?? undefined,
    intervalStartTime: reminder.intervalStartTime ?? undefined,
    intervalEndTime: reminder.intervalEndTime ?? undefined,
    subType: reminder.subType as any,
    parentReminderId: reminder.parentReminderId ?? undefined,
    createdAt: reminder.createdAt.toISOString(),
    updatedAt: reminder.updatedAt.toISOString()
  };
};

// ===== FUNÇÕES PARA BUSCAR LEMBRETES ATIVOS =====

// Função INTERNA para o scheduler - mantém acesso a todos os lembretes
export const getActiveReminders = async (): Promise<ReminderResponse[]> => {
  console.log('🔧 INTERNAL USE - Scheduler acessando lembretes ativos de todos os usuários');
  const now = new Date();
  
  const reminders = await prisma.reminder.findMany({
    where: {
      isActive: true,
      nextScheduledAt: {
        lte: now
      }
    },
    include: {
      user: {
        include: {
          settings: true
        }
      }
    }
  });

  console.log(`🔧 SCHEDULER - Encontrados ${reminders.length} lembretes ativos no sistema`);

  return reminders
    .filter(reminder => reminder.user.settings?.notifications !== false)
    .map(reminder => ({
      id: reminder.id,
      userId: reminder.userId,
      entityId: reminder.entityId ?? undefined,
      entityType: reminder.entityType as any,
      type: reminder.type as any,
      scheduledTime: reminder.scheduledTime ?? undefined,
      minutesBefore: reminder.minutesBefore ?? undefined,
      daysOfWeek: reminder.daysOfWeek,
      notificationTypes: reminder.notificationTypes,
      message: reminder.message ?? undefined,
      isActive: reminder.isActive,
      lastSentAt: reminder.lastSentAt?.toISOString(),
      nextScheduledAt: reminder.nextScheduledAt?.toISOString(),
      intervalEnabled: reminder.intervalEnabled,
      intervalMinutes: reminder.intervalMinutes ?? undefined,
      intervalStartTime: reminder.intervalStartTime ?? undefined,
      intervalEndTime: reminder.intervalEndTime ?? undefined,
      subType: reminder.subType as any,
      parentReminderId: reminder.parentReminderId ?? undefined,
      createdAt: reminder.createdAt.toISOString(),
      updatedAt: reminder.updatedAt.toISOString()
    }));
};

// Função SEGURA para usuários - filtra apenas lembretes do usuário autenticado  
export const getUserActiveReminders = async (userId: string): Promise<ReminderResponse[]> => {
  console.log(`🛡️  SECURITY FILTER - Buscando lembretes ativos apenas do usuário ${userId}`);
  const now = new Date();
  
  const reminders = await prisma.reminder.findMany({
    where: {
      userId, // CORREÇÃO CRÍTICA: Filtrar por usuário
      isActive: true,
      nextScheduledAt: {
        lte: now
      }
    },
    include: {
      user: {
        include: {
          settings: true
        }
      }
    }
  });

  console.log(`🔒 SECURITY SUCCESS - Encontrados ${reminders.length} lembretes ativos para o usuário ${userId}`);

  return reminders
    .filter(reminder => reminder.user.settings?.notifications !== false)
    .map(reminder => ({
      id: reminder.id,
      userId: reminder.userId,
      entityId: reminder.entityId ?? undefined,
      entityType: reminder.entityType as any,
      type: reminder.type as any,
      scheduledTime: reminder.scheduledTime ?? undefined,
      minutesBefore: reminder.minutesBefore ?? undefined,
      daysOfWeek: reminder.daysOfWeek,
      notificationTypes: reminder.notificationTypes,
      message: reminder.message ?? undefined,
      isActive: reminder.isActive,
      lastSentAt: reminder.lastSentAt?.toISOString(),
      nextScheduledAt: reminder.nextScheduledAt?.toISOString(),
      intervalEnabled: reminder.intervalEnabled,
      intervalMinutes: reminder.intervalMinutes ?? undefined,
      intervalStartTime: reminder.intervalStartTime ?? undefined,
      intervalEndTime: reminder.intervalEndTime ?? undefined,
      subType: reminder.subType as any,
      parentReminderId: reminder.parentReminderId ?? undefined,
      createdAt: reminder.createdAt.toISOString(),
      updatedAt: reminder.updatedAt.toISOString()
    }));
};

export const markReminderAsSent = async (reminderId: string): Promise<void> => {
  const reminder = await prisma.reminder.findUnique({
    where: { id: reminderId }
  });

  if (!reminder) return;

  let nextScheduledAt: Date | undefined;
  let shouldDeactivate = false;

  // Calcular próximo agendamento baseado no tipo
  if (reminder.type === 'recurring' && reminder.daysOfWeek.length > 0) {
    const now = new Date();
    const currentDay = now.getDay();
    
    // Encontrar próximo dia da semana
    let nextDay = reminder.daysOfWeek.find(day => day > currentDay);
    if (!nextDay) {
      nextDay = reminder.daysOfWeek[0]; // Próxima semana
    }
    
    const daysUntilNext = nextDay > currentDay ? nextDay - currentDay : 7 + nextDay - currentDay;
    nextScheduledAt = new Date(now);
    nextScheduledAt.setDate(now.getDate() + daysUntilNext);
    
    if (reminder.scheduledTime) {
      const [hours, minutes] = reminder.scheduledTime.split(':').map(Number);
      nextScheduledAt.setHours(hours, minutes, 0, 0);
    }
  } else if (reminder.type === 'scheduled' && reminder.scheduledTime) {
    // Lembrete diário
    nextScheduledAt = new Date();
    const [hours, minutes] = reminder.scheduledTime.split(':').map(Number);
    nextScheduledAt.setDate(nextScheduledAt.getDate() + 1);
    nextScheduledAt.setHours(hours, minutes, 0, 0);
  } else if (reminder.type === 'before_due') {
    // Lembretes "antes do vencimento" são únicos - desativar após envio
    shouldDeactivate = true;
    nextScheduledAt = undefined; // Limpar próximo agendamento
  }

  const updateData: any = {
    lastSentAt: new Date(),
    nextScheduledAt
  };

  // Desativar lembrete se necessário (lembretes únicos como before_due)
  if (shouldDeactivate) {
    updateData.isActive = false;
  }

  await prisma.reminder.update({
    where: { id: reminderId },
    data: updateData
  });

  console.log(`🔄 Lembrete ${reminderId} (${reminder.type}) marcado como enviado ${shouldDeactivate ? 'e desativado' : 'com próximo agendamento calculado'}`);
};

// ===== NOVAS FUNÇÕES ESPECÍFICAS PARA TIPOS DE LEMBRETES =====

export const createSingleReminder = async (
  userId: string, 
  taskId: string, 
  config: TaskReminderConfig
): Promise<ReminderResponse> => {
  if (!config.enabled) {
    throw new ReminderValidationError('Configuração de lembrete deve estar habilitada', 'enabled');
  }

  // Validar formato de data e hora
  if (!ReminderCalculator.validateTimeFormat(config.reminderTime)) {
    throw new ReminderValidationError('Formato de hora inválido. Use HH:MM', 'reminderTime');
  }

  const reminderData: CreateReminderRequest = {
    entityId: taskId,
    entityType: 'task',
    type: 'scheduled',
    scheduledTime: config.reminderTime,
    daysOfWeek: [],
    notificationTypes: config.notificationTypes,
    message: config.message || `Lembrete para sua tarefa`,
    isActive: true,
    subType: 'main'
  };

  return createReminder(userId, reminderData);
};

export const createRecurringReminders = async (
  userId: string,
  entityId: string,
  entityType: 'task' | 'habit',
  config: RecurringTaskReminderConfig
): Promise<ReminderResponse[]> => {
  if (!config.enabled) {
    throw new ReminderValidationError('Configuração de lembrete deve estar habilitada', 'enabled');
  }

  // Validações
  if (!ReminderCalculator.validateDaysOfWeek(config.daysOfWeek)) {
    throw new ReminderValidationError('Dias da semana inválidos', 'daysOfWeek');
  }

  if (!ReminderCalculator.validateTimeFormat(config.reminderTime)) {
    throw new ReminderValidationError('Formato de hora inválido', 'reminderTime');
  }

  const reminders: ReminderResponse[] = [];

  // CORREÇÃO: Lembretes intervalados e principais são mutuamente exclusivos
  if (config.intervalEnabled) {
    // Criar apenas lembrete intervalado
    console.log('🔧 LOGIC - Criando apenas lembrete intervalado (sem principal)');
  } else {
    // Criar apenas lembrete principal
    console.log('🔧 LOGIC - Criando apenas lembrete principal (sem intervalado)');
    const mainReminderData: CreateReminderRequest = {
      entityId,
      entityType,
      type: 'recurring',
      scheduledTime: config.reminderTime,
      daysOfWeek: config.daysOfWeek,
      notificationTypes: config.notificationTypes,
      message: `Lembrete principal para ${entityType}`,
      isActive: true,
      subType: 'main'
    };

    const mainReminder = await createReminder(userId, mainReminderData);
    reminders.push(mainReminder);
  }

  // Criar lembretes de intervalo se habilitado
  if (config.intervalEnabled) {
    if (!config.intervalStartTime || !config.intervalEndTime || !config.intervalMinutes) {
      throw new ReminderValidationError('Configuração de intervalo incompleta', 'interval');
    }

    if (!ReminderCalculator.validateTimeFormat(config.intervalStartTime) || 
        !ReminderCalculator.validateTimeFormat(config.intervalEndTime)) {
      throw new ReminderValidationError('Formato de hora de intervalo inválido', 'intervalTimes');
    }

    try {
      // Validar que os cálculos de intervalo funcionam
      ReminderCalculator.calculateIntervalSlots(
        config.intervalStartTime,
        config.intervalEndTime,
        config.intervalMinutes
      );

      // CORREÇÃO: Lembretes intervalados criam apenas 1 registro no banco
      // A validação deve verificar se o intervalo é válido, não estimar execuções futuras
      const slotsPerDay = ReminderCalculator.calculateIntervalSlots(
        config.intervalStartTime,
        config.intervalEndTime,
        config.intervalMinutes
      );

      // Limite de segurança: máximo 48 slots por dia (a cada 30min = 48 slots em 24h)
      if (slotsPerDay.totalCount > 48) {
        throw new ReminderLimitError(48, `slots por dia com intervalo de ${config.intervalMinutes} minutos`);
      }

      // Criar um lembrete de intervalo representativo (não individual para cada horário)
      const intervalReminderData: CreateReminderRequest = {
        entityId,
        entityType,
        type: 'recurring',
        scheduledTime: config.intervalStartTime,
        daysOfWeek: config.daysOfWeek,
        notificationTypes: config.notificationTypes,
        message: `Lembretes em intervalo de ${config.intervalMinutes} minutos`,
        isActive: true,
        intervalEnabled: true,
        intervalMinutes: config.intervalMinutes,
        intervalStartTime: config.intervalStartTime,
        intervalEndTime: config.intervalEndTime,
        subType: 'interval'
        // CORREÇÃO: Não usar parentReminderId quando não há lembrete principal
      };

      const intervalReminder = await createReminder(userId, intervalReminderData);
      reminders.push(intervalReminder);

    } catch (error) {
      throw new ReminderValidationError(`Erro ao calcular intervalos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'interval');
    }
  }

  return reminders;
};

export const createHabitReminders = async (
  userId: string,
  habitId: string,
  config: HabitReminderConfig
): Promise<ReminderResponse[]> => {
  return createRecurringReminders(userId, habitId, 'habit', config);
};

export const createAppointmentReminders = async (
  userId: string,
  taskId: string,
  appointmentTime: string,
  preparationTime: number
): Promise<AppointmentAutoReminder> => {
  try {
    const reminderTimes = ReminderCalculator.calculateAppointmentReminders(
      appointmentTime,
      preparationTime
    );

    // Criar lembrete "Prepare-se"
    const prepareReminderData: CreateReminderRequest = {
      entityId: taskId,
      entityType: 'task',
      type: 'before_due',
      minutesBefore: preparationTime * 2 + 10,
      daysOfWeek: [],
      notificationTypes: ['push'],
      message: 'Prepare-se para seu compromisso',
      isActive: true,
      subType: 'prepare'
    };

    // Criar lembrete "Ultra Urgente"
    const urgentReminderData: CreateReminderRequest = {
      entityId: taskId,
      entityType: 'task',
      type: 'before_due',
      minutesBefore: preparationTime * 2,
      daysOfWeek: [],
      notificationTypes: ['push'],
      message: 'Compromisso ultra urgente!',
      isActive: true,
      subType: 'urgent'
    };

    await createReminder(userId, prepareReminderData);
    await createReminder(userId, urgentReminderData);

    return {
      prepareReminder: {
        time: reminderTimes.prepareTimeString,
        message: 'Prepare-se para seu compromisso',
        type: 'prepare'
      },
      urgentReminder: {
        time: reminderTimes.urgentTimeString,
        message: 'Compromisso ultra urgente!',
        type: 'urgent'
      }
    };

  } catch (error) {
    throw new ReminderValidationError(`Erro ao calcular lembretes do compromisso: ${error instanceof Error ? error.message : 'Erro desconhecido'}`, 'appointment');
  }
};

export const deleteReminderAndChildren = async (userId: string, reminderId: string): Promise<void> => {
  // Buscar lembrete e verificar propriedade
  const reminder = await prisma.reminder.findFirst({
    where: { id: reminderId, userId }
  });

  if (!reminder) {
    throw new ReminderNotFoundError(reminderId);
  }

  // Deletar lembretes filhos se existirem
  await prisma.reminder.deleteMany({
    where: {
      parentReminderId: reminderId,
      userId
    }
  });

  // Deletar o lembrete principal
  await prisma.reminder.delete({
    where: { id: reminderId }
  });
};

export const getEntityReminders = async (
  userId: string, 
  entityId: string, 
  entityType: 'task' | 'habit'
): Promise<ReminderResponse[]> => {
  return getUserReminders(userId, { entityId, entityType, isActive: true });
};