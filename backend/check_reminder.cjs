const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkReminderStatus() {
  try {
    const reminderId = 'cme78xkf5000113w5468bprey';
    
    console.log('🔍 VERIFICANDO STATUS DO LEMBRETE CRIADO');
    console.log('=======================================');
    console.log('ID do lembrete:', reminderId);
    console.log('Horário atual:', new Date().toISOString());
    console.log('');
    
    // Buscar o lembrete específico
    const reminder = await prisma.reminder.findUnique({
      where: { id: reminderId },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    
    if (!reminder) {
      console.log('❌ Lembrete não encontrado');
      return;
    }
    
    const now = new Date();
    const scheduledTime = new Date(reminder.nextScheduledAt);
    const timeDiff = scheduledTime.getTime() - now.getTime();
    const minutesDiff = Math.round(timeDiff / (1000 * 60));
    
    console.log('📋 STATUS DO LEMBRETE:');
    console.log('  Usuário:', reminder.user.name);
    console.log('  Era para disparar em:', scheduledTime.toISOString());
    console.log('  Ativo:', reminder.isActive);
    console.log('  Última enviada:', reminder.lastSentAt || 'Nunca');
    console.log('  Mensagem:', reminder.message);
    
    if (timeDiff <= 0) {
      const minutesOverdue = Math.abs(minutesDiff);
      console.log('');
      if (reminder.lastSentAt) {
        const sentTime = new Date(reminder.lastSentAt);
        const minutesSinceSent = Math.round((now.getTime() - sentTime.getTime()) / (1000 * 60));
        console.log('✅ LEMBRETE FOI DISPARADO!');
        console.log('  🕒 Enviado em:', sentTime.toISOString());
        console.log('  ⏱️ Enviado há:', minutesSinceSent, 'minutos');
        
        // Verificar se foi reagendado (para tipo scheduled)
        if (reminder.type === 'scheduled' && reminder.isActive) {
          const nextScheduled = new Date(reminder.nextScheduledAt);
          const hoursUntilNext = Math.round((nextScheduled.getTime() - now.getTime()) / (1000 * 60 * 60));
          console.log('  🔄 Próximo disparo:', nextScheduled.toISOString());
          console.log('  ⏳ Em:', hoursUntilNext, 'horas (reagendado para amanhã)');
        }
        
        console.log('  🎉 SUCESSO TOTAL!');
      } else {
        console.log('🚨 PROBLEMA: Lembrete deveria ter disparado há', minutesOverdue, 'min, mas não foi enviado!');
        console.log('  Possível problema no scheduler ou notificationService');
        
        // Verificar se há lembretes em atraso no sistema
        const overdueCount = await prisma.reminder.count({
          where: {
            isActive: true,
            nextScheduledAt: { lte: now }
          }
        });
        console.log('  Lembretes em atraso no sistema:', overdueCount);
      }
    } else {
      console.log('');
      console.log('⏳ AINDA AGUARDANDO DISPARO');
      console.log('  Faltam:', minutesDiff, 'minutos');
    }
    
    // Verificar stats gerais do scheduler
    console.log('');
    console.log('📊 ATIVIDADE RECENTE DO SISTEMA:');
    
    const recentReminders = await prisma.reminder.findMany({
      where: {
        lastSentAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // últimos 10 minutos
        }
      },
      select: {
        id: true,
        type: true,
        lastSentAt: true,
        entityType: true
      },
      orderBy: { lastSentAt: 'desc' },
      take: 5
    });
    
    console.log('  Lembretes enviados nos últimos 10 min:', recentReminders.length);
    
    if (recentReminders.length > 0) {
      console.log('  Últimos envios:');
      recentReminders.forEach((r, index) => {
        const timeSince = Math.round((now.getTime() - new Date(r.lastSentAt).getTime()) / (1000 * 60));
        console.log('    ' + (index + 1) + '. ' + r.type + ' (' + r.entityType + ') - há ' + timeSince + ' min');
      });
    }
    
    console.log('');
    console.log('=======================================');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReminderStatus();