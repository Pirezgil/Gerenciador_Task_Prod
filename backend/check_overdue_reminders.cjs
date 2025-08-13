const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkOverdueReminders() {
  try {
    const now = new Date();
    console.log('🕐 VERIFICANDO LEMBRETES EM ATRASO');
    console.log('Horário atual:', now.toISOString());
    console.log('');
    
    // Buscar lembretes que deveriam ter sido disparados
    const overdueReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        nextScheduledAt: {
          lte: now
        }
      },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { nextScheduledAt: 'asc' }
    });
    
    console.log('🚨 LEMBRETES EM ATRASO:', overdueReminders.length);
    
    if (overdueReminders.length > 0) {
      overdueReminders.forEach((reminder, index) => {
        const scheduledTime = new Date(reminder.nextScheduledAt);
        const minutesOverdue = Math.round((now.getTime() - scheduledTime.getTime()) / (1000 * 60));
        
        console.log('  ' + (index + 1) + '. ID: ' + reminder.id);
        console.log('     Tipo: ' + reminder.type + (reminder.subType ? ' (' + reminder.subType + ')' : ''));
        console.log('     Entidade: ' + (reminder.entityType || 'N/A') + ' - ' + (reminder.entityId || 'N/A'));
        console.log('     Usuário: ' + reminder.user.name);
        console.log('     Era para disparar em: ' + scheduledTime.toISOString());
        console.log('     Atraso: ' + minutesOverdue + ' minutos');
        console.log('     Última enviada: ' + (reminder.lastSentAt || 'Nunca'));
        console.log('     Mensagem: ' + (reminder.message || 'Padrão'));
        console.log('');
      });
      
      console.log('💡 DIAGNÓSTICO: Existem lembretes em atraso que não foram disparados!');
      console.log('   Isso confirma que não há um mecanismo ativo (scheduler) executando.');
      
    } else {
      console.log('   Nenhum lembrete em atraso encontrado');
    }
    
    // Próximos lembretes a disparar
    console.log('\n📅 PRÓXIMOS 10 LEMBRETES AGENDADOS:');
    const upcomingReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        nextScheduledAt: {
          gt: now
        }
      },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { nextScheduledAt: 'asc' },
      take: 10
    });
    
    upcomingReminders.forEach((reminder, index) => {
      const scheduledTime = new Date(reminder.nextScheduledAt);
      const minutesUntil = Math.round((scheduledTime.getTime() - now.getTime()) / (1000 * 60));
      
      console.log('  ' + (index + 1) + '. ' + reminder.type + ' - Faltam ' + minutesUntil + ' min');
      console.log('     Agendado para: ' + scheduledTime.toISOString());
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkOverdueReminders();