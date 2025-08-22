import { HabitFrequency, HabitCompletion } from '@prisma/client';

export interface SequentialStreakResult {
  currentStreak: number;
  shouldReset: boolean;
  isNewRecord: boolean;
  isRequiredToday: boolean;
}

export interface HabitWithFrequency {
  id: string;
  streak: number;
  bestStreak: number;
  frequency: HabitFrequency | null;
}

export class HabitSequentialCalculator {
  
  /**
   * Verifica se hoje é um dia configurado para o hábito
   * TODA LÓGICA NO BACKEND
   */
  static isRequiredToday(frequency: HabitFrequency | null, today: Date): boolean {
    if (!frequency) return true; // Se não tem frequência, assumir diário
    
    const dayOfWeek = today.getDay(); // 0=dom, 1=seg, ..., 6=sab
    
    console.log(`🔍 Verificando se hoje (${dayOfWeek}) é obrigatório para tipo: ${frequency.type}`);
    
    switch (frequency.type) {
      case 'daily':
        console.log('   ✅ Diário - sempre obrigatório');
        return true;
      
      case 'weekly':
      case 'custom':
        const isRequired = frequency.daysOfWeek?.includes(dayOfWeek) || false;
        console.log(`   📅 Semanal/Custom - dias: [${frequency.daysOfWeek}] - obrigatório: ${isRequired}`);
        return isRequired;
      
      case 'weekdays':
        const isWeekday = dayOfWeek >= 1 && dayOfWeek <= 5; // Seg-Sex
        console.log(`   💼 Dias úteis - obrigatório: ${isWeekday}`);
        return isWeekday;
      
      case 'interval':
        // Para intervalos, vamos implementar lógica mais complexa depois
        console.log('   ⏰ Intervalo - implementação futura');
        return true;
      
      default:
        console.log('   ❓ Tipo desconhecido - assumindo não obrigatório');
        return false;
    }
  }
  
  /**
   * Verifica se tem completion para uma data específica
   */
  private static hasCompletionForDate(completions: HabitCompletion[], targetDate: Date): boolean {
    const targetTime = targetDate.getTime();
    
    return completions.some(completion => {
      const completionDate = new Date(completion.date);
      completionDate.setHours(0, 0, 0, 0);
      return completionDate.getTime() === targetTime;
    });
  }
  
  /**
   * Calcula streak sequencial - LÓGICA PRINCIPAL NO BACKEND
   * Esta função é chamada toda vez que um hábito é completado
   * 
   * DIFERENCIAÇÃO ENTRE HÁBITOS DIÁRIOS E NÃO-DIÁRIOS:
   * - Diários: Consecutividade rigorosa, perder 1 dia quebra streak
   * - Não-diários: Lógica sequencial, só conta dias configurados
   */
  static calculateSequentialStreak(
    habit: HabitWithFrequency,
    allCompletions: HabitCompletion[],
    today: Date
  ): SequentialStreakResult {
    
    console.log(`🧮 Calculando streak para hábito ${habit.id}`);
    console.log(`   - Tipo: ${habit.frequency?.type || 'sem frequência'}`);
    console.log(`   - Streak atual: ${habit.streak}`);
    console.log(`   - Best streak: ${habit.bestStreak}`);
    console.log(`   - Total completions: ${allCompletions.length}`);
    
    // Diferenciar lógica baseada no tipo de hábito
    if (habit.frequency?.type === 'daily') {
      // HÁBITOS DIÁRIOS - Consecutividade rigorosa
      return this.calculateDailyStreak(habit, allCompletions, today);
    } else {
      // HÁBITOS NÃO-DIÁRIOS - Lógica sequencial
      return this.calculateNonDailyStreak(habit, allCompletions, today);
    }
  }
  
  /**
   * Lógica RIGOROSA para hábitos diários
   * Perder 1 dia quebra a sequência → streak = 0
   */
  private static calculateDailyStreak(
    habit: HabitWithFrequency,
    allCompletions: HabitCompletion[],
    today: Date
  ): SequentialStreakResult {
    
    console.log('🔥 Aplicando lógica DIÁRIA (consecutividade rigorosa)');
    
    const todayNormalized = new Date(today);
    todayNormalized.setHours(0, 0, 0, 0);
    
    const completedToday = this.hasCompletionForDate(allCompletions, todayNormalized);
    console.log(`   - Completou hoje: ${completedToday}`);
    
    if (completedToday) {
      // Completou hoje, calcular streak baseado em consecutividade
      const consecutiveStreak = this.calculateConsecutiveDays(allCompletions, today);
      const isNewRecord = consecutiveStreak > habit.bestStreak;
      
      console.log(`   🔥 Dias consecutivos calculados: ${consecutiveStreak}`);
      console.log(`   🏆 Novo recorde: ${isNewRecord}`);
      
      return {
        currentStreak: consecutiveStreak,
        shouldReset: false,
        isNewRecord: isNewRecord,
        isRequiredToday: true
      };
    } else {
      // Não completou hoje, manter streak atual (será resetado pelo job diário)
      return {
        currentStreak: habit.streak,
        shouldReset: false,
        isNewRecord: false,
        isRequiredToday: true
      };
    }
  }
  
