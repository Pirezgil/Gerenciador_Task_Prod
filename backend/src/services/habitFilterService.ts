import { prisma } from '../app';
import HabitSequentialCalculator from './habitSequentialCalculator';
import { HabitResponse } from '../types/habit';

/**
 * Serviço para filtrar hábitos baseado na lógica sequencial
 * TODA LÓGICA NO BACKEND - Frontend apenas consome os dados
 */
export class HabitFilterService {
  
  /**
   * Busca apenas os hábitos que são obrigatórios hoje
   * Para usar na página do bombeiro
   */
  static async getTodayRequiredHabits(userId: string): Promise<HabitResponse[]> {
    console.log('🔍 Buscando hábitos obrigatórios para hoje - usuário:', userId);
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`📅 Data de referência: ${today.toLocaleDateString('pt-BR')}`);
    
    // Buscar todos os hábitos do usuário
    const allHabits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        frequency: true,
        completions: {
          orderBy: { date: 'desc' },
          take: 30
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log(`📊 Total de hábitos do usuário: ${allHabits.length}`);
    
    // Filtrar apenas os que são obrigatórios hoje
    const todayHabits: HabitResponse[] = [];
    
    for (const habit of allHabits) {
      const isRequiredToday = HabitSequentialCalculator.isRequiredToday(habit.frequency, today);
      
      if (isRequiredToday) {
        // Verificar se já foi completado hoje
        const completedToday = habit.completions.some(completion => {
          const completionDate = new Date(completion.date);
          completionDate.setHours(0, 0, 0, 0);
          return completionDate.getTime() === today.getTime();
        });
        
        const habitResponse: HabitResponse = {
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
          completions: habit.completions.slice(0, 5).map(c => ({
            id: c.id,
            date: c.date.toISOString().split('T')[0],
            completedAt: c.completedAt.toISOString(),
            count: c.count,
            notes: c.notes ?? undefined
          }))
        };
        
        todayHabits.push(habitResponse);
        
        console.log(`✅ ${habit.name}: obrigatório hoje (completado: ${completedToday ? 'SIM' : 'NÃO'})`);
      } else {
        console.log(`⏭️ ${habit.name}: NÃO é dia dele hoje`);
      }
    }
    
    console.log(`🎯 Hábitos obrigatórios hoje: ${todayHabits.length}/${allHabits.length}`);
    
    return todayHabits;
  }
  
  /**
   * Busca informações de frequência de um hábito específico
   */
  static async getHabitFrequencyInfo(habitId: string, userId: string): Promise<{
    isRequiredToday: boolean;
    nextRequiredDate?: string;
    frequencyDescription: string;
  }> {
    
    const habit = await prisma.habit.findFirst({
      where: { id: habitId, userId, isActive: true },
      include: { frequency: true }
    });
    
    if (!habit) {
      throw new Error('Hábito não encontrado');
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const isRequiredToday = HabitSequentialCalculator.isRequiredToday(habit.frequency, today);
    
    // Gerar descrição da frequência
    let frequencyDescription = '';
    if (habit.frequency) {
      switch (habit.frequency.type) {
        case 'daily':
          frequencyDescription = 'Todos os dias';
          break;
        case 'weekly':
        case 'custom':
          const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
          const days = habit.frequency.daysOfWeek?.map(day => dayNames[day]) || [];
          frequencyDescription = `${days.join(', ')}`;
          break;
        case 'weekdays':
          frequencyDescription = 'Dias úteis (Seg-Sex)';
          break;
        case 'interval':
          frequencyDescription = `A cada ${habit.frequency.intervalDays} dias`;
          break;
        default:
          frequencyDescription = 'Frequência personalizada';
      }
    } else {
      frequencyDescription = 'Frequência não definida';
    }
    
    // TODO: Calcular próxima data obrigatória
    
    return {
      isRequiredToday,
      frequencyDescription
    };
  }
  
  /**
   * Busca estatísticas de hábitos para dashboard
   */
  static async getHabitsStats(userId: string): Promise<{
    total: number;
    requiredToday: number;
    completedToday: number;
    currentStreakTotal: number;
  }> {
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const allHabits = await prisma.habit.findMany({
      where: { userId, isActive: true },
      include: {
        frequency: true,
        completions: {
          where: {
            date: today
          }
        }
      }
    });
    
    let requiredToday = 0;
    let completedToday = 0;
    let currentStreakTotal = 0;
    
    for (const habit of allHabits) {
      const isRequired = HabitSequentialCalculator.isRequiredToday(habit.frequency, today);
      
      if (isRequired) {
        requiredToday++;
        if (habit.completions.length > 0) {
          completedToday++;
        }
      }
      
      currentStreakTotal += habit.streak;
    }
    
    return {
      total: allHabits.length,
      requiredToday,
      completedToday,
      currentStreakTotal
    };
  }
}

export default HabitFilterService;