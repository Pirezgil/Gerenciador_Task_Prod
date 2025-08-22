import { prisma } from '../app';
import { 
  CreateHabitRequest, 
  UpdateHabitRequest, 
  HabitResponse,
  CompleteHabitRequest
} from '../types/habit';
import AchievementService from './achievementService';
import { HabitStreakService } from './habitStreakService';
import HabitSequentialCalculator from './habitSequentialCalculator';

export const getUserHabits = async (userId: string): Promise<HabitResponse[]> => {
  console.log('🔍 Buscando hábitos para usuário:', userId);
  
  const habits = await prisma.habit.findMany({
    where: { userId, isActive: true },
    include: {
      frequency: true,
      completions: {
        orderBy: { date: 'desc' },
        take: 30 // Limitar para os últimos 30 dias
      }
    },
    orderBy: { createdAt: 'desc' }
  });
  
  console.log('✅ Hábitos encontrados:', habits.length);

  return habits.map(habit => {
    const mappedHabit = {
      id: habit.id,
      name: habit.name,
      description: habit.description ?? undefined,
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
      completions: habit.completions.map(c => {
        const completion = {
          id: c.id,
          date: c.date.toISOString().split('T')[0],
          completedAt: c.completedAt.toISOString(),
          count: c.count,
          notes: c.notes ?? undefined
        };
        console.log(`  - Completion: ${completion.date}, count: ${completion.count}`);
        return completion;
      })
    };
    
    console.log(`📊 Hábito ${habit.name}: ${mappedHabit.completions.length} completações`);
    
    // Log das completions para debug
    const today = new Date().toISOString().split('T')[0];
    const todayCompletion = mappedHabit.completions.find(c => c.date === today);
    console.log(`  📅 Hoje (${today}): ${todayCompletion ? `${todayCompletion.count} completions` : 'não encontrado'}`);
    
    return mappedHabit;
  });
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
    description: habit.description ?? undefined,
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
  console.log('🔍 Iniciando completação de hábito:', { habitId, userId, data });
  
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId, isActive: true },
    include: {
      frequency: true,
      completions: {
        orderBy: { date: 'desc' },
        take: 30 // Para análise de streak
      }
    }
  });

  if (!habit) {
    console.log('❌ Hábito não encontrado');
    throw new Error('Hábito não encontrado');
  }
  
  console.log('✅ Hábito encontrado:', habit.name);

  // Processar data corretamente considerando timezone
  let date: Date;
  if (data.date) {
    // Se data foi fornecida, usar como string YYYY-MM-DD e converter para data local
    const [year, month, day] = data.date.split('-').map(Number);
    date = new Date(year, month - 1, day); // month é 0-indexed
    date.setHours(0, 0, 0, 0);
  } else {
    // Para data atual, criar em timezone local e normalizar
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const day = now.getDate();
    date = new Date(year, month, day, 0, 0, 0, 0); // Criar data local normalizada
  }
  
  console.log('🔍 DEBUG TIMEZONE:');
  console.log('📅 Data original recebida:', data.date);
  console.log('📅 Data processada (objeto Date):', date);
  console.log('📅 Data processada (toISOString):', date.toISOString());
  console.log('📅 Data processada (toDateString):', date.toDateString());
  console.log('📅 Data processada (toLocaleDateString):', date.toLocaleDateString('pt-BR'));
  console.log('📅 Data processada (getTime):', date.getTime());
  console.log('📅 Data processada (timezone offset):', date.getTimezoneOffset());

  const existingCompletion = await prisma.habitCompletion.findUnique({
    where: {
      habitId_date: {
        habitId,
        date
      }
    }
  });
  
  console.log('🔍 Completação existente:', existingCompletion);

  let completion;
  if (existingCompletion) {
    console.log('🔄 Atualizando completação existente');
    completion = await prisma.habitCompletion.update({
      where: {
        habitId_date: {
          habitId,
          date
        }
      },
      data: {
        count: (existingCompletion.count || 0) + (data.count || 1),
        notes: data.notes || existingCompletion.notes
      }
    });
  } else {
    console.log('✨ Criando nova completação');
    console.log('🔧 Enviando para Prisma:', {
      habitId,
      date: date.toISOString(),
      dateLocal: date.toLocaleDateString('pt-BR'),
      count: data.count || 1,
      notes: data.notes
    });
    
    completion = await prisma.habitCompletion.create({
      data: {
        habitId,
        date,
        count: data.count || 1,
        notes: data.notes
      }
    });
    
    console.log('💾 Salvo no banco:', {
      id: completion.id,
      date: completion.date.toISOString(),
      dateLocal: completion.date.toLocaleDateString('pt-BR'),
      completedAt: completion.completedAt.toISOString()
    });
    
    // 🆕 NOVA LÓGICA SEQUENCIAL - TUDO NO BACKEND
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    
    console.log('🧮 Iniciando cálculo de streak sequencial...');
    
    // Criar lista completa de completions incluindo a nova
    const allCompletions = [...habit.completions, completion];
    
    // Calcular streak usando a nova lógica sequencial
    const streakResult = HabitSequentialCalculator.calculateSequentialStreak(
      {
        id: habit.id,
        streak: habit.streak,
        bestStreak: habit.bestStreak,
        frequency: habit.frequency
      },
      allCompletions,
      today
    );
    
    console.log('📊 Resultado do cálculo:', streakResult);
    
    // Atualizar apenas se for dia obrigatório
    if (streakResult.isRequiredToday) {
      const newBestStreak = streakResult.isNewRecord ? 
        streakResult.currentStreak : 
        Math.max(habit.bestStreak, streakResult.currentStreak);
      
      await prisma.habit.update({
        where: { id: habitId },
        data: {
          streak: streakResult.currentStreak,
          bestStreak: newBestStreak
        }
      });
      
      console.log(`✅ Streak sequencial atualizado: ${streakResult.currentStreak} (recorde: ${newBestStreak})`);
      
      if (streakResult.isNewRecord) {
        console.log('🏆 NOVO RECORDE DE STREAK!');
      }
    } else {
      console.log('ℹ️ Hoje não é dia obrigatório para este hábito, streak mantido');
    }
  }
  
  // Processar conquistas de hábitos (sistema de recompensas TDAH)
  try {
    await AchievementService.processHabitCompletion(userId, habit);
    console.log('🏆 Conquistas de hábito processadas');
  } catch (achievementError) {
    console.error('❌ Erro ao processar conquistas de hábito:', achievementError);
  }
  
  // Atualizar sequência de hábitos apenas para nova conclusão
  if (!existingCompletion) {
    try {
      console.log('🔥 Chamando HabitStreakService.updateHabitStreak para userId:', userId);
      await HabitStreakService.updateHabitStreak(userId);
      console.log('✅ Sequência de hábitos atualizada com sucesso');
    } catch (streakError) {
      console.error('❌ ERRO CRÍTICO ao atualizar sequência de hábitos:', streakError);
    }
  } else {
    console.log('⚠️ Completion já existia, não atualizando streak');
  }
  
  console.log('✅ Completação finalizada:', completion);
  return completion;
};

