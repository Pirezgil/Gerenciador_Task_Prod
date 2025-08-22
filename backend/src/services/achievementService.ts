import { prisma } from '../app';
import {
  Achievement,
  AchievementType,
  TaskAchievementSubtype,
  CreateAchievementRequest,
  UserAchievementsResponse,
  UpdateDailyProgressRequest,
  DailyProgress,
  AchievementFilters,
  RewardsPageData
} from '../types/achievement';

export class AchievementService {
  
  // ===== CRIAÇÃO DE CONQUISTAS =====
  
  /**
   * Cria uma nova conquista para o usuário
   */
  static async createAchievement(data: CreateAchievementRequest): Promise<Achievement> {
    const achievement = await prisma.achievement.create({
      data: {
        userId: data.userId,
        type: data.type,
        subtype: data.subtype,
        relatedId: data.relatedId,
        metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      },
    });

    return {
      ...achievement,
      relatedId: achievement.relatedId ?? undefined,
      type: achievement.type as AchievementType,
      subtype: achievement.subtype as TaskAchievementSubtype,
      earnedAt: achievement.earnedAt.toISOString(),
      createdAt: achievement.createdAt.toISOString(),
      metadata: achievement.metadata ? JSON.parse(achievement.metadata as string) : undefined,
    };
  }

  /**
   * Processa conquista automática ao completar uma tarefa
   */
  static async processTaskCompletion(userId: string, task: any): Promise<Achievement | null> {
    // Determina o subtipo baseado nos pontos de energia
    let subtype: TaskAchievementSubtype;
    if (task.energyPoints === 1) subtype = 'bronze';
    else if (task.energyPoints === 3) subtype = 'silver';
    else subtype = 'gold';

    const achievementData: CreateAchievementRequest = {
      userId,
      type: 'task_completion',
      subtype,
      relatedId: task.id,
      metadata: {
        energyPoints: task.energyPoints,
        taskDescription: task.description,
      }
    };

    return await this.createAchievement(achievementData);
  }

  /**
   * Processa conquista ao finalizar um projeto
   */
  static async processProjectCompletion(userId: string, project: any): Promise<Achievement | null> {
    // Conta quantas tarefas estavam no projeto
    const tasksCount = await prisma.task.count({
      where: {
        projectId: project.id,
        status: 'completed'
      }
    });

    const achievementData: CreateAchievementRequest = {
      userId,
      type: 'project_completion',
      relatedId: project.id,
      metadata: {
        projectName: project.name,
        tasksInProject: tasksCount,
      }
    };

    return await this.createAchievement(achievementData);
  }

  /**
   * Verifica e processa conquista de "Mestre do Dia"
   */
  static async checkDailyMastery(userId: string, date: string): Promise<Achievement | null> {
    const dailyProgress = await this.getDailyProgress(userId, date);
    
    if (!dailyProgress) {
      return null;
    }

    // Busca o orçamento de energia do usuário
    const userSettings = await prisma.userSettings.findUnique({
      where: { userId },
      select: { dailyEnergyBudget: true }
    });

    const energyBudget = userSettings?.dailyEnergyBudget || 35;

    // Verifica se completou energia suficiente para atingir o orçamento
    if (dailyProgress.completedEnergyPoints >= energyBudget && !dailyProgress.achievedMastery) {
      // Marca como conquistado no progresso diário
      await prisma.dailyProgress.update({
        where: { id: dailyProgress.id },
        data: { achievedMastery: true }
      });

      const achievementData: CreateAchievementRequest = {
        userId,
        type: 'daily_master',
        metadata: {
          tasksCompletedToday: dailyProgress.completedTasks,
          dateCompleted: date,
        }
      };

      return await this.createAchievement(achievementData);
    }

    return null;
  }

  /**
   * Verifica e processa conquista de "Lenda da Semana"
   */
  static async checkWeeklyLegend(userId: string, weekStartDate: string): Promise<Achievement | null> {
    const weekEndDate = new Date(weekStartDate);
    weekEndDate.setDate(weekEndDate.getDate() + 6);

    // Busca progresso da semana
    const weeklyProgress = await prisma.dailyProgress.findMany({
      where: {
        userId,
        date: {
          gte: new Date(weekStartDate),
          lte: weekEndDate,
        }
      }
    });

    // Verifica se conquistou maestria em TODOS os 7 dias
    const daysWithMastery = weeklyProgress.filter(day => day.achievedMastery).length;
    
    if (daysWithMastery === 7) {
      // Verifica se já não tem essa conquista para essa semana
      const existingWeeklyAchievement = await prisma.achievement.findFirst({
        where: {
          userId,
          type: 'weekly_legend',
          earnedAt: {
            gte: new Date(weekStartDate),
            lte: weekEndDate,
          }
        }
      });

      if (!existingWeeklyAchievement) {
        const totalTasks = weeklyProgress.reduce((sum, day) => sum + day.completedTasks, 0);

        const achievementData: CreateAchievementRequest = {
          userId,
          type: 'weekly_legend',
          metadata: {
            weekStartDate,
            weekEndDate: weekEndDate.toISOString().split('T')[0],
            totalTasksWeek: totalTasks,
            consecutiveDays: 7,
          }
        };

        return await this.createAchievement(achievementData);
      }
    }

    return null;
  }

  // ===== PROGRESSO DIÁRIO =====

  /**
   * Atualiza ou cria progresso diário do usuário
   */
  static async updateDailyProgress(data: UpdateDailyProgressRequest): Promise<DailyProgress> {
    const progress = await prisma.dailyProgress.upsert({
      where: {
        userId_date: {
          userId: data.userId,
          date: new Date(data.date),
        }
      },
      update: {
        plannedTasks: data.plannedTasks,
        completedTasks: data.completedTasks,
        plannedEnergyPoints: data.plannedEnergyPoints,
        completedEnergyPoints: data.completedEnergyPoints,
        achievedMastery: data.achievedMastery,
      },
      create: {
        userId: data.userId,
        date: new Date(data.date),
        plannedTasks: data.plannedTasks || 0,
        completedTasks: data.completedTasks || 0,
        plannedEnergyPoints: data.plannedEnergyPoints || 0,
        completedEnergyPoints: data.completedEnergyPoints || 0,
        achievedMastery: data.achievedMastery || false,
      }
    });

    return {
      ...progress,
      date: progress.date.toISOString().split('T')[0],
      createdAt: progress.createdAt.toISOString(),
      updatedAt: progress.updatedAt.toISOString(),
    };
  }

  /**
   * Busca progresso diário específico
   */
  static async getDailyProgress(userId: string, date: string): Promise<DailyProgress | null> {
    const progress = await prisma.dailyProgress.findUnique({
      where: {
        userId_date: {
          userId,
          date: new Date(date),
        }
      }
    });

    if (!progress) return null;

    return {
      ...progress,
      date: progress.date.toISOString().split('T')[0],
      createdAt: progress.createdAt.toISOString(),
      updatedAt: progress.updatedAt.toISOString(),
    };
  }

  // ===== CONSULTAS =====

  /**
   * Busca medalhas ganhas na semana (domingo a sábado)
   */
  static async getWeeklyAchievements(userId: string, date: string): Promise<{
    achievements: Achievement[];
    weekStart: string;
    weekEnd: string;
    totalCount: number;
    medalsByType: { type: string; subtype: string | null; count: number; icon: string; color: string }[];
  }> {
    // Calcular início e fim da semana (domingo a sábado)
    const targetDate = new Date(date + 'T12:00:00.000Z');
    const dayOfWeek = targetDate.getUTCDay(); // 0 = domingo, 1 = segunda, etc.
    
    const weekStart = new Date(targetDate);
    weekStart.setUTCDate(targetDate.getUTCDate() - dayOfWeek);
    weekStart.setUTCHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
    weekEnd.setUTCHours(23, 59, 59, 999);

    // Buscar todas as conquistas da semana
    const achievements = await prisma.achievement.findMany({
      where: {
        userId,
        earnedAt: {
          gte: weekStart,
          lte: weekEnd,
        },
      },
      orderBy: {
        earnedAt: 'asc'
      }
    });

    // Converter para formato adequado
    const formattedAchievements: Achievement[] = achievements.map(achievement => ({
      ...achievement,
      relatedId: achievement.relatedId ?? undefined,
      type: achievement.type as AchievementType,
      subtype: achievement.subtype as TaskAchievementSubtype,
      earnedAt: achievement.earnedAt.toISOString(),
      createdAt: achievement.createdAt.toISOString(),
      metadata: achievement.metadata ? JSON.parse(achievement.metadata as string) : undefined,
    }));

    // Agrupar medalhas por tipo
    const medalsByType: { type: string; subtype: string | null; count: number; icon: string; color: string }[] = [];
    
    // Contar medalhas por tipo e subtipo
    const typeCount = new Map<string, number>();
    
    formattedAchievements.forEach(achievement => {
      const key = achievement.subtype ? `${achievement.type}:${achievement.subtype}` : achievement.type;
      typeCount.set(key, (typeCount.get(key) || 0) + 1);
    });

    // Mapear para formato com ícones e cores
    typeCount.forEach((count, key) => {
      const [type, subtype] = key.split(':');
      
      let icon = '🏆';
      let color = '#FFD700';
      
      if (type === 'task_completion') {
        switch (subtype) {
          case 'bronze':
            icon = '⚡';
            color = '#CD7F32';
            break;
          case 'silver':
            icon = '⚡';
            color = '#C0C0C0';
            break;
          case 'gold':
            icon = '⚡';
            color = '#FFD700';
            break;
        }
      } else if (type === 'daily_master') {
        icon = '👑';
        color = '#8B5CF6';
      } else if (type === 'project_completion') {
        icon = '🏗️';
        color = '#3B82F6';
      }
      
      medalsByType.push({
        type,
        subtype: subtype || null,
        count,
        icon,
        color
      });
    });

    return {
      achievements: formattedAchievements,
      weekStart: weekStart.toISOString().split('T')[0],
      weekEnd: weekEnd.toISOString().split('T')[0],
      totalCount: formattedAchievements.length,
      medalsByType
    };
  }

  /**
   * Busca quantidade de medalhas ganhas hoje
   */
  static async getTodayAchievementsCount(userId: string, date: string): Promise<number> {
    // Usar UTC para evitar problemas de timezone
    const startOfDay = new Date(date + 'T00:00:00.000Z');
    const endOfDay = new Date(date + 'T23:59:59.999Z');

    console.log(`🔍 Buscando conquistas para ${userId} entre ${startOfDay.toISOString()} e ${endOfDay.toISOString()}`);

    const count = await prisma.achievement.count({
      where: {
        userId,
        earnedAt: {
          gte: startOfDay,
          lte: endOfDay,
        },
      },
    });

    console.log(`📊 Encontradas ${count} conquistas de hoje para o usuário ${userId}`);
    return count;
  }

