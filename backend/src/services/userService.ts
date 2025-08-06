import { prisma } from '../app';
import { UpdateUserSettingsRequest, UpdateUserProfileRequest, UserStatsResponse } from '../types/user';

export const getUserSettings = async (userId: string) => {
  const settings = await prisma.userSettings.findUnique({
    where: { userId }
  });

  if (!settings) {
    throw new Error('Configurações não encontradas');
  }

  return {
    id: settings.id,
    dailyEnergyBudget: settings.dailyEnergyBudget,
    theme: settings.theme,
    timezone: settings.timezone,
    notifications: settings.notifications,
    sandboxEnabled: settings.sandboxEnabled,
    createdAt: settings.createdAt.toISOString(),
    updatedAt: settings.updatedAt.toISOString()
  };
};

export const updateUserSettings = async (userId: string, data: UpdateUserSettingsRequest) => {
  await prisma.userSettings.upsert({
    where: { userId },
    update: data,
    create: {
      userId,
      ...data
    }
  });

  // Retornar o usuário completo com as configurações atualizadas
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      settings: {
        select: {
          dailyEnergyBudget: true,
          theme: true,
          timezone: true,
          notifications: true,
          sandboxEnabled: true,
          sandboxPassword: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatarUrl,
    settings: user.settings || {
      dailyEnergyBudget: 12,
      theme: 'light',
      timezone: 'America/Sao_Paulo',
      notifications: true,
      sandboxEnabled: false
    },
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
};

export const updateUserProfile = async (userId: string, data: UpdateUserProfileRequest) => {
  const updateData: any = {};
  const settingsData: any = {};

  // Separar dados do perfil dos dados de configurações
  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  
  if (data.timezone !== undefined) settingsData.timezone = data.timezone;
  if (data.dailyEnergyBudget !== undefined) settingsData.dailyEnergyBudget = data.dailyEnergyBudget;

  // Atualizar dados do usuário
  if (Object.keys(updateData).length > 0) {
    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });
  }

  // Atualizar configurações se necessário
  if (Object.keys(settingsData).length > 0) {
    await prisma.userSettings.upsert({
      where: { userId },
      update: settingsData,
      create: {
        userId,
        ...settingsData
      }
    });
  }

  // Retornar o usuário completo com as configurações atualizadas
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      email: true,
      avatarUrl: true,
      createdAt: true,
      updatedAt: true,
      settings: {
        select: {
          dailyEnergyBudget: true,
          theme: true,
          timezone: true,
          notifications: true,
          sandboxEnabled: true,
          sandboxPassword: true
        }
      }
    }
  });

  if (!user) {
    throw new Error('Usuário não encontrado');
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    avatar_url: user.avatarUrl,
    settings: user.settings || {
      dailyEnergyBudget: 12,
      theme: 'light',
      timezone: 'America/Sao_Paulo',
      notifications: true,
      sandboxEnabled: false
    },
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString()
  };
};

export const getUserStats = async (userId: string): Promise<UserStatsResponse> => {
  const [tasks, projects, habits, notes] = await Promise.all([
    prisma.task.findMany({
      where: { userId },
      select: { status: true, energyPoints: true }
    }),
    prisma.project.findMany({
      where: { userId },
      select: { status: true }
    }),
    prisma.habit.findMany({
      where: { userId },
      select: { isActive: true, streak: true, bestStreak: true }
    }),
    prisma.note.count({
      where: { userId }
    })
  ]);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const pendingTasks = tasks.filter(t => t.status === 'pending').length;
  const postponedTasks = tasks.filter(t => t.status === 'postponed').length;

  const totalProjects = projects.length;
  const activeProjects = projects.filter(p => p.status === 'active').length;
  const completedProjects = projects.filter(p => p.status === 'completed').length;

  const totalHabits = habits.length;
  const activeHabits = habits.filter(h => h.isActive).length;

  const totalEnergyUsed = tasks
    .filter(t => t.status === 'completed')
    .reduce((sum, t) => sum + t.energyPoints, 0);

  const currentStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);

  const productivityScore = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  return {
    totalTasks,
    completedTasks,
    pendingTasks,
    postponedTasks,
    totalProjects,
    activeProjects,
    completedProjects,
    totalHabits,
    activeHabits,
    totalNotes: notes,
    currentStreak,
    bestStreak,
    totalEnergyUsed,
    averageDailyEnergy: totalTasks > 0 ? Math.round(totalEnergyUsed / Math.max(completedTasks, 1)) : 0,
    productivityScore
  };
};