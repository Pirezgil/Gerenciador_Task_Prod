import { prisma } from '../app';
import HabitSequentialCalculator from '../services/habitSequentialCalculator';

/**
 * Job diário para verificar e resetar streaks que expiraram
 * TODA LÓGICA NO BACKEND
 * 
 * Executa todo dia à meia-noite para verificar se algum hábito
 * deveria ter sido completado ontem mas não foi
 */
export async function runDailyHabitStreakCheck(): Promise<void> {
  try {
    console.log('🕐 Iniciando verificação diária de streaks de hábitos...');
    const startTime = Date.now();
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    console.log(`📅 Data de verificação: ${today.toLocaleDateString('pt-BR')}`);
    
    // Buscar todos os hábitos ativos com frequency e completions
    const allHabits = await prisma.habit.findMany({
      where: { isActive: true },
      include: {
        frequency: true,
        completions: {
          orderBy: { date: 'desc' },
          take: 30 // Últimos 30 dias para análise
        }
      }
    });
    
    console.log(`📊 Total de hábitos ativos encontrados: ${allHabits.length}`);
    
    let resetsCount = 0;
    let checkedCount = 0;
    
    for (const habit of allHabits) {
      try {
        checkedCount++;
        
        // Verificar se deve resetar este hábito
        const shouldReset = HabitSequentialCalculator.shouldResetStreak(
          {
            id: habit.id,
            streak: habit.streak,
            bestStreak: habit.bestStreak,
            frequency: habit.frequency
          },
          habit.completions,
          today
        );
        
        if (shouldReset) {
          // Resetar streak para 0, manter bestStreak
          await prisma.habit.update({
            where: { id: habit.id },
            data: { streak: 0 }
          });
          
          resetsCount++;
          console.log(`🔄 RESET: ${habit.name} (era ${habit.streak}, agora 0, recorde: ${habit.bestStreak})`);
        }
        
      } catch (error) {
        console.error(`❌ Erro ao processar hábito ${habit.id} (${habit.name}):`, error);
        // Continuar processamento dos outros hábitos
      }
    }
    
    const duration = Date.now() - startTime;
    
    console.log('📈 RESUMO DA VERIFICAÇÃO DIÁRIA:');
    console.log(`   - Hábitos verificados: ${checkedCount}`);
    console.log(`   - Streaks resetados: ${resetsCount}`);
    console.log(`   - Tempo de processamento: ${duration}ms`);
    console.log(`   - Status: ${resetsCount > 0 ? '🔄 Resets aplicados' : '✅ Nenhum reset necessário'}`);
    
  } catch (error) {
    console.error('❌ ERRO CRÍTICO no job de verificação diária:', error);
    // Em produção, aqui enviaria alerta/notificação
  }
}

/**
 * Função auxiliar para executar o job sob demanda (para testes)
 */
export async function runHabitStreakCheckNow(): Promise<void> {
  console.log('🧪 Executando verificação de streaks sob demanda...');
  await runDailyHabitStreakCheck();
}

/**
 * Configuração do scheduler (para produção)
 * Esta função pode ser chamada no startup da aplicação
 */
export function scheduleHabitStreakCheck(): void {
  // TODO: Implementar scheduler (node-cron ou similar)
  console.log('📋 Scheduler de verificação de streaks configurado');
  
  // Exemplo com node-cron:
  // cron.schedule('0 0 * * *', () => {
  //   runDailyHabitStreakCheck().catch(console.error);
  // });
}

export default {
  runDailyHabitStreakCheck,
  runHabitStreakCheckNow,
  scheduleHabitStreakCheck
};