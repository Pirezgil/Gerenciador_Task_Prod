require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * SCRIPT DE PREPARAÇÃO DE CENÁRIO DE TESTE FINAL
 * 
 * Objetivo: Configurar o banco de dados para um teste completo de regressão
 * antes do deploy em produção, criando um ambiente limpo e consistente.
 * 
 * Persona: Database Testing - Configuração de estado específico para testes
 */

async function prepareProductionTestScenario() {
  try {
    console.log('🧪 PREPARANDO CENÁRIO DE TESTE FINAL PARA PRODUÇÃO');
    console.log('='.repeat(60));

    // Dados do usuário de teste
    const TEST_USER_EMAIL = 'demo@gerenciador.com';
    const TEST_USER_ID = 'cme1wvcwt0000qpvbb8b6yqj6';
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    console.log('📋 Informações do teste:');
    console.log(`   - Usuário: ${TEST_USER_EMAIL}`);
    console.log(`   - ID: ${TEST_USER_ID}`);
    console.log(`   - Data: ${todayStr}`);
    console.log('');

    // 1. LIMPEZA DE DADOS DE TESTE ANTIGOS
    console.log('🧹 ETAPA 1: Limpando dados de teste antigos...');

    // Limpar conquistas de teste para permitir novas celebrações
    const deletedAchievements = await prisma.achievement.deleteMany({
      where: {
        userId: TEST_USER_ID,
        earnedAt: {
          gte: new Date(today.getFullYear(), today.getMonth(), today.getDate())
        }
      }
    });
    console.log(`   - Conquistas removidas: ${deletedAchievements.count}`);

    // Limpar progresso diário para reset das métricas
    const deletedProgress = await prisma.dailyProgress.deleteMany({
      where: {
        userId: TEST_USER_ID,
        date: new Date(todayStr)
      }
    });
    console.log(`   - Progresso diário removido: ${deletedProgress.count}`);

    // Limpar logs de energia diária para reset do orçamento
    const deletedEnergyLogs = await prisma.dailyEnergyLog.deleteMany({
      where: {
        userId: TEST_USER_ID,
        date: new Date(todayStr)
      }
    });
    console.log(`   - Logs de energia removidos: ${deletedEnergyLogs.count}`);

    // Limpar subscriptions de push corrompidas ou inativas
    const deletedPushSubs = await prisma.pushSubscription.deleteMany({
      where: {
        userId: TEST_USER_ID,
        isActive: false
      }
    });
    console.log(`   - Push subscriptions inativas removidas: ${deletedPushSubs.count}`);

    // Limpar tarefas de teste antigas (marcadas como deletadas)
    const deletedTasks = await prisma.task.deleteMany({
      where: {
        userId: TEST_USER_ID,
        isDeleted: true
      }
    });
    console.log(`   - Tarefas deletadas permanentemente removidas: ${deletedTasks.count}`);

    console.log('');

    // 2. CONFIGURAÇÃO DO USUÁRIO DE TESTE
    console.log('👤 ETAPA 2: Configurando usuário de teste...');

    // Verificar se usuário existe
    let testUser = await prisma.user.findUnique({
      where: { id: TEST_USER_ID },
      include: { settings: true }
    });

    if (!testUser) {
      // Criar usuário de teste se não existir
      testUser = await prisma.user.create({
        data: {
          id: TEST_USER_ID,
          name: 'Gilmar Pires',
          email: TEST_USER_EMAIL,
          password: '$2b$10$example', // Hash de 'demo1234'
          emailVerified: true,
          settings: {
            create: {
              dailyEnergyBudget: 12,
              theme: 'light',
              timezone: 'America/Sao_Paulo',
              notifications: true,
              sandboxPassword: 'sandbox123',
              sandboxEnabled: true
            }
          }
        },
        include: { settings: true }
      });
      console.log('   - Usuário de teste criado');
    } else {
      // Atualizar configurações para valores padrão de teste
      await prisma.userSettings.upsert({
        where: { userId: TEST_USER_ID },
        update: {
          dailyEnergyBudget: 12,
          notifications: true,
          sandboxEnabled: true
        },
        create: {
          userId: TEST_USER_ID,
          dailyEnergyBudget: 12,
          theme: 'light',
          timezone: 'America/Sao_Paulo',
          notifications: true,
          sandboxPassword: 'sandbox123',
          sandboxEnabled: true
        }
      });
      console.log('   - Configurações do usuário atualizadas');
    }

    console.log('');

    // 3. CRIAÇÃO DE PROJETOS DE TESTE
    console.log('📁 ETAPA 3: Criando projetos de teste...');

    // Limpar projetos de teste existentes
    await prisma.project.deleteMany({
      where: {
        userId: TEST_USER_ID,
        name: { in: ['Projeto Teste A', 'Projeto Teste B'] }
      }
    });

    const testProjects = await prisma.project.createMany({
      data: [
        {
          id: 'test_project_a_001',
          userId: TEST_USER_ID,
          name: 'Projeto Teste A',
          icon: '🚀',
          color: '#3B82F6',
          status: 'active'
        },
        {
          id: 'test_project_b_001',
          userId: TEST_USER_ID,
          name: 'Projeto Teste B',
          icon: '💡',
          color: '#10B981',
          status: 'active'
        }
      ]
    });
    console.log(`   - Projetos criados: ${testProjects.count}`);

    console.log('');

    // 4. CRIAÇÃO DE TAREFAS DE TESTE
    console.log('📝 ETAPA 4: Criando cenário de tarefas...');

    // Limpar tarefas de teste existentes
    await prisma.task.deleteMany({
      where: {
        userId: TEST_USER_ID,
        description: { contains: '[TESTE]' }
      }
    });

    const testTasks = [
      {
        id: 'test_task_001',
        userId: TEST_USER_ID,
        projectId: 'test_project_a_001',
        description: '[TESTE] Tarefa de Alta Prioridade',
        energyPoints: 5,
        status: 'pending',
        plannedForToday: true,
        dueDate: new Date(todayStr)
      },
      {
        id: 'test_task_002',
        userId: TEST_USER_ID,
        projectId: 'test_project_a_001',
        description: '[TESTE] Tarefa de Média Prioridade',
        energyPoints: 3,
        status: 'pending',
        plannedForToday: true
      },
      {
        id: 'test_task_003',
        userId: TEST_USER_ID,
        projectId: 'test_project_b_001',
        description: '[TESTE] Tarefa de Baixa Prioridade',
        energyPoints: 1,
        status: 'pending',
        plannedForToday: false
      },
      {
        id: 'test_task_004',
        userId: TEST_USER_ID,
        description: '[TESTE] Tarefa Recorrente Semanal',
        energyPoints: 2,
        status: 'pending',
        isRecurring: true,
        plannedForToday: true
      },
      {
        id: 'test_task_005',
        userId: TEST_USER_ID,
        description: '[TESTE] Tarefa Já Completada',
        energyPoints: 3,
        status: 'completed',
        completedAt: new Date()
      }
    ];

    for (const taskData of testTasks) {
      await prisma.task.create({ data: taskData });
    }
    console.log(`   - Tarefas criadas: ${testTasks.length}`);

    // Criar recorrência para tarefa recorrente
    await prisma.taskRecurrence.create({
      data: {
        taskId: 'test_task_004',
        frequency: 'weekly',
        daysOfWeek: [1, 3, 5], // Segunda, Quarta, Sexta
        nextDue: new Date(todayStr)
      }
    });
    console.log('   - Recorrência configurada para tarefa 004');

    console.log('');

    // 5. CRIAÇÃO DE HÁBITOS DE TESTE
    console.log('🏃 ETAPA 5: Criando hábitos de teste...');

    // Limpar hábitos de teste existentes
    await prisma.habit.deleteMany({
      where: {
        userId: TEST_USER_ID,
        name: { contains: '[TESTE]' }
      }
    });

    const testHabits = [
      {
        id: 'test_habit_001',
        userId: TEST_USER_ID,
        name: '[TESTE] Exercitar-se',
        description: 'Hábito de exercício diário',
        icon: '🏃',
        color: '#EF4444',
        targetCount: 1,
        isActive: true
      },
      {
        id: 'test_habit_002',
        userId: TEST_USER_ID,
        name: '[TESTE] Ler',
        description: 'Hábito de leitura diária',
        icon: '📚',
        color: '#8B5CF6',
        targetCount: 30, // 30 minutos
        isActive: true
      }
    ];

    for (const habitData of testHabits) {
      await prisma.habit.create({ data: habitData });
    }
    console.log(`   - Hábitos criados: ${testHabits.length}`);

    console.log('');

    // 6. CONFIGURAÇÃO DE LEMBRETES DE TESTE
    console.log('🔔 ETAPA 6: Configurando lembretes...');

    // Limpar lembretes antigos
    await prisma.reminder.deleteMany({
      where: {
        userId: TEST_USER_ID,
        message: { contains: '[TESTE]' }
      }
    });

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const testReminder = await prisma.reminder.create({
      data: {
        userId: TEST_USER_ID,
        entityId: 'test_task_001',
        entityType: 'task',
        type: 'single',
        scheduledTime: '14:00',
        notificationTypes: ['browser'],
        message: '[TESTE] Lembrete para tarefa de alta prioridade',
        isActive: true,
        nextScheduledAt: new Date(`${todayStr}T14:00:00`)
      }
    });
    console.log('   - Lembrete criado para tarefa de teste');

    console.log('');

    // 7. VALIDAÇÃO FINAL DO CENÁRIO
    console.log('✅ ETAPA 7: Validando cenário criado...');

    const scenarioValidation = {
      user: await prisma.user.count({ where: { id: TEST_USER_ID } }),
      projects: await prisma.project.count({ where: { userId: TEST_USER_ID } }),
      tasks: await prisma.task.count({ where: { userId: TEST_USER_ID, isDeleted: false } }),
      habits: await prisma.habit.count({ where: { userId: TEST_USER_ID } }),
      reminders: await prisma.reminder.count({ where: { userId: TEST_USER_ID, isActive: true } }),
      todayTasks: await prisma.task.count({ 
        where: { 
          userId: TEST_USER_ID, 
          plannedForToday: true,
          status: 'pending'
        } 
      })
    };

    console.log('📊 Resumo do cenário preparado:');
    console.log(`   - Usuário configurado: ${scenarioValidation.user > 0 ? '✅' : '❌'}`);
    console.log(`   - Projetos ativos: ${scenarioValidation.projects}`);
    console.log(`   - Tarefas totais: ${scenarioValidation.tasks}`);
    console.log(`   - Tarefas para hoje: ${scenarioValidation.todayTasks}`);
    console.log(`   - Hábitos ativos: ${scenarioValidation.habits}`);
    console.log(`   - Lembretes ativos: ${scenarioValidation.reminders}`);

    console.log('');
    console.log('🎯 CENÁRIO DE TESTE FINAL PREPARADO COM SUCESSO!');
    console.log('');
    console.log('📋 Cenários de teste disponíveis:');
    console.log('   1. Login com demo@gerenciador.com / demo1234');
    console.log('   2. Visualizar tarefas do dia (3 pendentes)');
    console.log('   3. Completar tarefas e testar sistema de energia');
    console.log('   4. Testar criação de novos projetos e tarefas');
    console.log('   5. Validar hábitos e sistema de conquistas');
    console.log('   6. Testar lembretes e notificações');
    console.log('   7. Acessar Caixa de Areia com senha: sandbox123');
    console.log('');
    console.log('🚀 Sistema pronto para testes de regressão pré-produção!');

  } catch (error) {
    console.error('❌ Erro ao preparar cenário de teste:', error.message);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
    console.log('✅ Conexão com banco encerrada');
  }
}

prepareProductionTestScenario();