const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function monitorTestReminder() {
  try {
    const testReminderId = 'cme78mlrf0001472iy7ctrif7';
    
    console.log('👀 MONITORANDO LEMBRETE DE TESTE');
    console.log('=====================================');
    console.log('ID do lembrete:', testReminderId);
    console.log('Horário atual:', new Date().toISOString());
    console.log('');
    
    // Buscar o lembrete de teste
    const reminder = await prisma.reminder.findUnique({
      where: { id: testReminderId },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    
    if (!reminder) {
      console.log('❌ Lembrete não encontrado');
      return;
    }
    
    console.log('📋 STATUS DO LEMBRETE:');
    console.log('  Próximo disparo:', reminder.nextScheduledAt);
    console.log('  Ativo:', reminder.isActive);
    console.log('  Última enviada:', reminder.lastSentAt || 'Nunca');
    console.log('  Usuário:', reminder.user.name);
    console.log('  Mensagem:', reminder.message);
    
    // Verificar se já passou da hora de disparar
    const now = new Date();
    const scheduledTime = new Date(reminder.nextScheduledAt);
    const timeDiff = scheduledTime.getTime() - now.getTime();
    const minutesDiff = Math.round(timeDiff / (1000 * 60));
    
    if (timeDiff <= 0) {
      console.log('');
      if (reminder.lastSentAt) {
        const sentTime = new Date(reminder.lastSentAt);
        const minutesSinceSent = Math.round((now.getTime() - sentTime.getTime()) / (1000 * 60));
        console.log('✅ LEMBRETE JÁ FOI DISPARADO!');
        console.log('  Disparado há:', minutesSinceSent, 'minutos');
        console.log('  Status atual:', reminder.isActive ? 'Ainda ativo' : 'Desativado');
        
        // Para lembrete tipo 'scheduled', verificar se foi reprogramado
        if (reminder.type === 'scheduled' && reminder.isActive) {
          console.log('  🔄 Lembrete recorrente - próximo disparo programado');
        } else if (!reminder.isActive) {
          console.log('  🏁 Lembrete único - desativado após envio');
        }
      } else {
        console.log('🚨 LEMBRETE DEVERIA TER SIDO DISPARADO MAS NÃO FOI!');
        console.log('  Atraso:', Math.abs(minutesDiff), 'minutos');
        console.log('  Possível problema no scheduler');
      }
    } else {
      console.log('');
      console.log('⏳ AGUARDANDO DISPARO');
      console.log('  Faltam:', minutesDiff, 'minutos');
      console.log('  Disparo previsto para:', scheduledTime.toLocaleString('pt-BR'));
    }
    
    // Verificar stats do scheduler
    console.log('\n📊 STATS DO SCHEDULER (últimas verificações):');
    
    // Como não posso acessar diretamente o scheduler aqui, vou simular uma consulta
    // Em produção, isso seria feito via API endpoint
    const recentReminderUpdates = await prisma.reminder.findMany({
      where: {
        lastSentAt: {
          gte: new Date(Date.now() - 10 * 60 * 1000) // últimos 10 minutos
        }
      },
      select: {
        id: true,
        type: true,
        lastSentAt: true,
        isActive: true
      },
      orderBy: { lastSentAt: 'desc' },
      take: 10
    });
    
    console.log('  Lembretes enviados nos últimos 10 min:', recentReminderUpdates.length);
    if (recentReminderUpdates.length > 0) {
      console.log('  Último envio:', recentReminderUpdates[0].lastSentAt);
    }
    
    console.log('\n=====================================');
    
  } catch (error) {
    console.error('❌ Erro no monitoramento:', error);
  } finally {
    await prisma.$disconnect();
  }
}

monitorTestReminder();