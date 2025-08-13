const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function updateReminderTime() {
  try {
    console.log('⏰ ATUALIZANDO LEMBRETE PARA DISPARO IMEDIATO');
    console.log('============================================');
    
    // Pegar o lembrete mais recente da tarefa alvo
    const reminder = await prisma.reminder.findFirst({
      where: {
        entityId: 'cme2olk2f00018j7k7chw8owz',
        entityType: 'task',
        isActive: true
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (!reminder) {
      console.log('❌ Nenhum lembrete ativo encontrado');
      return;
    }
    
    console.log('✅ Lembrete encontrado:', reminder.id);
    console.log('   Próximo disparo atual:', reminder.nextScheduledAt);
    
    // Definir para 1 minuto no futuro
    const newTime = new Date();
    newTime.setMinutes(newTime.getMinutes() + 1);
    
    console.log('   Novo horário:', newTime.toISOString());
    console.log('   Em', Math.round((newTime.getTime() - Date.now()) / (1000 * 60)), 'minutos');
    
    // Resetar status para garantir que será processado
    const updatedReminder = await prisma.reminder.update({
      where: { id: reminder.id },
      data: {
        nextScheduledAt: newTime,
        lastSentAt: null, // Resetar para garantir que não foi "enviado"
        isActive: true
      }
    });
    
    console.log('');
    console.log('✅ LEMBRETE ATUALIZADO!');
    console.log('   ID:', updatedReminder.id);
    console.log('   Novo disparo:', updatedReminder.nextScheduledAt);
    console.log('   Ativo:', updatedReminder.isActive);
    console.log('   LastSentAt resetado:', updatedReminder.lastSentAt || 'null');
    
    // Verificar push subscriptions
    const subscriptions = await prisma.pushSubscription.count({
      where: { 
        userId: reminder.userId,
        isActive: true 
      }
    });
    
    console.log('');
    console.log('📱 VERIFICAÇÕES:');
    console.log('   Push subscriptions ativas:', subscriptions);
    console.log('   Usuário ID:', reminder.userId);
    console.log('   Mensagem:', reminder.message);
    
    if (subscriptions === 0) {
      console.log('   ⚠️ SEM PUSH SUBSCRIPTIONS - notificação será in-app');
    } else {
      console.log('   ✅ COM PUSH SUBSCRIPTIONS - tentará envio real');
    }
    
    console.log('');
    console.log('⏳ AGUARDAR PROCESSAMENTO:');
    console.log('   O scheduler executará automaticamente em ~1 minuto');
    console.log('   Monitorar com: node check_reminder.cjs');
    
    console.log('');
    console.log('============================================');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateReminderTime();