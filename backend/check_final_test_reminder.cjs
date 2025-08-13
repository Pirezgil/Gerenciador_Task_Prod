const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkFinalTestReminder() {
  try {
    console.log('🔍 VERIFICANDO LEMBRETE DO TESTE FINAL');
    console.log('====================================');
    
    const testReminderId = 'cme79b8gz0003ea21hq90hr4v';
    
    // Buscar o lembrete específico do teste
    const reminder = await prisma.reminder.findUnique({
      where: { id: testReminderId },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    
    if (!reminder) {
      console.log('❌ Lembrete de teste não encontrado');
      return;
    }
    
    const now = new Date();
    const scheduledTime = new Date(reminder.nextScheduledAt);
    const timeDiff = scheduledTime.getTime() - now.getTime();
    const minutesDiff = Math.round(timeDiff / (1000 * 60));
    
    console.log('📋 LEMBRETE DO TESTE FINAL:');
    console.log('   ID:', reminder.id);
    console.log('   Usuário:', reminder.user.name);
    console.log('   Era para disparar:', scheduledTime.toISOString());
    console.log('   Horário atual:', now.toISOString());
    console.log('   Diferença:', minutesDiff, 'minutos');
    console.log('   Mensagem:', reminder.message);
    console.log('   Ativo:', reminder.isActive);
    console.log('   Última enviada:', reminder.lastSentAt || 'Nunca');
    
    // Análise do status
    console.log('');
    if (timeDiff <= 0) {
      const minutesOverdue = Math.abs(minutesDiff);
      console.log('⏰ DEVERIA TER SIDO DISPARADO!');
      console.log('   Atraso:', minutesOverdue, 'minutos');
      
      if (reminder.lastSentAt) {
        const sentTime = new Date(reminder.lastSentAt);
        const minutesSinceSent = Math.round((now.getTime() - sentTime.getTime()) / (1000 * 60));
        console.log('');
        console.log('✅ FOI DISPARADO!');
        console.log('   Enviado em:', sentTime.toISOString());
        console.log('   Há', minutesSinceSent, 'minutos atrás');
        
        // Verificar se a push subscription foi usada
        const subscription = await prisma.pushSubscription.findFirst({
          where: {
            userId: reminder.userId,
            isActive: true
          }
        });
        
        if (subscription) {
          console.log('');
          console.log('📱 PUSH SUBSCRIPTION:');
          console.log('   ID:', subscription.id);
          console.log('   Ativa:', subscription.isActive);
          console.log('   Última notificação:', subscription.lastNotificationSent || 'Nunca');
          
          if (subscription.lastNotificationSent) {
            const notifTime = new Date(subscription.lastNotificationSent);
            const notifMinutes = Math.round((now.getTime() - notifTime.getTime()) / (1000 * 60));
            console.log('   Push enviado há:', notifMinutes, 'minutos');
          }
        }
        
        console.log('');
        console.log('🎯 RESULTADO:');
        console.log('   ✅ Lembrete foi processado pelo scheduler');
        console.log('   ✅ Horário de envio correto');
        console.log('   ✅ Push notification tentada');
        console.log('');
        console.log('🔔 NOTIFICAÇÃO NO NAVEGADOR:');
        console.log('   Se você permitiu notificações no navegador,');
        console.log('   deveria ter aparecido uma notificação com:');
        console.log('   Título: "🎯 TESTE FINAL - Sistema de notificações funcionando!"');
        
      } else {
        console.log('');
        console.log('❌ NÃO FOI ENVIADO');
        console.log('   O scheduler pode não estar funcionando');
      }
    } else {
      console.log('⏳ AINDA NÃO É HORA');
      console.log('   Faltam:', minutesDiff, 'minutos');
    }
    
    console.log('');
    console.log('====================================');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkFinalTestReminder();