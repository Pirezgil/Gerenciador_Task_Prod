import { prisma } from '../app';
import { 
  CreateProjectRequest, 
  UpdateProjectRequest, 
  ProjectResponse, 
  ProjectWithTasksResponse 
} from '../types/project';
import AchievementService from './achievementService';

export const getUserProjects = async (userId: string, includeStats = false): Promise<ProjectResponse[]> => {
  const projects = await prisma.project.findMany({
    where: { userId },
    include: {
      tasks: {
        select: {
          id: true,
          description: true,
          status: true,
          energyPoints: true,
          type: true,
          dueDate: true,
          createdAt: true,
          updatedAt: true,
          completedAt: true,
          postponedAt: true,
          comments: true,
          attachments: true,
          externalLinks: true,
          history: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return projects.map(project => {
    const tasks = (project as any).tasks || [];
    
    const result: ProjectResponse = {
      id: project.id,
      name: project.name,
      icon: project.icon,
      color: project.color,
      status: project.status as any,
      deadline: project.deadline?.toISOString(),
      sandboxNotes: project.sandboxNotes ?? undefined,
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString(),
      backlog: tasks.map((task: any) => ({
        id: task.id,
        description: task.description,
        status: task.status,
        energyPoints: Number(task.energyPoints),
        type: task.type,
        deadline: task.dueDate?.toISOString(),
        projectId: project.id,
        createdAt: task.createdAt.toISOString(),
        updatedAt: task.updatedAt.toISOString(),
        completedAt: task.completedAt?.toISOString(),
        postponedAt: task.postponedAt?.toISOString(),
        comments: (task.comments || []).map((c: any) => ({
          ...c,
          size: c.size ? Number(c.size) : c.size
        })),
        attachments: (task.attachments || []).map((a: any) => ({
          ...a,
          size: a.size ? Number(a.size) : a.size
        })),
        externalLinks: task.externalLinks || [],
        history: (task.history || []).map((h: any) => ({
          ...h,
          id: h.id ? String(h.id) : h.id
        }))
      }))
    };

    if (includeStats) {
      result.tasksCount = Number(tasks.length);
      result.completedTasksCount = Number(tasks.filter((t: any) => t.status === 'completed').length);
      result.totalEnergyPoints = Number(tasks.reduce((sum: number, t: any) => sum + Number(t.energyPoints), 0));
      result.completedEnergyPoints = Number(tasks
        .filter((t: any) => t.status === 'completed')
        .reduce((sum: number, t: any) => sum + Number(t.energyPoints), 0));
    }

    return result;
  });
};

export const getProjectById = async (projectId: string, userId: string, includeTasks = false): Promise<ProjectWithTasksResponse> => {
  const project = await prisma.project.findFirst({
    where: { 
      id: projectId, 
      userId 
    },
    include: {
      tasks: includeTasks ? {
        select: {
          id: true,
          description: true,
          status: true,
          energyPoints: true,
          type: true,
          createdAt: true,
          completedAt: true
        },
        orderBy: { createdAt: 'desc' }
      } : false
    }
  });

  if (!project) {
    throw new Error('Projeto não encontrado');
  }

  const result: ProjectWithTasksResponse = {
    id: project.id,
    name: project.name,
    icon: project.icon,
    color: project.color,
    status: project.status as any,
    deadline: project.deadline?.toISOString(),
    sandboxNotes: project.sandboxNotes ?? undefined,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    tasks: []
  };

  if (includeTasks && 'tasks' in project && project.tasks) {
    result.tasks = project.tasks.map(task => ({
      id: task.id,
      description: task.description,
      status: task.status,
      energyPoints: Number(task.energyPoints),
      type: task.type,
      createdAt: task.createdAt.toISOString(),
      completedAt: task.completedAt?.toISOString()
    }));

    // Calcular estatísticas
    result.tasksCount = Number(result.tasks.length);
    result.completedTasksCount = Number(result.tasks.filter(t => t.status === 'completed').length);
    result.totalEnergyPoints = Number(result.tasks.reduce((sum, t) => sum + Number(t.energyPoints), 0));
    result.completedEnergyPoints = Number(result.tasks
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + Number(t.energyPoints), 0));
  }

  return result;
};

export const createProject = async (userId: string, data: CreateProjectRequest): Promise<ProjectResponse> => {
  const project = await prisma.project.create({
    data: {
      userId,
      name: data.name,
      icon: data.icon || '📁',
      color: data.color || '#3B82F6',
      status: data.status || 'active',
      deadline: data.deadline ? new Date(data.deadline) : null,
      sandboxNotes: data.sandboxNotes
    }
  });

  return {
    id: project.id,
    name: project.name,
    icon: project.icon,
    color: project.color,
    status: project.status as any,
    deadline: project.deadline?.toISOString(),
    sandboxNotes: project.sandboxNotes ?? undefined,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  };
};

export const updateProject = async (projectId: string, userId: string, data: UpdateProjectRequest): Promise<ProjectResponse> => {
  // Verificar se o projeto pertence ao usuário
  const existingProject = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });

  if (!existingProject) {
    throw new Error('Projeto não encontrado');
  }

  // Se tentando finalizar projeto, verificar se há tarefas pendentes
  if (data.status === 'completed') {
    const pendingTasks = await prisma.task.count({
      where: { 
        projectId,
        status: 'pending'
      }
    });

    if (pendingTasks > 0) {
      throw new Error(`Não é possível finalizar projeto com ${pendingTasks} tarefa(s) pendente(s)`);
    }
  }

  const updateData: any = {};

  if (data.name !== undefined) updateData.name = data.name;
  if (data.icon !== undefined) updateData.icon = data.icon;
  if (data.color !== undefined) updateData.color = data.color;
  if (data.status !== undefined) updateData.status = data.status;
  if (data.deadline !== undefined) updateData.deadline = data.deadline ? new Date(data.deadline) : null;
  if (data.sandboxNotes !== undefined) updateData.sandboxNotes = data.sandboxNotes;

  const project = await prisma.project.update({
    where: { id: projectId },
    data: updateData
  });

  // ===== SISTEMA DE CONQUISTAS =====
  // Se o projeto foi completado, processar conquista
  if (data.status === 'completed') {
    try {
      await AchievementService.processProjectCompletion(userId, project);
    } catch (achievementError) {
      console.error('Erro ao processar conquista de projeto:', achievementError);
    }
  }

  return {
    id: project.id,
    name: project.name,
    icon: project.icon,
    color: project.color,
    status: project.status as any,
    deadline: project.deadline?.toISOString(),
    sandboxNotes: project.sandboxNotes ?? undefined,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString()
  };
};

export const deleteProject = async (projectId: string, userId: string): Promise<void> => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });

  if (!project) {
    throw new Error('Projeto não encontrado');
  }

  // Verificar se há tarefas vinculadas
  const tasksCount = await prisma.task.count({
    where: { projectId }
  });

  if (tasksCount > 0) {
    throw new Error('Não é possível deletar projeto com tarefas vinculadas');
  }

  await prisma.project.delete({
    where: { id: projectId }
  });
};

export const getProjectStats = async (projectId: string, userId: string) => {
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId },
    include: {
      tasks: {
        select: {
          id: true,
          status: true,
          energyPoints: true,
          type: true,
          createdAt: true,
          completedAt: true
        }
      }
    }
  });

  if (!project) {
    throw new Error('Projeto não encontrado');
  }

  const tasks = project.tasks;
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const postponedTasks = tasks.filter(t => t.status === 'postponed');

  const totalEnergy = tasks.reduce((sum, t) => sum + t.energyPoints, 0);
  const completedEnergy = completedTasks.reduce((sum, t) => sum + t.energyPoints, 0);

  const completionRate = tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0;
  const energyEfficiency = totalEnergy > 0 ? (completedEnergy / totalEnergy) * 100 : 0;

  return {
    projectId,
    projectName: project.name,
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    pendingTasks: pendingTasks.length,
    postponedTasks: postponedTasks.length,
    totalEnergyPoints: totalEnergy,
    completedEnergyPoints: completedEnergy,
    completionRate: Math.round(completionRate * 100) / 100,
    energyEfficiency: Math.round(energyEfficiency * 100) / 100,
    tasksByType: {
      task: tasks.filter(t => t.type === 'task').length,
      brick: tasks.filter(t => t.type === 'brick').length
    },
    averageTaskEnergy: tasks.length > 0 ? Math.round((totalEnergy / tasks.length) * 100) / 100 : 0
  };
};

export const updateProjectTask = async (projectId: string, taskId: string, userId: string, updates: any) => {
  // Verificar se o projeto pertence ao usuário
  const project = await prisma.project.findFirst({
    where: { id: projectId, userId }
  });

  if (!project) {
    throw new Error('Projeto não encontrado');
  }

  // Verificar se a tarefa existe e pertence ao projeto
  const task = await prisma.task.findFirst({
    where: { 
      id: taskId, 
      projectId: projectId,
      userId
    }
  });

  if (!task) {
    throw new Error('Tarefa não encontrada');
  }

  // ✅ CORREÇÃO: Usar taskService.updateTask para suportar recorrência e compromissos
  const taskService = require('./taskService');
  console.log('🔧 updateProjectTask: Delegando para taskService.updateTask');
  
  const updatedTask = await taskService.updateTask(taskId, userId, updates);
  
  return updatedTask;
};