// ============================================================================
// TEST ACHIEVEMENT FLOW - Script para testar o fluxo completo de conquistas
// ============================================================================

import { tasksApi } from '@/lib/api';

/**
 * Script de teste para validar o fluxo completo:
 * 1. Criar tarefa
 * 2. Completar tarefa 
 * 3. Verificar se conquista foi criada
 * 4. Exibir notificação
 */
export class AchievementFlowTester {
  
  /**
   * Testa o fluxo completo de criação de conquista ao completar tarefa
   */
  static async testTaskCompletionFlow() {
    try {
      console.log('🧪 Iniciando teste do fluxo de conquistas...');
      
      // 1. Criar tarefa de teste
      console.log('1️⃣ Criando tarefa de teste...');
      const newTask = await tasksApi.createTask({
        description: '🧪 Tarefa de Teste - Sistema de Recompensas TDAH',
        energyPoints: 5, // Para conquistar Faísca Ouro
        type: 'urgent', 
        status: 'pending',
        plannedFor: new Date().toISOString().split('T')[0]
      });
      console.log('✅ Tarefa criada:', newTask.id);
      
      // 2. Completar a tarefa
      console.log('2️⃣ Completando tarefa...');
      const completedTask = await tasksApi.completeTask(newTask.id);
      console.log('✅ Tarefa completada:', completedTask.status);
      
      // 3. Aguardar processamento das conquistas (1 segundo)
      console.log('3️⃣ Aguardando processamento das conquistas...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 4. Verificar se conquistas foram criadas
      console.log('4️⃣ Verificando conquistas criadas...');
      const response = await fetch('/api/achievements', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
        }
      });
      
      if (response.ok) {
        const achievementData = await response.json();
        const recentAchievements = achievementData.achievements
          .filter((a: any) => {
            const timeDiff = Date.now() - new Date(a.earnedAt).getTime();
            return timeDiff < 5000; // Últimos 5 segundos
          });
          
        console.log('🏆 Conquistas recentes encontradas:', recentAchievements.length);
        recentAchievements.forEach((achievement: any) => {
          console.log(`  - ${achievement.type} (${achievement.subtype || 'N/A'})`);
        });
        
        return {
          success: true,
          taskId: newTask.id,
          achievementsCount: recentAchievements.length,
          achievements: recentAchievements
        };
      } else {
        throw new Error('Falha ao buscar conquistas');
      }
      
    } catch (error) {
      console.error('❌ Erro no teste do fluxo de conquistas:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Testa o fluxo de maestria diária
   */
  static async testDailyMasteryFlow() {
    try {
      console.log('🧪 Testando maestria diária...');
      
      const response = await fetch('/api/achievements/check-daily-mastery', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth-token')}`,
          'Content-Type': 'application/json',
        }
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('👑 Resultado da maestria diária:', result);
        return result;
      } else {
        throw new Error('Falha ao verificar maestria diária');
      }
      
    } catch (error) {
      console.error('❌ Erro no teste de maestria diária:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  /**
   * Limpa dados de teste criados
   */
  static async cleanupTestData(taskId: string) {
    try {
      console.log('🧹 Limpando dados de teste...');
      await tasksApi.deleteTask(taskId);
      console.log('✅ Tarefa de teste removida');
    } catch (error) {
      console.error('⚠️ Erro ao limpar dados de teste:', error);
    }
  }
}

// Função de conveniência para teste rápido
export async function quickTestAchievements() {
  console.log('🚀 Teste Rápido - Sistema de Recompensas TDAH');
  console.log('================================================');
  
  const result = await AchievementFlowTester.testTaskCompletionFlow();
  
  if (result.success) {
    console.log('🎉 SUCESSO! O fluxo está funcionando corretamente!');
    console.log(`📊 Conquistas criadas: ${result.achievementsCount}`);
    
    // Aguardar um pouco antes de limpar
    setTimeout(() => {
      AchievementFlowTester.cleanupTestData(result.taskId);
    }, 3000);
  } else {
    console.log('❌ FALHA! Verificar configuração do sistema.');
    console.log('Erro:', result.error);
  }
  
  return result;
}

// Para usar no console do navegador:
// window.testAchievements = quickTestAchievements;
if (typeof window !== 'undefined') {
  (window as any).testAchievements = quickTestAchievements;
  (window as any).AchievementFlowTester = AchievementFlowTester;
  
  // Função para testar se o cache de notificações está funcionando
  (window as any).testNotificationCache = () => {
    console.log('🧪 Testando cache de notificações...');
    console.log('📋 Use clearShownAchievements() para limpar cache');
    console.log('📋 Use listShownAchievements() para ver cache atual');
    console.log('🔄 Complete uma tarefa e mude de página para testar');
  };
}