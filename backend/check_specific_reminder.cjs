const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkSpecificReminder() {
  try {
    console.log('🔍 INVESTIGANDO LEMBRETE ESPECÍFICO DA TAREFA:');
    
    // Buscar lembrete específico da tarefa
    const reminder = await prisma.reminder.findUnique({
      where: { id: 'cme77wrbz0003r4giy9yryzvn' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    
    if (reminder) {
      console.log('\n✅ LEMBRETE ENCONTRADO:');
      console.log('ID:', reminder.id);
      console.log('Usuário:', reminder.user.name, '(' + reminder.user.email + ')');
      console.log('Entidade ID:', reminder.entityId);
      console.log('Tipo de Entidade:', reminder.entityType);
      console.log('Tipo de Lembrete:', reminder.type);
      console.log('Subtipo:', reminder.subType || 'N/A');
      console.log('Horário Agendado:', reminder.scheduledTime || 'N/A');
      console.log('Minutos Antes:', reminder.minutesBefore || 'N/A');
      console.log('Próximo Agendamento:', reminder.nextScheduledAt);
      console.log('Dias da Semana:', reminder.daysOfWeek);
      console.log('Tipos de Notificação:', reminder.notificationTypes.join(', '));
      console.log('Ativo:', reminder.isActive);
      console.log('Última Enviada:', reminder.lastSentAt || 'Nunca');
      console.log('Mensagem:', reminder.message || 'Padrão');
      console.log('Criado em:', reminder.createdAt);
      console.log('Atualizado em:', reminder.updatedAt);
      
      // Configurações de intervalo
      if (reminder.intervalEnabled) {
        console.log('\n⏰ CONFIGURAÇÕES DE INTERVALO:');
        console.log('Intervalo Habilitado:', reminder.intervalEnabled);
        console.log('Hora Início:', reminder.intervalStartTime);
        console.log('Hora Fim:', reminder.intervalEndTime);
        console.log('Minutos do Intervalo:', reminder.intervalMinutes);
        console.log('Parent Reminder ID:', reminder.parentReminderId || 'N/A');
      }
      
      // Verificar se é hora de disparar
      const now = new Date();
      const nextScheduled = new Date(reminder.nextScheduledAt);
      const timeUntilNext = nextScheduled.getTime() - now.getTime();
      const minutesUntilNext = Math.round(timeUntilNext / (1000 * 60));
      
      console.log('\n⏱️ ANÁLISE TEMPORAL:');
      console.log('Horário Atual:', now.toISOString());
      console.log('Próximo Agendamento:', nextScheduled.toISOString());
      console.log('Diferença (minutos):', minutesUntilNext);
      
      if (minutesUntilNext <= 0) {
        console.log('🚨 ESTE LEMBRETE DEVERIA TER SIDO DISPARADO!');
      } else {
        console.log('⏳ Faltam', minutesUntilNext, 'minutos para disparar');
      }
      
    } else {
      console.log('❌ LEMBRETE NÃO ENCONTRADO');
    }
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificReminder();