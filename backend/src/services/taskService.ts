import { prisma } from '../app';
import { 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskResponse, 
  PostponeTaskRequest,
  CreateTaskCommentRequest,
  TaskCommentResponse
} from '../types/task';

export const getUserTasks = async (userId: string, filters?: any): Promise<TaskResponse[]> => {
  const whereClause: any = { userId };

  if (filters?.status) {
    whereClause.status = filters.status;
  }
  if (filters?.type) {
    whereClause.type = filters.type;
  }
  if (filters?.projectId) {
    whereClause.projectId = filters.projectId;
  }
  if (filters?.startDate || filters?.endDate) {
    whereClause.createdAt = {};
    if (filters.startDate) {
      whereClause.createdAt.gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      whereClause.createdAt.lte = new Date(filters.endDate);
    }
  }
  if (filters?.search) {
    whereClause.description = {
      contains: filters.search,
      mode: 'insensitive'
    };
  }

  const tasks = await prisma.task.findMany({
    where: whereClause,
    include: {
      project: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true
        }
      },
      comments: {
        orderBy: { createdAt: 'desc' }
      },
      attachments: true,
      recurrence: true,
      appointment: true
    },
    orderBy: { createdAt: 'desc' }
  });

  return tasks.map(task => ({
    id: task.id,
    description: task.description,
    status: task.status as any,
    energyPoints: task.energyPoints,
    type: task.type as any,
    isRecurring: task.isRecurring,
    isAppointment: task.isAppointment,
    dueDate: task.dueDate?.toISOString(),
    rescheduleDate: task.rescheduleDate?.toISOString(),
    postponementCount: task.postponementCount,
    postponementReason: task.postponementReason,
    plannedForToday: task.plannedForToday,
    externalLinks: task.externalLinks,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString(),
    postponedAt: task.postponedAt?.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    project: task.project,
    comments: task.comments.map(comment => ({
      id: comment.id,
      author: comment.author,
      content: comment.content,
      createdAt: comment.createdAt.toISOString()
    })),
    attachments: task.attachments.map(attachment => ({
      id: attachment.id,
      name: attachment.name,
      url: attachment.url,
      type: attachment.type,
      size: attachment.size.toString(),
      uploadedAt: attachment.uploadedAt.toISOString()
    })),
    recurrence: task.recurrence ? {
      id: task.recurrence.id,
      frequency: task.recurrence.frequency,
      daysOfWeek: task.recurrence.daysOfWeek,
      lastCompleted: task.recurrence.lastCompleted?.toISOString(),
      nextDue: task.recurrence.nextDue?.toISOString()
    } : undefined,
    appointment: task.appointment ? {
      id: task.appointment.id,
      scheduledTime: task.appointment.scheduledTime,
      preparationTime: task.appointment.preparationTime,
      location: task.appointment.location,
      notes: task.appointment.notes,
      reminderTime: task.appointment.reminderTime
    } : undefined
  }));
};

export const getTaskById = async (taskId: string, userId: string): Promise<TaskResponse> => {
  const task = await prisma.task.findFirst({
    where: { 
      id: taskId, 
      userId 
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true
        }
      },
      comments: {
        orderBy: { createdAt: 'desc' }
      },
      attachments: true,
      recurrence: true,
      appointment: true
    }
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  return {
    id: task.id,
    description: task.description,
    status: task.status as any,
    energyPoints: task.energyPoints,
    type: task.type as any,
    isRecurring: task.isRecurring,
    isAppointment: task.isAppointment,
    dueDate: task.dueDate?.toISOString(),
    rescheduleDate: task.rescheduleDate?.toISOString(),
    postponementCount: task.postponementCount,
    postponementReason: task.postponementReason,
    plannedForToday: task.plannedForToday,
    externalLinks: task.externalLinks,
    createdAt: task.createdAt.toISOString(),
    completedAt: task.completedAt?.toISOString(),
    postponedAt: task.postponedAt?.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    project: task.project,
    comments: task.comments.map(comment => ({
      id: comment.id,
      author: comment.author,
      content: comment.content,
      createdAt: comment.createdAt.toISOString()
    })),
    attachments: task.attachments.map(attachment => ({
      id: attachment.id,
      name: attachment.name,
      url: attachment.url,
      type: attachment.type,
      size: attachment.size.toString(),
      uploadedAt: attachment.uploadedAt.toISOString()
    })),
    recurrence: task.recurrence ? {
      id: task.recurrence.id,
      frequency: task.recurrence.frequency,
      daysOfWeek: task.recurrence.daysOfWeek,
      lastCompleted: task.recurrence.lastCompleted?.toISOString(),
      nextDue: task.recurrence.nextDue?.toISOString()
    } : undefined,
    appointment: task.appointment ? {
      id: task.appointment.id,
      scheduledTime: task.appointment.scheduledTime,
      preparationTime: task.appointment.preparationTime,
      location: task.appointment.location,
      notes: task.appointment.notes,
      reminderTime: task.appointment.reminderTime
    } : undefined
  };
};