  /**
   * Lógica SEQUENCIAL para hábitos não-diários
   * A cada dia completado → streak + 1 (apenas em dias configurados)
   */
  private static calculateNonDailyStreak(
    habit: HabitWithFrequency,
    allCompletions: HabitCompletion[],
    today: Date
  ): SequentialStreakResult {
    
    console.log('📅 Aplicando lógica NÃO-DIÁRIA (sequencial)');
    
    // 1. Verificar se hoje é dia obrigatório
    const isRequiredToday = this.isRequiredToday(habit.frequency, today);
    console.log(`   - É obrigatório hoje: ${isRequiredToday}`);
    
    if (!isRequiredToday) {
      // Hoje não é dia do hábito, manter streak atual
      console.log('   ➡️ Hoje não é dia obrigatório, mantendo streak');
      return {
        currentStreak: habit.streak,
        shouldReset: false,
        isNewRecord: false,
        isRequiredToday: false
      };
    }
    
    // 2. Se é dia obrigatório, verificar se completou hoje
    const todayNormalized = new Date(today);
    todayNormalized.setHours(0, 0, 0, 0);
    
    const completedToday = this.hasCompletionForDate(allCompletions, todayNormalized);
    console.log(`   - Completou hoje: ${completedToday}`);
    
    if (completedToday) {
      // Completou hoje em dia obrigatório, incrementar sequencialmente
      const newStreak = habit.streak + 1;
      const isNewRecord = newStreak > habit.bestStreak;
      
      console.log(`   🎉 Incremento sequencial: ${habit.streak} → ${newStreak}`);
      
      return {
        currentStreak: newStreak,
        shouldReset: false,
        isNewRecord: isNewRecord,
        isRequiredToday: true
      };
    } else {
      // Não completou hoje, manter streak (será verificado pelo job diário)
      return {
        currentStreak: habit.streak,
        shouldReset: false,
        isNewRecord: false,
        isRequiredToday: true
      };
    }
  }
  
  /**
   * Calcula dias consecutivos para hábitos diários
   * Verifica consecutividade rigorosa desde hoje para trás
   */
  private static calculateConsecutiveDays(
    allCompletions: HabitCompletion[],
    today: Date
  ): number {
    
    console.log('🔍 Calculando dias consecutivos...');
    
    // Ordenar completions por data (mais recente primeiro)
    const sortedCompletions = allCompletions
      .map(c => ({
        ...c,
        normalizedDate: new Date(c.date.getTime())
      }))
      .sort((a, b) => b.normalizedDate.getTime() - a.normalizedDate.getTime());
    
    let consecutiveDays = 0;
    const todayNormalized = new Date(today);
    todayNormalized.setHours(0, 0, 0, 0);
    
    // Verificar consecutividade desde hoje para trás
    for (let i = 0; i < 365; i++) { // Máximo 1 ano para trás
      const checkDate = new Date(todayNormalized.getTime() - (i * 24 * 60 * 60 * 1000));
      checkDate.setHours(0, 0, 0, 0);
      
      const hasCompletion = sortedCompletions.some(completion => {
        const compDate = new Date(completion.date);
        compDate.setHours(0, 0, 0, 0);
        return compDate.getTime() === checkDate.getTime();
      });
      
      if (hasCompletion) {
        consecutiveDays++;
        console.log(`   ✅ ${checkDate.toLocaleDateString('pt-BR')}: Completado (${consecutiveDays} dias)`);
      } else {
        console.log(`   ❌ ${checkDate.toLocaleDateString('pt-BR')}: NÃO completado - QUEBRA consecutividade`);
        break; // Quebra a sequência
      }
    }
    
    console.log(`   🎯 Total de dias consecutivos: ${consecutiveDays}`);
    return consecutiveDays;
  }
  
  /**
   * Verifica se deve resetar streak baseado em dias perdidos anteriores
   */
  private static checkIfShouldReset(
    habit: HabitWithFrequency,
    allCompletions: HabitCompletion[],
    today: Date
  ): SequentialStreakResult {
    
    console.log('🔍 Verificando se deve resetar streak...');
    
    // Por simplicidade inicial, vamos manter o streak se ainda não completou hoje
    // A lógica de reset será aplicada pelo job diário
    
    return {
      currentStreak: habit.streak,
      shouldReset: false,
      isNewRecord: false,
      isRequiredToday: true
    };
  }
  
  /**
   * Função para resetar streaks que expiraram (chamada por job diário)
   * TODA VERIFICAÇÃO NO BACKEND
   */
  static shouldResetStreak(
    habit: HabitWithFrequency,
    allCompletions: HabitCompletion[],
    today: Date
  ): boolean {
    
    console.log(`🔍 Verificando se deve resetar streak para ${habit.id}`);
    
    // Se não é dia obrigatório, não resetar
    if (!this.isRequiredToday(habit.frequency, today)) {
      console.log('   ➡️ Hoje não é dia obrigatório, não resetar');
      return false;
    }
    
    // Se é dia obrigatório e não completou, resetar
    const todayNormalized = new Date(today);
    todayNormalized.setHours(0, 0, 0, 0);
    
    const completedToday = this.hasCompletionForDate(allCompletions, todayNormalized);
    
    if (!completedToday && habit.streak > 0) {
      console.log('   ❌ Não completou em dia obrigatório, RESETAR');
      return true;
    }
    
    console.log('   ✅ Não precisa resetar');
    return false;
  }
  
  /**
   * Função auxiliar para buscar último dia obrigatório
   */
  private static getLastRequiredDay(frequency: HabitFrequency | null, today: Date): Date | null {
    if (!frequency) return null;
    
    // Implementação simples - buscar até 7 dias atrás
    for (let i = 1; i <= 7; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(checkDate.getDate() - i);
      
      if (this.isRequiredToday(frequency, checkDate)) {
        return checkDate;
      }
    }
    
    return null;
  }
}

export default HabitSequentialCalculator;