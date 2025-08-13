const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function debugOverdueReminders() {
  try {
    console.log('🔍 DEBUG: Analisando lembretes em atraso detalhadamente');
    
    const now = new Date();
    const overdueReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        nextScheduledAt: {
          lte: now
        }
      },
      orderBy: { nextScheduledAt: 'asc' }
    });
    
    console.log('\n📊 LEMBRETES EM ATRASO:', overdueReminders.length);
    
    overdueReminders.forEach((reminder, index) => {
      console.log(`\n${index + 1}. Lembrete ID: ${reminder.id}`);
      console.log(`   Tipo: ${reminder.type}`);
      console.log(`   Subtipo: ${reminder.subType || 'N/A'}`);
      console.log(`   Era para disparar: ${reminder.nextScheduledAt}`);
      console.log(`   Última enviada: ${reminder.lastSentAt || 'Nunca'}`);
      console.log(`   Ativo: ${reminder.isActive}`);
      console.log(`   Dias da semana: [${reminder.daysOfWeek.join(', ')}]`);
      console.log(`   Horário agendado: ${reminder.scheduledTime || 'N/A'}`);
      console.log(`   Minutos antes: ${reminder.minutesBefore || 'N/A'}`);
      
      // Análise do problema
      if (reminder.type === 'before_due') {
        console.log(`   🔍 ANÁLISE: Este é um lembrete 'before_due' (antes do vencimento)`);
        console.log(`   📝 PROBLEMA: markReminderAsSent não trata este tipo - deveria desativar após envio`);
      }
      
      if (reminder.lastSentAt && reminder.isActive) {
        const minutesSinceSent = Math.round((now.getTime() - new Date(reminder.lastSentAt).getTime()) / (1000 * 60));
        console.log(`   ⚠️ INCONSISTÊNCIA: Enviado há ${minutesSinceSent} min mas ainda ativo`);
      }
    });
    
    console.log('\n💡 DIAGNÓSTICO:');
    console.log('   - O scheduler está funcionando (105 lembretes processados)');
    console.log('   - O problema está na função markReminderAsSent()');
    console.log('   - Lembretes "before_due" não são desativados após envio');
    console.log('   - Isso faz com que apareçam como vencidos eternamente');
    
    console.log('\n🔧 SOLUÇÃO NECESSÁRIA:');
    console.log('   - Modificar markReminderAsSent para desativar lembretes "before_due" após envio');
    console.log('   - Ou definir nextScheduledAt para null para estes tipos');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugOverdueReminders();