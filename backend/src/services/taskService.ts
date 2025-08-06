import { prisma } from '../app';
import { 
  CreateTaskRequest, 
  UpdateTaskRequest, 
  TaskResponse, 
  PostponeTaskRequest,
  CreateTaskCommentRequest,
  TaskCommentResponse,
  EnergyBudgetResponse
} from '../types/task';

export const getUserTasks = async (userId: string, filters?: any): Promise<TaskResponse[]> => {
  const whereClause: any = { 
    userId,
    isDeleted: false // Filtrar tarefas excluídas
  };

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
      appointment: true,
      history: {
        orderBy: { timestamp: 'desc' }
      }
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
    dueDate: task.dueDate?.toISOString().split('T')[0] || 'Sem vencimento',
    rescheduleDate: task.rescheduleDate?.toISOString().split('T')[0],
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
    history: task.history.map(h => ({
      id: h.id,
      action: h.action,
      field: h.action === 'created' ? 'created' : ((h.details as any)?.field || h.action),
      oldValue: h.action === 'created' ? '' : ((h.details as any)?.oldValue || ''),
      newValue: h.action === 'created' ? (h.details as any)?.newValue || '' : ((h.details as any)?.newValue || ''),
      timestamp: h.timestamp.toISOString(),
      details: h.details
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
      userId,
      isDeleted: false // Filtrar tarefas excluídas
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
      appointment: true,
      history: {
        orderBy: { timestamp: 'desc' }
      }
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
    dueDate: task.dueDate?.toISOString().split('T')[0] || 'Sem vencimento',
    rescheduleDate: task.rescheduleDate?.toISOString().split('T')[0],
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
    history: task.history.map(h => ({
      id: h.id,
      action: h.action,
      field: h.action === 'created' ? 'created' : ((h.details as any)?.field || h.action),
      oldValue: h.action === 'created' ? '' : ((h.details as any)?.oldValue || ''),
      newValue: h.action === 'created' ? (h.details as any)?.newValue || '' : ((h.details as any)?.newValue || ''),
      timestamp: h.timestamp.toISOString(),
      details: h.details
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

  if (data.dueDate && data.dueDate !== 'Sem vencimento') {
    taskData.dueDate = new Date(data.dueDate);
  }

  console.log('🔍 Criando tarefa com dados:', JSON.stringify({
    taskData: taskData,
    comments: data.comments,
    attachments: data.attachments
  }, null, 2));

  // Criar task com relacionamentos
  const task = await prisma.task.create({
    data: {
      ...taskData,
      history: {
        create: {
          action: 'created',
          details: { 
            createdBy: userId, 
            newValue: `Tarefa criada em ${new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
            timestamp: new Date().toISOString()
          }
        }
      },
      ...(data.comments && data.comments.length > 0 && {
        comments: {
          createMany: {
            data: data.comments.map(comment => ({
              author: comment.author,
              content: comment.content
            }))
          }
        }
      }),
      ...(data.attachments && data.attachments.length > 0 && {
        attachments: {
          createMany: {
            data: data.attachments.map(attachment => ({
              name: attachment.name,
              url: attachment.url,
              type: attachment.type,
              size: BigInt(attachment.size)
            }))
          }
        }
      }),
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
      appointment: true,
      history: {
        orderBy: { timestamp: 'desc' }
      }
    }
  });

  return getTaskById(task.id, userId);
};

export const updateTask = async (taskId: string, userId: string, data: UpdateTaskRequest): Promise<TaskResponse> => {
  // Verificar se a tarefa pertence ao usuário
  const existingTask = await prisma.task.findFirst({
    where: { 
      id: taskId, 
      userId,
      isDeleted: false // Não permitir edição de tarefas excluídas
    }
  });

  if (!existingTask) {
    throw new Error('Tarefa não encontrada');
  }

  const updateData: any = {};

  if (data.description !== undefined) updateData.description = data.description;
  if (data.energyPoints !== undefined) updateData.energyPoints = data.energyPoints;
  if (data.type !== undefined) updateData.type = data.type;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.isRecurring !== undefined) updateData.isRecurring = data.isRecurring;
  if (data.isAppointment !== undefined) updateData.isAppointment = data.isAppointment;
  if (data.externalLinks !== undefined) updateData.externalLinks = data.externalLinks;
  if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
  if (data.rescheduleDate !== undefined) updateData.rescheduleDate = data.rescheduleDate ? new Date(data.rescheduleDate) : null;
  if (data.plannedForToday !== undefined) {
    // Validar limite de energia ao marcar como "atuar hoje"
    if (data.plannedForToday === true) {
      const plannedTasks = await prisma.task.findMany({
        where: {
          userId,
          plannedForToday: true,
          id: { not: taskId }, // Excluir a tarefa atual
          isDeleted: false
        },
        select: { energyPoints: true }
      });
      
      const currentEnergyUsed = plannedTasks.reduce((sum, task) => sum + task.energyPoints, 0);
      const taskEnergyPoints = data.energyPoints !== undefined ? data.energyPoints : existingTask.energyPoints;
      
      // Buscar orçamento do usuário (padrão 12)
      const userSettings = await prisma.userSettings.findFirst({
        where: { userId },
        select: { dailyEnergyBudget: true }
      });
      const dailyBudget = userSettings?.dailyEnergyBudget || 12;
      
      if (currentEnergyUsed + taskEnergyPoints > dailyBudget) {
        throw new Error(`Limite de energia excedido. Disponível: ${dailyBudget - currentEnergyUsed}, necessário: ${taskEnergyPoints}`);
      }
    }
    updateData.plannedForToday = data.plannedForToday;
  }

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

  // Criar registros de histórico para cada campo alterado
  const historyRecords = [];
  
  if (data.description !== undefined && data.description !== existingTask.description) {
    historyRecords.push({
      action: 'description',
      details: {
        editedBy: userId,
        oldValue: existingTask.description,
        newValue: data.description
      }
    });
  }
  
  if (data.energyPoints !== undefined && data.energyPoints !== existingTask.energyPoints) {
    historyRecords.push({
      action: 'energyPoints',
      details: {
        editedBy: userId,
        oldValue: existingTask.energyPoints.toString(),
        newValue: data.energyPoints.toString()
      }
    });
  }
  
  if (data.status !== undefined && data.status !== existingTask.status) {
    historyRecords.push({
      action: 'status',
      details: {
        editedBy: userId,
        oldValue: existingTask.status,
        newValue: data.status
      }
    });
  }
  
  if (data.dueDate !== undefined) {
    const oldDate = existingTask.dueDate?.toISOString().split('T')[0] || null;
    const newDate = data.dueDate || null;
    if (oldDate !== newDate) {
      historyRecords.push({
        action: 'dueDate',
        details: {
          editedBy: userId,
          oldValue: oldDate || '',
          newValue: newDate || ''
        }
      });
    }
  }

  await prisma.task.update({
    where: { id: taskId },
    data: {
      ...updateData,
      ...(historyRecords.length > 0 && {
        history: {
          createMany: {
            data: historyRecords
          }
        }
      })
    }
  });

  return getTaskById(taskId, userId);
};

export const completeTask = async (taskId: string, userId: string): Promise<TaskResponse> => {
  const task = await prisma.task.findFirst({
    where: { 
      id: taskId, 
      userId,
      isDeleted: false // Não permitir completar tarefas excluídas
    }
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
          details: { 
            completedAt: completedAt.toISOString(), 
            completedBy: userId,
            oldValue: task.status,
            newValue: 'completed'
          }
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
    where: { 
      id: taskId, 
      userId,
      isDeleted: false // Não permitir adiar tarefas excluídas
    }
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  // Verificar limite máximo de adiamentos
  if (task.postponementCount >= 3) {
    throw new Error('Limite máximo de adiamentos atingido. Esta tarefa deve ser realizada hoje.');
  }

  const postponedAt = new Date();
  const updateData: any = {
    status: 'postponed',
    postponedAt,
    postponementCount: task.postponementCount + 1,
    plannedForToday: false // Remove da lista "atuar hoje"
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
            postponedBy: userId,
            oldValue: task.status,
            newValue: 'postponed',
            postponementCount: task.postponementCount + 1
          }
        }
      }
    }
  });

  return getTaskById(taskId, userId);
};

export const deleteTask = async (taskId: string, userId: string): Promise<void> => {
  const task = await prisma.task.findFirst({
    where: { 
      id: taskId, 
      userId,
      isDeleted: false // Só permitir exclusão de tarefas não excluídas
    }
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  // Soft delete - marcar como excluída
  await prisma.task.update({
    where: { id: taskId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
      history: {
        create: {
          action: 'deleted',
          details: {
            deletedAt: new Date().toISOString(),
            deletedBy: userId,
            oldValue: task.status,
            newValue: 'deleted'
          }
        }
      }
    }
  });
};

export const addTaskComment = async (taskId: string, userId: string, data: CreateTaskCommentRequest): Promise<TaskCommentResponse> => {
  // Verificar se a tarefa pertence ao usuário
  const task = await prisma.task.findFirst({
    where: { 
      id: taskId, 
      userId,
      isDeleted: false // Não permitir comentários em tarefas excluídas
    }
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

export const getUserEnergyBudget = async (userId: string): Promise<EnergyBudgetResponse> => {
  // Buscar configurações do usuário
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { settings: true }
  });

  const dailyBudget = user?.settings?.dailyEnergyBudget || 12;

  // Buscar tarefas planejadas para hoje (independente do status)
  const plannedTasks = await prisma.task.findMany({
    where: {
      userId,
      plannedForToday: true,
      isDeleted: false
    },
    select: {
      id: true,
      energyPoints: true,
      description: true,
      status: true
    }
  });

  const usedEnergy = plannedTasks.reduce((sum, task) => sum + (task.energyPoints || 0), 0);
  const remaining = Math.max(0, dailyBudget - usedEnergy);
  const completedCount = plannedTasks.filter(task => task.status === 'completed').length;

  return {
    used: usedEnergy,
    remaining,
    total: dailyBudget,
    completedTasks: completedCount
  };
};