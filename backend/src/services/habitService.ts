import { prisma } from '../app';
import { 
  CreateHabitRequest, 
  UpdateHabitRequest, 
  HabitResponse,
  CompleteHabitRequest
} from '../types/habit';

export const getUserHabits = async (userId: string): Promise<HabitResponse[]> => {
  const habits = await prisma.habit.findMany({
    where: { userId },
    include: {
      frequency: true,
      completions: {
        where: {
          date: new Date().toISOString().split('T')[0] // Hoje
        },
        take: 1
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  return habits.map(habit => ({
    id: habit.id,
    name: habit.name,
    description: habit.description,
    icon: habit.icon,
    color: habit.color,
    targetCount: habit.targetCount,
    streak: habit.streak,
    bestStreak: habit.bestStreak,
    isActive: habit.isActive,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
    frequency: habit.frequency ? {
      id: habit.frequency.id,
      type: habit.frequency.type as any,
      intervalDays: habit.frequency.intervalDays,
      daysOfWeek: habit.frequency.daysOfWeek
    } : undefined,
    todayCompletion: habit.completions[0] ? {
      id: habit.completions[0].id,
      date: habit.completions[0].date.toISOString().split('T')[0],
      completedAt: habit.completions[0].completedAt.toISOString(),
      count: habit.completions[0].count,
      notes: habit.completions[0].notes
    } : undefined
  }));
};

export const createHabit = async (userId: string, data: CreateHabitRequest): Promise<HabitResponse> => {
  const habit = await prisma.habit.create({
    data: {
      userId,
      name: data.name,
      description: data.description,
      icon: data.icon || '✅',
      color: data.color || '#10B981',
      targetCount: data.targetCount || 1,
      frequency: {
        create: {
          type: data.frequency.type,
          intervalDays: data.frequency.intervalDays || 1,
          daysOfWeek: data.frequency.daysOfWeek || []
        }
      }
    },
    include: {
      frequency: true
    }
  });

  return {
    id: habit.id,
    name: habit.name,
    description: habit.description,
    icon: habit.icon,
    color: habit.color,
    targetCount: habit.targetCount,
    streak: habit.streak,
    bestStreak: habit.bestStreak,
    isActive: habit.isActive,
    createdAt: habit.createdAt.toISOString(),
    updatedAt: habit.updatedAt.toISOString(),
    frequency: habit.frequency ? {
      id: habit.frequency.id,
      type: habit.frequency.type as any,
      intervalDays: habit.frequency.intervalDays,
      daysOfWeek: habit.frequency.daysOfWeek
    } : undefined
  };
};

export const completeHabit = async (habitId: string, userId: string, data: CompleteHabitRequest) => {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId }
  });

  if (!habit) {
    throw new Error('Hábito não encontrado');
  }

  const date = data.date ? new Date(data.date) : new Date();
  date.setHours(0, 0, 0, 0);

  const completion = await prisma.habitCompletion.upsert({
    where: {
      habitId_date: {
        habitId,
        date
      }
    },
    update: {
      count: data.count || 1,
      notes: data.notes
    },
    create: {
      habitId,
      date,
      count: data.count || 1,
      notes: data.notes
    }
  });

  // Atualizar streak se for hoje
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  if (date.getTime() === today.getTime()) {
    const newStreak = habit.streak + 1;
    await prisma.habit.update({
      where: { id: habitId },
      data: {
        streak: newStreak,
        bestStreak: Math.max(habit.bestStreak, newStreak)
      }
    });
  }

  return completion;
};