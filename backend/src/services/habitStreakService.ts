import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class HabitStreakService {
  static async getHabitStreak(userId: string) {
    try {
      let streak = await prisma.habitStreak.findUnique({
        where: { userId }
      });

      if (!streak) {
        streak = await prisma.habitStreak.create({
          data: {
            userId,
            currentStreak: 0,
            bestStreak: 0
          }
        });
      }

      return streak;
    } catch (error) {
      console.error('Erro ao buscar sequência de hábitos:', error);
      throw error;
    }
  }

  static async updateHabitStreak(userId: string) {
    try {
      console.log('🚀 HabitStreakService.updateHabitStreak iniciado para userId:', userId);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      console.log('📅 Data de processamento:', today.toISOString().split('T')[0]);

      // Verificar se todos os hábitos do usuário foram completados hoje
      const userHabits = await prisma.habit.findMany({
        where: { 
          userId,
          isActive: true
        },
        include: {
          frequency: true,
          completions: {
            where: {
              date: today
            }
          }
        }
      });

      console.log('📊 Hábitos encontrados:', userHabits.length);
      userHabits.forEach(habit => {
        console.log(`  - ${habit.name}: ${habit.completions.length} completions hoje`);
      });

      // Filtrar apenas hábitos que são para hoje baseado na frequência
      const dayOfWeek = today.getDay(); // 0=domingo, 1=segunda, ..., 6=sábado
      console.log('📅 Dia da semana:', dayOfWeek, '(0=dom, 4=qui, 6=sáb)');
      
      const todayHabits = userHabits.filter(habit => {
        if (!habit.frequency) return true; // Se não tem frequência, assumir todos os dias
        
        let isForToday = false;
        switch (habit.frequency.type) {
          case 'daily':
            isForToday = true;
            break;
          case 'weekly':
            isForToday = habit.frequency.daysOfWeek?.includes(dayOfWeek) ?? false;
            break;
          case 'weekdays':
            isForToday = habit.frequency.daysOfWeek?.includes(dayOfWeek) ?? false;
            break;
          case 'custom':
            isForToday = habit.frequency.daysOfWeek?.includes(dayOfWeek) ?? false;
            break;
          default:
            isForToday = true;
        }
        
        console.log(`    ${habit.name}: ${isForToday ? '✅ para hoje' : '❌ não é hoje'} (tipo: ${habit.frequency.type}, dias: [${habit.frequency.daysOfWeek?.join(', ')}])`);
        return isForToday;
      });

      console.log(`🎯 Hábitos PARA HOJE: ${todayHabits.length}/${userHabits.length}`);

      // Se não há hábitos para hoje, não atualizar streak
      if (todayHabits.length === 0) {
        console.log('⚠️ Nenhum hábito programado para hoje');
        return await this.getHabitStreak(userId);
      }

      const allHabitsCompleted = todayHabits.every(habit => 
        habit.completions.length > 0
      );
      
      console.log(`📊 Status: ${todayHabits.filter(h => h.completions.length > 0).length}/${todayHabits.length} hábitos de hoje completados`);
      console.log('🎯 Todos os hábitos DE HOJE completados?', allHabitsCompleted ? '✅ SIM' : '❌ NÃO');

      // Buscar ou criar streak do usuário
      let streak = await prisma.habitStreak.findUnique({
        where: { userId }
      });

      if (!streak) {
        streak = await prisma.habitStreak.create({
          data: {
            userId,
            currentStreak: 0,
            bestStreak: 0
          }
        });
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const lastCompleted = streak.lastCompleted;

      if (allHabitsCompleted) {
        let newCurrentStreak = 1;

        // Se completou ontem também, incrementar streak
        if (lastCompleted) {
          const lastCompletedDate = new Date(lastCompleted);
          lastCompletedDate.setHours(0, 0, 0, 0);
          
          if (lastCompletedDate.getTime() === yesterday.getTime()) {
            newCurrentStreak = streak.currentStreak + 1;
          }
        }

        const newBestStreak = Math.max(streak.bestStreak, newCurrentStreak);

        streak = await prisma.habitStreak.update({
          where: { userId },
          data: {
            currentStreak: newCurrentStreak,
            bestStreak: newBestStreak,
            lastCompleted: today
          }
        });

        // Atualizar daily progress
        await prisma.dailyProgress.upsert({
          where: {
            userId_date: {
              userId,
              date: today
            }
          },
          update: {
            allHabitsCompleted: true,
            updatedAt: new Date()
          },
          create: {
            userId,
            date: today,
            allHabitsCompleted: true,
            plannedTasks: 0,
            completedTasks: 0,
            plannedEnergyPoints: 0,
            completedEnergyPoints: 0,
            achievedMastery: false
          }
        });
        
        console.log('🎉 TODOS OS HÁBITOS COMPLETADOS! Sequência atualizada:', {
          currentStreak: newCurrentStreak,
          bestStreak: newBestStreak,
          isNewRecord: newBestStreak > streak.bestStreak
        });
      } else {
        // Se não completou todos hoje, verificar se quebrou a sequência
        if (lastCompleted) {
          const lastCompletedDate = new Date(lastCompleted);
          lastCompletedDate.setHours(0, 0, 0, 0);
          
          // Se a última vez foi anteontem ou antes, quebrou a sequência
          if (lastCompletedDate.getTime() < yesterday.getTime()) {
            streak = await prisma.habitStreak.update({
              where: { userId },
              data: {
                currentStreak: 0
              }
            });
          }
        }
      }

      return streak;
    } catch (error) {
      console.error('Erro ao atualizar sequência de hábitos:', error);
      throw error;
    }
  }

  static async resetStreakIfNeeded(userId: string) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const streak = await prisma.habitStreak.findUnique({
        where: { userId }
      });

      if (!streak || !streak.lastCompleted) {
        return streak;
      }

      const lastCompletedDate = new Date(streak.lastCompleted);
      lastCompletedDate.setHours(0, 0, 0, 0);

      // Se a última vez foi anteontem ou antes, quebrou a sequência
      if (lastCompletedDate.getTime() < yesterday.getTime()) {
        return await prisma.habitStreak.update({
          where: { userId },
          data: {
            currentStreak: 0
          }
        });
      }

      return streak;
    } catch (error) {
      console.error('Erro ao verificar reset de sequência:', error);
      throw error;
    }
  }
}