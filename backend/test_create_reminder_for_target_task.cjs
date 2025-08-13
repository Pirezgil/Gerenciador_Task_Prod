const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestReminderForTargetTask() {
  try {
    console.log('🧪 TESTE: Criando lembrete para tarefa alvo');
    console.log('==========================================');
    
    const targetTaskId = 'cme2olk2f00018j7k7chw8owz';
    const userId = 'cme1wvcwt0000qpvbb8b6yqj6'; // Gilmar Pires
    
    // 1. Verificar tarefa
    const task = await prisma.task.findUnique({
      where: { id: targetTaskId },
      select: { id: true, description: true, userId: true, status: true }
    });
    
    if (!task) {
      console.log('❌ Tarefa não encontrada');
      return;
    }
    
    console.log('✅ Tarefa encontrada:', task.description);
    
    // 2. Criar lembrete de teste (5 minutos no futuro)
    const reminderTime = new Date();
    reminderTime.setMinutes(reminderTime.getMinutes() + 5);
    
    const reminderData = {
      userId: userId,
      entityId: targetTaskId,
      entityType: 'task',
      type: 'scheduled',
      scheduledTime: reminderTime.toTimeString().slice(0, 5), // HH:MM
      daysOfWeek: [], // Para lembretes únicos
      notificationTypes: ['push'],
      message: 'TESTE - Lembrete da tarefa específica do plano',
      isActive: true,
      nextScheduledAt: reminderTime
    };
    
    console.log('📝 Criando lembrete com dados:', {
      tarefa: task.description,
      horario: reminderData.scheduledTime,
      proximoDisparo: reminderData.nextScheduledAt.toISOString()
    });
    
    const reminder = await prisma.reminder.create({
      data: reminderData
    });
    
    console.log('✅ Lembrete criado com ID:', reminder.id);
    
    // 3. Verificar se aparece nos próximos lembretes
    const upcomingReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        nextScheduledAt: {
          gte: new Date(),
          lte: new Date(Date.now() + 10 * 60 * 1000) // próximos 10 minutos
        }
      },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { nextScheduledAt: 'asc' }
    });
    
    console.log('\n📅 LEMBRETES NOS PRÓXIMOS 10 MINUTOS:', upcomingReminders.length);
    upcomingReminders.forEach((reminder, index) => {
      const minutesUntil = Math.round((new Date(reminder.nextScheduledAt).getTime() - Date.now()) / (1000 * 60));
      console.log(`${index + 1}. ${reminder.type} - ${reminder.user.name} - Em ${minutesUntil} min`);
      console.log(`   ID: ${reminder.id}`);
      console.log(`   Mensagem: ${reminder.message || 'Padrão'}`);
    });
    
    console.log('\n⏰ INSTRUÇÕES PARA TESTE:');
    console.log('1. Aguarde 5 minutos');
    console.log('2. O scheduler executará automaticamente a cada minuto');
    console.log('3. O lembrete deveria ser disparado como notificação push');
    console.log('4. Após envio, verifique que foi marcado como enviado e desativado/reprogramado');
    
    console.log('\n✅ TESTE CONFIGURADO COM SUCESSO');
    console.log('==========================================');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReminderForTargetTask();