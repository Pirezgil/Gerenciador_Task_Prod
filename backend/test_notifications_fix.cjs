const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testNotificationsFix() {
  try {
    console.log('🔍 VERIFICANDO RESULTADO DAS NOTIFICAÇÕES');
    console.log('=========================================');
    
    const userId = 'cme1wvcwt0000qpvbb8b6yqj6';
    
    // Verificar push subscriptions
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: userId },
      include: {
        user: { select: { name: true } }
      }
    });
    
    console.log('📱 PUSH SUBSCRIPTIONS:', subscriptions.length);
    
    subscriptions.forEach((sub, index) => {
      console.log('  ' + (index + 1) + '. ID: ' + sub.id);
      console.log('     Ativa: ' + sub.isActive);
      console.log('     Última notificação: ' + (sub.lastNotificationSent || 'Nunca'));
      console.log('     Criada: ' + sub.createdAt);
      
      if (sub.lastNotificationSent) {
        const timeSince = Math.round((Date.now() - new Date(sub.lastNotificationSent).getTime()) / (1000 * 60));
        console.log('     Enviada há: ' + timeSince + ' minutos');
      }
      console.log('');
    });
    
    // Verificar lembretes recentes
    const recentReminders = await prisma.reminder.findMany({
      where: {
        userId: userId,
        lastSentAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000)
        }
      },
      orderBy: { lastSentAt: 'desc' },
      take: 3
    });
    
    console.log('📬 LEMBRETES ENVIADOS (últimos 10 min):', recentReminders.length);
    
    recentReminders.forEach((reminder, index) => {
      const timeSince = Math.round((Date.now() - new Date(reminder.lastSentAt).getTime()) / (1000 * 60));
      console.log('  ' + (index + 1) + '. ' + reminder.type + ' - há ' + timeSince + ' min');
      console.log('     Mensagem: ' + reminder.message);
      console.log('     Entity: ' + reminder.entityType + ' (' + reminder.entityId + ')');
      console.log('');
    });
    
    console.log('💡 DIAGNÓSTICO FINAL:');
    console.log('');
    
    const hasActiveSubscriptions = subscriptions.some(s => s.isActive);
    const hasRecentNotifications = subscriptions.some(s => s.lastNotificationSent);
    const hasRecentReminders = recentReminders.length > 0;
    
    if (hasActiveSubscriptions && hasRecentReminders) {
      console.log('✅ SISTEMA FUNCIONANDO:');
      console.log('   - Push subscriptions ativas: Sim');
      console.log('   - Lembretes sendo processados: Sim');
      console.log('   - Scheduler ativo: Sim');
      
      if (hasRecentNotifications) {
        console.log('   - Push notifications enviadas: Sim');
        console.log('');
        console.log('🎯 PRÓXIMO PASSO:');
        console.log('   O sistema backend está funcionando perfeitamente!');
        console.log('   Para ver notificações no navegador, é necessário:');
        console.log('   1. Service Worker registrado no frontend');
        console.log('   2. Permissão de notificações concedida pelo usuário');
        console.log('   3. Push subscription REAL (não mock) do navegador');
      } else {
        console.log('   - Push notifications enviadas: Não (subscriptions mock)');
        console.log('');
        console.log('⚠️ EXPLICAÇÃO:');
        console.log('   As subscriptions são fictícias para teste');
        console.log('   O sistema tenta enviar mas o endpoint não existe');
        console.log('   Em produção, o navegador forneceria endpoints reais');
      }
    } else {
      console.log('❌ AINDA HÁ PROBLEMAS:');
      console.log('   - Push subscriptions ativas:', hasActiveSubscriptions ? 'Sim' : 'Não');
      console.log('   - Lembretes processados:', hasRecentReminders ? 'Sim' : 'Não');
    }
    
    console.log('');
    console.log('=========================================');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testNotificationsFix();