import { useState, useCallback, useEffect } from 'react';
import { useHabitStreak } from './api/useHabitStreak';
import { useTodayProgress, markCelebrationShown } from './api/useDailyProgress';
import { useQueryClient } from '@tanstack/react-query';

export function useAllHabitsComplete() {
  const [showCelebration, setShowCelebration] = useState(false);
  const { data: streak, refetch: refetchStreak } = useHabitStreak();
  const { data: todayProgress, refetch: refetchTodayProgress } = useTodayProgress();
  const queryClient = useQueryClient();

  const triggerCelebration = useCallback(async () => {
    console.log('🎯 triggerCelebration executando...');
    
    // Mostrar celebração
    setShowCelebration(true);

    // Garantir que temos os dados mais recentes da streak (sem dependência circular)
    try {
      await refetchStreak();
      console.log('🎉 CELEBRAÇÃO DE TODOS OS HÁBITOS ATIVADA!');
    } catch (error) {
      console.error('Erro ao fazer refetch da streak:', error);
    }
  }, [refetchStreak]);

  const hideCelebration = useCallback(async () => {
    console.log('🔚 Escondendo celebração...');
    setShowCelebration(false);
    
    // Marcar celebração como mostrada no banco de dados
    try {
      await markCelebrationShown();
      
      // Invalidar cache para garantir dados atualizados
      const today = new Date().toISOString().split('T')[0];
      queryClient.invalidateQueries({ queryKey: ['dailyProgress', today] });
      
      console.log('✅ Celebração marcada como mostrada no banco');
    } catch (error) {
      console.error('❌ Erro ao marcar celebração como mostrada:', error);
    }
  }, [queryClient]);

  // Função para marcar que deve celebrar (chamada quando todos os hábitos são completados)
  const markForCelebration = useCallback(async () => {
    // Agora a celebração é controlada pelo banco via allHabitsCompleted
    // O backend já vai marcar automaticamente quando processar os hábitos
    console.log('🎯 Celebração será ativada pelo backend via allHabitsCompleted');
    console.log('⏳ Aguardando backend processar e API atualizar...');
    
    // Invalidar o cache do dailyProgress para forçar nova busca
    const today = new Date().toISOString().split('T')[0];
    queryClient.invalidateQueries({ queryKey: ['dailyProgress', today] });
    
    // Aguardar um pouco e fazer refetch manual para garantir
    setTimeout(async () => {
      console.log('🔄 Fazendo refetch manual do progresso diário...');
      await refetchTodayProgress();
    }, 2000);
    
    // Não precisa mais chamar triggerCelebration aqui
    // O useEffect vai detectar quando todayProgress.allHabitsCompleted ficar true
  }, [queryClient, refetchTodayProgress]);

  // Função para verificar se todos os hábitos foram completados hoje
  const checkAllHabitsComplete = useCallback((habits: any[]) => {
    console.log('🚀 INICIANDO checkAllHabitsComplete');
    const today = new Date().toISOString().split('T')[0];
    const todayDate = new Date();
    const dayOfWeek = todayDate.getDay();
    
    console.log('📅 Data de hoje:', today);
    console.log('📅 Dia da semana:', dayOfWeek, '(0=dom, 4=qui, 6=sáb)');
    console.log('📊 Hábitos recebidos (TODOS):', habits.length);
    
    if (habits.length === 0) {
      console.log('❌ Nenhum hábito encontrado');
      return false;
    }
    
    // FILTRAR apenas hábitos que são para hoje
    const todayHabits = habits.filter(habit => {
      if (!habit.isActive) return false;
      
      const frequency = habit.frequency;
      if (!frequency) return true; // Se não tem frequência, é para todos os dias
      
      let isForToday = false;
      
      switch (frequency.type) {
        case 'daily':
          isForToday = true;
          break;
        case 'weekly':
          isForToday = frequency.daysOfWeek?.includes(dayOfWeek) ?? false;
          break;
        case 'weekdays':
          isForToday = frequency.daysOfWeek?.includes(dayOfWeek) ?? false;
          break;
        case 'custom':
          isForToday = frequency.daysOfWeek?.includes(dayOfWeek) ?? false;
          break;
        default:
          isForToday = true;
      }
      
      console.log(`  🔍 ${habit.name}: frequency=${frequency.type}, days=${frequency.daysOfWeek}, forToday=${isForToday ? '✅' : '❌'}`);
      return isForToday;
    });
    
    console.log('📊 Hábitos PARA HOJE:', todayHabits.length);
    
    const habitsStatus = todayHabits.map(h => {
      const hasCompletion = h.completions?.some((c: any) => c.date === today) || false;
      console.log(`  - ${h.name}: ${hasCompletion ? '✅' : '❌'} (completions: ${h.completions?.length || 0})`);
      if (h.completions?.length > 0) {
        console.log(`    Dates:`, h.completions.map((c: any) => c.date));
      }
      return {
        name: h.name,
        completed: hasCompletion
      };
    });
    
    const allCompleted = todayHabits.every(habit => 
      habit.completions?.some((completion: any) => 
        completion.date === today
      )
    );

    console.log('🔍 RESULTADO DA VERIFICAÇÃO:', {
      totalHabitsForToday: todayHabits.length,
      allCompleted,
      habitsStatus
    });

    if (allCompleted && todayHabits.length > 0) {
      console.log('🎉 TODOS OS HÁBITOS DE HOJE COMPLETADOS!');
      
      // Verificar se já celebrou hoje através do banco de dados
      const alreadyCelebrated = todayProgress?.allHabitsCompleted || false;
      
      console.log('📅 Já celebrou hoje (banco):', alreadyCelebrated);
      console.log('📊 Today progress:', todayProgress);
      
      // Só marcar para celebração se ainda não celebrou hoje
      if (!alreadyCelebrated) {
        console.log('🎯 Marcando para celebração! (baseado no banco)');
        markForCelebration();
      } else {
        console.log('⚠️ Já celebrou hoje (confirmado pelo banco), não marcando novamente');
      }
    } else {
      console.log('❌ Nem todos os hábitos de hoje foram completados ainda');
    }

    return allCompleted && todayHabits.length > 0;
  }, [markForCelebration, todayProgress]);

  // Verificar se deve mostrar celebração baseado no banco de dados
  useEffect(() => {
    console.log('🚀 useAllHabitsComplete useEffect rodando...', {
      allHabitsCompleted: todayProgress?.allHabitsCompleted,
      celebrationShown: todayProgress?.celebrationShown,
      showCelebration
    });
    
    // Só ativar celebração quando:
    // 1. Banco indica que todos hábitos foram completados (allHabitsCompleted = true)
    // 2. Celebração ainda não foi mostrada (celebrationShown = false)
    // 3. Não está mostrando celebração no momento (showCelebration = false)
    if (todayProgress?.allHabitsCompleted && !todayProgress?.celebrationShown && !showCelebration) {
      console.log('🎉 TODOS HÁBITOS COMPLETADOS E CELEBRAÇÃO AINDA NÃO MOSTRADA!');
      console.log('🎯 ATIVANDO CELEBRAÇÃO...');
      
      // Usar timeout para evitar execução dupla em caso de re-render rápido
      const timeoutId = setTimeout(() => {
        triggerCelebration();
      }, 100);
      
      // Cleanup para evitar execuções duplas
      return () => {
        clearTimeout(timeoutId);
      };
    } else {
      console.log('❌ Não vai celebrar:', {
        allHabitsCompleted: todayProgress?.allHabitsCompleted,
        celebrationShown: todayProgress?.celebrationShown,
        showCelebration,
        todayProgress: !!todayProgress
      });
    }
  }, [todayProgress?.allHabitsCompleted, todayProgress?.celebrationShown, showCelebration, triggerCelebration]);

  return {
    showCelebration,
    triggerCelebration,
    hideCelebration,
    markForCelebration,
    checkAllHabitsComplete,
    streakCount: streak?.currentStreak || 1,
    bestStreak: streak?.bestStreak || 1
  };
}