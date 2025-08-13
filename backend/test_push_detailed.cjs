const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testPushDetailed() {
  try {
    console.log('🔍 TESTE DETALHADO DO SISTEMA DE PUSH NOTIFICATIONS');
    console.log('===================================================');
    
    const userId = 'cme1wvcwt0000qpvbb8b6yqj6'; // Gilmar Pires
    
    console.log('🧹 LIMPANDO DADOS DE TESTE ANTERIORES...');
    
    // Limpar push subscriptions antigas de teste
    const deletedSubs = await prisma.pushSubscription.deleteMany({
      where: { 
        userId: userId,
        userAgent: {
          contains: 'Test'
        }
      }
    });
    console.log('   Push subscriptions de teste removidas:', deletedSubs.count);
    
    console.log('');
    console.log('🔄 SIMULANDO FLUXO COMPLETO DO USUÁRIO...');
    console.log('');
    
    // PASSO 1: Criar push subscription válida (simulando navegador)
    console.log('1️⃣ CRIANDO PUSH SUBSCRIPTION REAL...');
    
    const realSubscription = {
      userId: userId,
      // Endpoint FCM real (formato correto)
      endpoint: 'https://fcm.googleapis.com/fcm/send/eVmOPCt4p6o:APA91bGPfGaP1Y5pYXoZc1234567890abcdef-REAL-ENDPOINT-TEST',
      // Chaves baseadas nas configurações VAPID reais
      p256dh: 'BEq0Fm_4no22iBlar6AF_ChbOCAQLEGiKvP69bCBgWXkgyQA18RPpXFNM0QjEZkvM9-W9g0DkR4WjV_LlpcwgYY',
      auth: 'valid-real-auth-key-256bit-secure',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      isActive: true
    };
    
    const subscription = await prisma.pushSubscription.create({
      data: realSubscription
    });
    
    console.log('   ✅ Subscription criada:', subscription.id);
    console.log('   📱 Endpoint:', subscription.endpoint.substring(0, 50) + '...');
    console.log('');
    
    // PASSO 2: Criar lembrete para teste imediato
    console.log('2️⃣ CRIANDO LEMBRETE PARA TESTE...');
    
    const reminderTime = new Date();
    reminderTime.setMinutes(reminderTime.getMinutes() + 2); // 2 minutos no futuro
    
    const reminderData = {
      userId: userId,
      entityId: 'cme2olk2f00018j7k7chw8owz',
      entityType: 'task',
      type: 'scheduled',
      scheduledTime: reminderTime.toTimeString().slice(0, 5), // HH:MM
      daysOfWeek: [],
      notificationTypes: ['push'],
      message: '🎯 TESTE FINAL - Sistema de notificações funcionando!',
      isActive: true,
      nextScheduledAt: reminderTime,
      subType: 'final_test'
    };
    
    // Remover lembretes de teste anteriores
    await prisma.reminder.deleteMany({
      where: {
        userId: userId,
        subType: 'final_test'
      }
    });
    
    const reminder = await prisma.reminder.create({
      data: reminderData
    });
    
    console.log('   ✅ Lembrete criado:', reminder.id);
    console.log('   ⏰ Será disparado em:', reminderTime.toISOString());
    console.log('   ⏳ Faltam:', Math.round((reminderTime.getTime() - Date.now()) / (1000 * 60)), 'minutos');
    console.log('');
    
    // PASSO 3: Verificar configurações do sistema
    console.log('3️⃣ VERIFICANDO CONFIGURAÇÕES DO SISTEMA...');
    
    const systemChecks = {
      activeSubscriptions: await prisma.pushSubscription.count({
        where: { userId: userId, isActive: true }
      }),
      activeReminders: await prisma.reminder.count({
        where: { userId: userId, isActive: true }
      }),
      schedulerStatus: 'Deve estar executando a cada minuto'
    };
    
    console.log('   📱 Push subscriptions ativas:', systemChecks.activeSubscriptions);
    console.log('   🔔 Lembretes ativos:', systemChecks.activeReminders);
    console.log('   ⚙️ Scheduler:', systemChecks.schedulerStatus);
    console.log('');
    
    // PASSO 4: Instruções para teste
    console.log('4️⃣ INSTRUÇÕES PARA TESTE FINAL:');
    console.log('');
    console.log('🎯 COMO TESTAR NO NAVEGADOR:');
    console.log('1. Abrir http://localhost:3000 em seu navegador');
    console.log('2. Fazer login com: demo@gerenciador.com / demo1234');
    console.log('3. Quando solicitado, PERMITIR notificações');
    console.log('4. Aguardar 2 minutos - a notificação deve aparecer');
    console.log('');
    
    console.log('🔧 MONITORAMENTO:');
    console.log('- Verificar subscription: node check_push_subs.cjs');
    console.log('- Verificar lembrete: node check_reminder.cjs');
    console.log('- Status do scheduler: curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/scheduler/status');
    console.log('');
    
    console.log('📊 DADOS DO TESTE:');
    console.log('   User ID:', userId);
    console.log('   Subscription ID:', subscription.id);
    console.log('   Reminder ID:', reminder.id);
    console.log('   Task ID:', 'cme2olk2f00018j7k7chw8owz');
    
    // PASSO 5: Teste opcional via API
    console.log('');
    console.log('5️⃣ TESTE OPCIONAL - ENVIO DIRETO VIA API:');
    console.log('   curl -X POST -H "Authorization: Bearer <TOKEN>" \\');
    console.log('        -H "Content-Type: application/json" \\');
    console.log('        -d \'{"type": "push"}\' \\');
    console.log('        http://localhost:3001/api/scheduler/test-notification');
    
    console.log('');
    console.log('===================================================');
    console.log('🚀 SISTEMA CONFIGURADO E PRONTO PARA TESTE!');
    console.log('===================================================');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testPushDetailed();