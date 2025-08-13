const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTask() {
  try {
    // 1. Buscar a tarefa específica
    const task = await prisma.task.findUnique({
      where: { id: 'cme2olk2f00018j7k7chw8owz' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        appointment: true,
        project: { select: { name: true } }
      }
    });
    
    if (task) {
      console.log('✅ TAREFA ENCONTRADA:');
      console.log('ID:', task.id);
      console.log('Descrição:', task.description);
      console.log('Tipo:', task.type);
      console.log('É Agendamento:', task.isAppointment);
      console.log('Data de Vencimento:', task.dueDate);
      console.log('Data Planejada:', task.plannedDate);
      console.log('Status:', task.status);
      console.log('Usuário:', task.user?.name, '(' + task.user?.email + ')');
      console.log('Projeto:', task.project?.name || 'Sem projeto');
      
      if (task.appointment) {
        console.log('\n📅 DADOS DO AGENDAMENTO:');
        console.log('Horário Agendado:', task.appointment.scheduledTime);
        console.log('Tempo de Preparação:', task.appointment.preparationTime, 'min');
        console.log('Local:', task.appointment.location || 'Não informado');
        console.log('Tempo de Lembrete:', task.appointment.reminderTime, 'min antes');
        console.log('Notas:', task.appointment.notes || 'Nenhuma');
      }
      
      // 2. Buscar lembretes relacionados a esta tarefa
      const reminders = await prisma.reminder.findMany({
        where: {
          entityId: 'cme2olk2f00018j7k7chw8owz',
          entityType: 'TASK'
        }
      });
      
      console.log('\n🔔 LEMBRETES RELACIONADOS:', reminders.length);
      if (reminders.length > 0) {
        reminders.forEach((reminder, index) => {
          console.log('  Lembrete ' + (index + 1) + ':');
          console.log('    ID: ' + reminder.id);
          console.log('    Tipo: ' + reminder.type);
          console.log('    Subtipo: ' + (reminder.subType || 'N/A'));
          console.log('    Horário Agendado: ' + (reminder.scheduledTime || 'N/A'));
          console.log('    Minutos Antes: ' + (reminder.minutesBefore || 'N/A'));
          console.log('    Próximo Agendamento: ' + reminder.nextScheduledAt);
          console.log('    Ativo: ' + reminder.isActive);
          console.log('    Última Enviada: ' + (reminder.lastSentAt || 'Nunca'));
          console.log('    Tipos de Notificação: ' + reminder.notificationTypes.join(', '));
          console.log('    Mensagem: ' + (reminder.message || 'Padrão'));
        });
      } else {
        console.log('  Nenhum lembrete encontrado para esta tarefa');
      }
      
    } else {
      console.log('❌ TAREFA NÃO ENCONTRADA no banco de dados');
    }
  } catch (error) {
    console.error('Erro ao buscar tarefa:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTask();