const { PrismaClient } = require('@prisma/client');

async function testReminderScheduler() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 ETAPA 3 - Análise do Serviço de Agendamento e Envio no Backend');
    console.log('================================================================\n');

    // 1. Verificar usuário de teste
    console.log('1️⃣ Verificando usuário de teste...');
    const testUser = await prisma.user.findFirst({
      where: { email: 'demo@gerenciador.com' },
      include: {
        settings: true,
        pushSubscriptions: {
          where: { isActive: true }
        }
      }
    });

    if (!testUser) {
      console.log('❌ Usuário de teste não encontrado');
      return;
    }

    console.log(`✅ Usuário: ${testUser.name} (${testUser.email})`);
    console.log(`   Notificações habilitadas: ${testUser.settings?.notifications !== false ? 'Sim' : 'Não'}`);
    console.log(`   Push subscriptions ativas: ${testUser.pushSubscriptions.length}\n`);

    // 2. Verificar lembretes ativos do usuário
    console.log('2️⃣ Verificando lembretes ativos do usuário...');
    const activeReminders = await prisma.reminder.findMany({
      where: {
        userId: testUser.id,
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Lembretes ativos encontrados: ${activeReminders.length}`);
    
    if (activeReminders.length > 0) {
      activeReminders.forEach((reminder, index) => {
        console.log(`   ${index + 1}. ${reminder.type.toUpperCase()} - ID: ${reminder.id}`);
        console.log(`      Entidade: ${reminder.entityType}/${reminder.entityId}`);
        console.log(`      Horário: ${reminder.scheduledTime || 'N/A'}`);
        console.log(`      Próximo envio: ${reminder.nextScheduledAt || 'Não agendado'}`);
        console.log(`      Último envio: ${reminder.lastSentAt || 'Nunca'}`);
        console.log(`      Tipos notificação: ${JSON.stringify(reminder.notificationTypes)}`);
        console.log('');
      });
    } else {
      console.log('   Nenhum lembrete ativo encontrado\n');
    }

    // 3. Criar um lembrete de teste para agendamento imediato
    console.log('3️⃣ Criando lembrete de teste para agendamento...');
    
    // Buscar uma tarefa para associar
    const testTask = await prisma.task.findFirst({
      where: { 
        userId: testUser.id,
        status: { not: 'completed' }
      }
    });

    if (!testTask) {
      console.log('❌ Nenhuma tarefa encontrada para teste');
      return;
    }

    // Criar lembrete que deve ser enviado em 2 minutos
    const futureTime = new Date();
    futureTime.setMinutes(futureTime.getMinutes() + 2);

    const testReminder = await prisma.reminder.create({
      data: {
        userId: testUser.id,
        entityId: testTask.id,
        entityType: 'task',
        type: 'single',
        scheduledTime: futureTime.toTimeString().slice(0, 5), // HH:MM format
        minutesBefore: 0,
        notificationTypes: ['push'],
        message: 'Lembrete de teste do scheduler - ETAPA 3',
        isActive: true,
        nextScheduledAt: futureTime,
        subType: 'main'
      }
    });

    console.log('✅ Lembrete de teste criado!');
    console.log(`   ID: ${testReminder.id}`);
    console.log(`   Agendado para: ${testReminder.nextScheduledAt}`);
    console.log(`   Em aproximadamente: ${Math.round((futureTime.getTime() - Date.now()) / 1000)} segundos\n`);

    // 4. Simular busca de lembretes que precisam ser enviados (função do scheduler)
    console.log('4️⃣ Simulando busca do scheduler por lembretes a serem enviados...');
    
    const now = new Date();
    const remindersToSend = await prisma.reminder.findMany({
      where: {
        isActive: true,
        nextScheduledAt: {
          lte: now // Lembretes que já devem ter sido enviados ou estão atrasados
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            settings: {
              select: {
                notifications: true
              }
            }
          }
        }
      }
    });

    console.log(`📋 Lembretes que deveriam ser enviados agora: ${remindersToSend.length}`);
    
    if (remindersToSend.length > 0) {
      remindersToSend.forEach((reminder, index) => {
        console.log(`   ${index + 1}. Usuário: ${reminder.user.name}`);
        console.log(`      Lembrete: ${reminder.type} - ${reminder.message || 'Sem mensagem'}`);
        console.log(`      Agendado para: ${reminder.nextScheduledAt}`);
        console.log(`      Atraso: ${Math.round((now.getTime() - new Date(reminder.nextScheduledAt).getTime()) / 1000)} segundos`);
        console.log(`      Notificações do usuário: ${reminder.user.settings?.notifications !== false ? 'Habilitadas' : 'Desabilitadas'}`);
        console.log('');
      });
    }

    // 5. Verificar push subscriptions para envio
    console.log('5️⃣ Verificando push subscriptions disponíveis...');
    
    const pushSubscriptions = await prisma.pushSubscription.findMany({
      where: {
        userId: testUser.id,
        isActive: true
      }
    });

    console.log(`📱 Push subscriptions ativas: ${pushSubscriptions.length}`);
    
    if (pushSubscriptions.length > 0) {
      pushSubscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. Endpoint: ${sub.endpoint.substring(0, 50)}...`);
        console.log(`      Criado: ${sub.createdAt}`);
        console.log(`      Última tentativa: ${sub.lastAttemptAt || 'Nunca'}`);
        console.log(`      Último sucesso: ${sub.lastSuccessAt || 'Nunca'}`);
      });
    } else {
      console.log('   ⚠️ Nenhuma push subscription ativa encontrada');
      console.log('   📝 Notificações push não poderão ser enviadas');
    }

    // 6. Análise do fluxo de agendamento
    console.log('\n6️⃣ Análise do fluxo de agendamento...');
    console.log('🔄 FLUXO IDENTIFICADO:');
    console.log('   1. Scheduler executa a cada 1 minuto (cron: */1 * * * *)');
    console.log('   2. Busca lembretes com nextScheduledAt <= agora');
    console.log('   3. Para cada lembrete encontrado:');
    console.log('      a) Verifica se usuário tem notificações habilitadas');
    console.log('      b) Busca push subscriptions ativas do usuário');
    console.log('      c) Envia notificação push via web-push');
    console.log('      d) Marca lembrete como enviado (lastSentAt)');
    console.log('      e) Calcula próximo agendamento (para lembretes recorrentes)');

    // 7. Verificar configuração do serviço
    console.log('\n7️⃣ Verificando disponibilidade dos serviços...');
    
    // Simular verificação se scheduler está rodando (não podemos acessar diretamente aqui)
    console.log('📊 Status estimado dos serviços:');
    console.log('   ⏰ Scheduler: Deve estar rodando (iniciado no app.ts)');
    console.log('   🔔 NotificationService: Disponível');
    console.log('   📱 PushService: Configurado com VAPID keys');
    console.log('   💾 Prisma: Conectado e funcionando');

    // Estatísticas finais
    console.log('\n8️⃣ Estatísticas do sistema de lembretes...');
    
    const totalReminders = await prisma.reminder.count();
    const activeRemindersCount = await prisma.reminder.count({
      where: { isActive: true }
    });
    const overdueReminders = await prisma.reminder.count({
      where: {
        isActive: true,
        nextScheduledAt: { lt: now }
      }
    });
    const sentReminders = await prisma.reminder.count({
      where: { lastSentAt: { not: null } }
    });

    console.log(`📈 Estatísticas gerais:`);
    console.log(`   Total de lembretes: ${totalReminders}`);
    console.log(`   Lembretes ativos: ${activeRemindersCount}`);
    console.log(`   Lembretes em atraso: ${overdueReminders}`);
    console.log(`   Lembretes já enviados: ${sentReminders}`);

    console.log('\n================================================================');
    console.log('✅ ETAPA 3 CONCLUÍDA - Análise do serviço de agendamento completa!');
    console.log('================================================================');

    // Limpar lembrete de teste
    await prisma.reminder.delete({
      where: { id: testReminder.id }
    });
    console.log('\n🧹 Lembrete de teste removido');

  } catch (error) {
    console.error('❌ Erro durante análise do scheduler:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testReminderScheduler();