export const createTask = async (userId: string, data: CreateTaskRequest): Promise<TaskResponse> => {
  const taskData: any = {
    userId,
    description: data.description,
    energyPoints: data.energyPoints,
    type: data.type || 'task',
    status: 'pending',
    isRecurring: data.isRecurring || false,
    isAppointment: data.isAppointment || false,
    externalLinks: data.externalLinks || []
  };

  if (data.projectId) {
    // Verificar se o projeto pertence ao usuário
    const project = await prisma.project.findFirst({
      where: { id: data.projectId, userId }
    });
    if (!project) {
      throw new Error('Projeto não encontrado');
    }
    taskData.projectId = data.projectId;
  }

  if (data.dueDate) {
    taskData.dueDate = new Date(data.dueDate);
  }

  // Criar task com relacionamentos
  const task = await prisma.task.create({
    data: {
      ...taskData,
      history: {
        create: {
          action: 'created',
          details: { createdBy: userId }
        }
      },
      ...(data.recurrence && {
        recurrence: {
          create: {
            frequency: data.recurrence.frequency,
            daysOfWeek: data.recurrence.daysOfWeek || []
          }
        }
      }),
      ...(data.appointment && {
        appointment: {
          create: {
            scheduledTime: data.appointment.scheduledTime,
            preparationTime: data.appointment.preparationTime || 0,
            location: data.appointment.location,
            notes: data.appointment.notes,
            reminderTime: data.appointment.reminderTime
          }
        }
      })
    },
    include: {
      project: {
        select: {
          id: true,
          name: true,
          icon: true,
          color: true
        }
      },
      comments: true,
      attachments: true,
      recurrence: true,
      appointment: true
    }
  });

  return getTaskById(task.id, userId);
};

export const updateTask = async (taskId: string, userId: string, data: UpdateTaskRequest): Promise<TaskResponse> => {
  // Verificar se a tarefa pertence ao usuário
  const existingTask = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });

  if (!existingTask) {
    throw new Error('Tarefa não encontrada');
  }

  const updateData: any = {};

  if (data.description !== undefined) updateData.description = data.description;
  if (data.energyPoints !== undefined) updateData.energyPoints = data.energyPoints;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
  if (data.isAppointment !== undefined) updateData.isAppointment = data.isAppointment;
  if (data.externalLinks !== undefined) updateData.externalLinks = data.externalLinks;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.rescheduleDate !== undefined) updateData.rescheduleDate = data.rescheduleDate ? new Date(data.rescheduleDate) : null;
  if (data.plannedForToday !== undefined) updateData.plannedForToday = data.plannedForToday;

  if (data.projectId !== undefined) {
    if (data.projectId) {
      // Verificar se o projeto pertence ao usuário
      const project = await prisma.project.findFirst({
        where: { id: data.projectId, userId }
      });
      if (!project) {
        throw new Error('Projeto não encontrado');
      }
    }
    updateData.projectId = data.projectId;
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      ...updateData,
      history: {
        create: {
          action: 'edited',
          details: { editedBy: userId, changes: data }
        }
      }
    }
  });

  return getTaskById(taskId, userId);
};

export const completeTask = async (taskId: string, userId: string): Promise<TaskResponse> => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  if (task.status === 'completed') {
    throw new Error('Tarefa já está completa');
  }

  const completedAt = new Date();

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status: 'completed',
      completedAt,
      history: {
        create: {
          action: 'completed',
          details: { completedAt: completedAt.toISOString(), completedBy: userId }
        }
      }
    }
  });

  // Atualizar log de energia diário
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.dailyEnergyLog.upsert({
    where: {
      userId_date: {
        userId,
        date: today
      }
    },
    update: {
      energyUsed: { increment: task.energyPoints },
      energyRemaining: { decrement: task.energyPoints },
      tasksCompleted: { increment: 1 }
    },
    create: {
      userId,
      date: today,
      budgetTotal: 12, // Valor padrão - deveria vir das configurações do usuário
      energyUsed: task.energyPoints,
      energyRemaining: 12 - task.energyPoints,
      tasksCompleted: 1
    }
  });

  return getTaskById(taskId, userId);
};

export const postponeTask = async (taskId: string, userId: string, data: PostponeTaskRequest): Promise<TaskResponse> => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  const postponedAt = new Date();
  const updateData: any = {
    status: 'postponed',
    postponedAt,
    postponementCount: task.postponementCount + 1
  };

  if (data.reason) {
    updateData.postponementReason = data.reason;
  }

  if (data.newDate) {
    updateData.rescheduleDate = new Date(data.newDate);
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      ...updateData,
      history: {
        create: {
          action: 'postponed',
          details: { 
            postponedAt: postponedAt.toISOString(), 
            reason: data.reason,
            newDate: data.newDate,
            postponedBy: userId
          }
        }
      }
    }
  });

  return getTaskById(taskId, userId);
};

export const deleteTask = async (taskId: string, userId: string): Promise<void> => {
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  await prisma.task.delete({
    where: { id: taskId }
  });
};

export const addTaskComment = async (taskId: string, userId: string, data: CreateTaskCommentRequest): Promise<TaskCommentResponse> => {
  // Verificar se a tarefa pertence ao usuário
  const task = await prisma.task.findFirst({
    where: { id: taskId, userId }
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  const comment = await prisma.taskComment.create({
    data: {
      taskId,
      author: data.author,
      content: data.content
    }
  });

  return {
    id: comment.id,
    author: comment.author,
    content: comment.content,
    createdAt: comment.createdAt.toISOString()
  };
};