  /**
   * Busca todas as conquistas do usuário
   */
  static async getUserAchievements(userId: string, filters?: AchievementFilters): Promise<UserAchievementsResponse> {
    const whereClause: any = { userId };

    if (filters?.type) {
      whereClause.type = filters.type;
    }
    if (filters?.subtype) {
      whereClause.subtype = filters.subtype;
    }
    if (filters?.startDate || filters?.endDate) {
      whereClause.earnedAt = {};
      if (filters.startDate) {
        whereClause.earnedAt.gte = new Date(filters.startDate);
      }
      if (filters.endDate) {
        whereClause.earnedAt.lte = new Date(filters.endDate);
      }
    }

    const achievements = await prisma.achievement.findMany({
      where: whereClause,
      orderBy: { earnedAt: 'desc' },
      take: filters?.limit,
      skip: filters?.offset,
    });

    // Estatísticas
    const stats = await prisma.achievement.groupBy({
      by: ['type'],
      where: { userId },
      _count: { type: true },
    });

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat.type] = stat._count.type;
      return acc;
    }, {} as Record<string, number>);

    // Conquistas recentes (últimas 5)
    const recentAchievements = achievements.slice(0, 5);

    return {
      achievements: achievements.map(achievement => ({
        ...achievement,
        relatedId: achievement.relatedId ?? undefined,
        type: achievement.type as AchievementType,
        subtype: achievement.subtype as TaskAchievementSubtype,
        earnedAt: achievement.earnedAt.toISOString(),
        createdAt: achievement.createdAt.toISOString(),
        metadata: achievement.metadata ? JSON.parse(achievement.metadata as string) : undefined,
      })),
      stats: {
        totalAchievements: achievements.length,
        taskCompletions: statsMap['task_completion'] || 0,
        projectCompletions: statsMap['project_completion'] || 0,
        dailyMasteries: statsMap['daily_master'] || 0,
        weeklyLegends: statsMap['weekly_legend'] || 0,
      },
      recentAchievements: recentAchievements.map(achievement => ({
        ...achievement,
        relatedId: achievement.relatedId ?? undefined,
        type: achievement.type as AchievementType,
        subtype: achievement.subtype as TaskAchievementSubtype,
        earnedAt: achievement.earnedAt.toISOString(),
        createdAt: achievement.createdAt.toISOString(),
        metadata: achievement.metadata ? JSON.parse(achievement.metadata as string) : undefined,
      })),
    };
  }

  /**
   * Busca dados completos para a página de recompensas
   */
  static async getRewardsPageData(userId: string): Promise<RewardsPageData> {
    // Busca usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true }
    });

    if (!user) {
      throw new Error('Usuário não encontrado');
    }

    // Busca conquistas e estatísticas
    const achievementsResponse = await this.getUserAchievements(userId);
    
    // Busca progresso dos últimos 30 dias
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const dailyProgress = await prisma.dailyProgress.findMany({
      where: {
        userId,
        date: { gte: thirtyDaysAgo }
      },
      orderBy: { date: 'desc' }
    });

    // Calcula streak atual e melhor streak
    const { currentStreak, bestStreak } = this.calculateStreaks(dailyProgress);

    return {
      user: {
        name: user.name,
        totalAchievements: achievementsResponse.stats.totalAchievements,
      },
      achievements: achievementsResponse.achievements,
      dailyProgress: dailyProgress.map(progress => ({
        ...progress,
        date: progress.date.toISOString().split('T')[0],
        createdAt: progress.createdAt.toISOString(),
        updatedAt: progress.updatedAt.toISOString(),
      })),
      stats: {
        taskCount: achievementsResponse.stats.taskCompletions,
        projectCount: achievementsResponse.stats.projectCompletions,
        dailyMasterCount: achievementsResponse.stats.dailyMasteries,
        weeklyLegendCount: achievementsResponse.stats.weeklyLegends,
        currentStreak,
        bestStreak,
      }
    };
  }

  // ===== UTILITÁRIOS =====

  /**
   * Calcula streaks de maestria diária
   */
  private static calculateStreaks(dailyProgress: any[]): { currentStreak: number; bestStreak: number } {
    if (dailyProgress.length === 0) {
      return { currentStreak: 0, bestStreak: 0 };
    }

    // Ordena por data
    const sortedProgress = dailyProgress
      .filter(day => day.achievedMastery)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;

    // Calcula streak atual (começando do dia mais recente)
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    
    for (let i = 0; i < sortedProgress.length; i++) {
      const progressDate = new Date(sortedProgress[i].date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);

      if (progressDate.getTime() === expectedDate.getTime()) {
        currentStreak++;
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        if (i === 0) currentStreak = 0; // Quebrou streak atual
        tempStreak = 0;
      }
    }

    return { currentStreak, bestStreak };
  }

  /**
   * Processa conquistas automáticas ao completar um hábito
   * (Atualmente hábitos não geram conquistas específicas, mas podem contribuir para maestria diária)
   */
  static async processHabitCompletion(userId: string, habit: any): Promise<void> {
    try {
      // Por enquanto, hábitos não geram conquistas diretas
      // Mas eles podem contribuir para a maestria diária
      console.log(`🏆 Hábito ${habit.name} completado. Checking daily mastery...`);
      
      // Verificar se hoje ainda tem tarefas pendentes para maestria
      const today = new Date().toISOString().split('T')[0];
      await this.checkDailyMastery(userId, today);
      
    } catch (error) {
      console.error('❌ Erro ao processar conquistas de hábito:', error);
      throw error;
    }
  }
}

export default AchievementService;