export const getHabit = async (habitId: string, userId: string): Promise<HabitResponse> => {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId, isActive: true },
    include: {
      frequency: true,
      completions: {
        orderBy: { date: 'desc' },
        take: 30
      },
      comments: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!habit) {
    throw new Error('Hábito não encontrado');
  }

  return {
    id: habit.id,
    name: habit.name,
    description: habit.description ?? undefined,
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
    completions: habit.completions.map(c => ({
      id: c.id,
      date: c.date.toISOString().split('T')[0],
      completedAt: c.completedAt.toISOString(),
      count: c.count,
      notes: c.notes ?? undefined
    }))
  };
};

export const updateHabit = async (habitId: string, userId: string, data: UpdateHabitRequest): Promise<HabitResponse> => {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId, isActive: true }
  });

  if (!habit) {
    throw new Error('Hábito não encontrado');
  }

  const updatedHabit = await prisma.habit.update({
    where: { id: habitId },
    data: {
      name: data.name ?? habit.name,
      description: data.description ?? habit.description,
      icon: data.icon ?? habit.icon,
      color: data.color ?? habit.color,
      targetCount: data.targetCount ?? habit.targetCount,
      frequency: data.frequency ? {
        update: {
          type: data.frequency.type,
          intervalDays: data.frequency.intervalDays,
          daysOfWeek: data.frequency.daysOfWeek
        }
      } : undefined
    },
    include: {
      frequency: true
    }
  });

  return {
    id: updatedHabit.id,
    name: updatedHabit.name,
    description: updatedHabit.description ?? undefined,
    icon: updatedHabit.icon,
    color: updatedHabit.color,
    targetCount: updatedHabit.targetCount,
    streak: updatedHabit.streak,
    bestStreak: updatedHabit.bestStreak,
    isActive: updatedHabit.isActive,
    createdAt: updatedHabit.createdAt.toISOString(),
    updatedAt: updatedHabit.updatedAt.toISOString(),
    frequency: updatedHabit.frequency ? {
      id: updatedHabit.frequency.id,
      type: updatedHabit.frequency.type as any,
      intervalDays: updatedHabit.frequency.intervalDays,
      daysOfWeek: updatedHabit.frequency.daysOfWeek
    } : undefined
  };
};

export const deleteHabit = async (habitId: string, userId: string): Promise<void> => {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId, isActive: true }
  });

  if (!habit) {
    throw new Error('Hábito não encontrado');
  }

  await prisma.habit.update({
    where: { id: habitId },
    data: { isActive: false }
  });
};

export const getHabitComments = async (habitId: string, userId: string) => {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId, isActive: true }
  });

  if (!habit) {
    throw new Error('Hábito não encontrado');
  }

  const comments = await prisma.habitComment.findMany({
    where: { habitId },
    orderBy: { createdAt: 'desc' }
  });

  return comments;
};

export const addHabitComment = async (habitId: string, userId: string, data: { content: string; author?: string }) => {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId, isActive: true }
  });

  if (!habit) {
    throw new Error('Hábito não encontrado');
  }

  const comment = await prisma.habitComment.create({
    data: {
      habitId,
      content: data.content,
      author: data.author || 'Você'
    }
  });

  return comment;
};