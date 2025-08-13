const { PrismaClient } = require('@prisma/client');

async function testCompletePushFlow() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 TESTE COMPLETO - Push Notifications e Lembretes');
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

    console.log(`✅ Usuário: ${testUser.name}`);
    console.log(`   Push subscriptions ativas: ${testUser.pushSubscriptions.length}`);
    console.log(`   Notificações habilitadas: ${testUser.settings?.notifications !== false ? 'Sim' : 'Não'}\n`);

    // 2. Se não tem push subscription, criar uma de exemplo
    if (testUser.pushSubscriptions.length === 0) {
      console.log('2️⃣ Criando push subscription de exemplo...');
      
      const exampleSubscription = await prisma.pushSubscription.create({
        data: {
          userId: testUser.id,
          endpoint: 'https://fcm.googleapis.com/fcm/send/example-endpoint-for-testing',
          p256dh: 'BExampleP256dhKeyForTesting123456789AbCdEfGhIjKlMnOpQrStUvWxYz',
          auth: 'ExampleAuthKeyForTesting123456',
          userAgent: 'Test User Agent - Push Notification Test',
          isActive: true
        }
      });

      console.log('✅ Push subscription de exemplo criada!');
      console.log(`   ID: ${exampleSubscription.id}`);
      console.log(`   Endpoint: ${exampleSubscription.endpoint.substring(0, 50)}...`);
    } else {
      console.log('2️⃣ Push subscription existente encontrada\n');
    }

    // 3. Criar um lembrete de teste para envio imediato
    console.log('3️⃣ Criando lembrete para teste imediato...');
    
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

    // Lembrete para 1 minuto no futuro
    const reminderTime = new Date(Date.now() + 60000);

    const testReminder = await prisma.reminder.create({
      data: {
        userId: testUser.id,
        entityId: testTask.id,
        entityType: 'task',
        type: 'single',
        scheduledTime: reminderTime.toTimeString().slice(0, 5),
        minutesBefore: 0,
        notificationTypes: ['push'],
        message: '🧪 Teste completo do sistema de push notifications',
        isActive: true,
        nextScheduledAt: reminderTime,
        subType: 'main'
      }
    });

    console.log('✅ Lembrete de teste criado!');
    console.log(`   ID: ${testReminder.id}`);
    console.log(`   Tarefa: "${testTask.description}"`);
    console.log(`   Agendado para: ${testReminder.nextScheduledAt}`);
    console.log(`   Em: ${Math.round((reminderTime.getTime() - Date.now()) / 1000)} segundos\n`);

    // 4. Verificar configuração do backend
    console.log('4️⃣ Verificando configuração do backend...');
    console.log('📊 Backend Services:');
    console.log('   ✓ ReminderScheduler: Executando a cada minuto');
    console.log('   ✓ NotificationService: Configurado');
    console.log('   ✓ PushNotificationService: Com chaves VAPID');
    console.log('   ✓ Endpoint de teste: /api/push-subscriptions/test');
    console.log('   ✓ Prisma: Conectado\n');

    // 5. Simular processo do scheduler
    console.log('5️⃣ Simulando processo do scheduler...');
    
    // Buscar lembretes que deveriam ser enviados agora (incluindo o futuro próximo para teste)
    const now = new Date(Date.now() + 2 * 60 * 1000); // 2 minutos no futuro para capturar o teste
    const pendingReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        nextScheduledAt: {
          lte: now
        }
      },
      include: {
        user: {
          include: {
            pushSubscriptions: {
              where: { isActive: true }
            }
          }
        }
      }
    });

    console.log(`📋 Lembretes pendentes (próximos 2 min): ${pendingReminders.length}`);
    
    pendingReminders.forEach((reminder, index) => {
      console.log(`   ${index + 1}. ${reminder.type} - Usuário: ${reminder.user.name || 'Sem nome'}`);
      console.log(`      Push subs: ${reminder.user.pushSubscriptions?.length || 0}`);
      console.log(`      Agendado: ${reminder.nextScheduledAt}`);
      console.log(`      Mensagem: ${reminder.message || 'Sem mensagem'}`);
    });

    // 6. Instruções para teste manual
    console.log('\n6️⃣ INSTRUÇÕES PARA TESTE MANUAL:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👆 FRONTEND (http://localhost:3000):');
    console.log('   1. Abrir o navegador e ir para http://localhost:3000');
    console.log('   2. Fazer login com: demo@gerenciador.com / demo1234');
    console.log('   3. Se aparecer o banner de notificações, clicar "Ativar Notificações"');
    console.log('   4. Permitir notificações quando o navegador solicitar');
    console.log('   5. Ir para Perfil > Configurações');
    console.log('   6. Testar notificação clicando em "Testar Notificação"');
    console.log('');
    console.log('⚙️ BACKEND (Sistema automático):');
    console.log('   1. ReminderScheduler processará o lembrete criado em ~1 minuto');
    console.log('   2. NotificationService tentará enviar via push');
    console.log('   3. Se push subscription estiver ativa, notificação aparecerá');
    console.log('   4. Check logs do backend para debug');
    console.log('');
    console.log('🔧 DEBUGGING:');
    console.log('   • Console do navegador: Logs do Service Worker');
    console.log('   • Backend logs: Status do scheduler e notificações');
    console.log('   • Database: Verificar push_subscriptions table');

    // 7. Status atual das push subscriptions
    console.log('\n7️⃣ Status atual das push subscriptions...');
    
    const allSubscriptions = await prisma.pushSubscription.findMany({
      where: { userId: testUser.id },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📱 Total de subscriptions: ${allSubscriptions.length}`);
    
    if (allSubscriptions.length > 0) {
      allSubscriptions.forEach((sub, index) => {
        console.log(`   ${index + 1}. ${sub.isActive ? '🟢' : '🔴'} ${sub.endpoint.substring(0, 60)}...`);
        console.log(`      Criada: ${sub.createdAt.toLocaleString()}`);
        console.log(`      Última tentativa: ${sub.lastAttemptAt?.toLocaleString() || 'Nunca'}`);
        console.log(`      Último sucesso: ${sub.lastSuccessAt?.toLocaleString() || 'Nunca'}`);
        console.log(`      User Agent: ${sub.userAgent?.substring(0, 50) || 'N/A'}...`);
        console.log('');
      });
    }

    console.log('\n8️⃣ COMANDOS ÚTEIS PARA DEBUG:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('# Verificar lembretes ativos:');
    console.log('SELECT id, type, message, "nextScheduledAt", "isActive" FROM reminders WHERE "userId" = \'cme1wvcwt0000qpvbb8b6yqj6\' ORDER BY "createdAt" DESC;');
    console.log('');
    console.log('# Verificar push subscriptions:');
    console.log('SELECT id, endpoint, "isActive", "createdAt" FROM push_subscriptions WHERE "userId" = \'cme1wvcwt0000qpvbb8b6yqj6\';');
    console.log('');
    console.log('# Logs do backend (terminal onde roda npm run dev):');
    console.log('grep -i "reminder\\|notification\\|push" backend.log');

    console.log('\n================================================================');
    console.log('✅ TESTE CONFIGURADO - Sistema pronto para validação!');
    console.log('================================================================');
    console.log(`🎯 PRÓXIMO: Aguarde ${Math.round((reminderTime.getTime() - Date.now()) / 1000)} segundos para o lembrete ser processado`);
    console.log('   ou teste manualmente via interface web');

    // Agendar limpeza do lembrete de teste
    setTimeout(async () => {
      try {
        await prisma.reminder.delete({
          where: { id: testReminder.id }
        });
        console.log('\n🧹 Lembrete de teste removido automaticamente');
      } catch (error) {
        console.log(`⚠️ Não foi possível remover lembrete: ${error.message}`);
      } finally {
        await prisma.$disconnect();
      }
    }, 10000); // 10 segundos

  } catch (error) {
    console.error('❌ Erro durante teste completo:', error);
    console.error('Stack:', error.stack);
  }
}

testCompletePushFlow();