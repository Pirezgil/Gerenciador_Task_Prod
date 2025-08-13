const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTodayReminder() {
  try {
    console.log('📝 CRIANDO LEMBRETE PARA HOJE ÀS 12:08');
    console.log('====================================');
    
    const taskId = 'cme2olk2f00018j7k7chw8owz';
    const userId = 'cme1wvcwt0000qpvbb8b6yqj6'; // Gilmar Pires
    
    // Definir horário para hoje às 12:08
    const reminderTime = new Date();
    reminderTime.setHours(12, 8, 0, 0); // 12:08:00
    
    // Se já passou das 12:08 hoje, agendar para amanhã
    const now = new Date();
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
      console.log('⚠️ Já passou das 12:08 hoje, agendando para amanhã');
    } else {
      console.log('✅ Agendando para hoje às 12:08');
    }
    
    console.log('🕒 Horário atual:', now.toISOString());
    console.log('⏰ Horário do lembrete:', reminderTime.toISOString());
    
    const minutesUntil = Math.round((reminderTime.getTime() - now.getTime()) / (1000 * 60));
    console.log('⏳ Faltam', minutesUntil, 'minutos para disparar');
    
    // Verificar se a tarefa existe
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { id: true, description: true, userId: true }
    });
    
    if (!task) {
      console.log('❌ Tarefa não encontrada');
      return;
    }
    
    console.log('✅ Tarefa encontrada:', task.description);
    
    // Dados do lembrete
    const reminderData = {
      userId: userId,
      entityId: taskId,
      entityType: 'task',
      type: 'scheduled',
      scheduledTime: '12:08', // HH:MM format
      daysOfWeek: [], // Para lembrete único/diário
      notificationTypes: ['push'],
      message: '🎯 TESTE - Lembrete criado via script para 12:08!',
      isActive: true,
      nextScheduledAt: reminderTime,
      // Campos opcionais para lembretes únicos
      minutesBefore: null,
      intervalEnabled: false,
      parentReminderId: null,
      subType: 'test'
    };
    
    console.log('');
    console.log('📋 DADOS DO LEMBRETE:');
    console.log('   Usuário:', userId);
    console.log('   Tarefa:', taskId);
    console.log('   Tipo:', reminderData.type);
    console.log('   Horário:', reminderData.scheduledTime);
    console.log('   Próximo disparo:', reminderData.nextScheduledAt);
    console.log('   Mensagem:', reminderData.message);
    console.log('   Notificação:', reminderData.notificationTypes.join(', '));
    
    // Criar o lembrete
    const reminder = await prisma.reminder.create({
      data: reminderData
    });
    
    console.log('');
    console.log('✅ LEMBRETE CRIADO COM SUCESSO!');
    console.log('   ID:', reminder.id);
    console.log('   Criado em:', reminder.createdAt);
    console.log('   Ativo:', reminder.isActive);
    
    // Verificar se aparece nos próximos lembretes do scheduler
    const upcomingReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        nextScheduledAt: {
          gte: now,
          lte: new Date(now.getTime() + 30 * 60 * 1000) // próximos 30 minutos
        }
      },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { nextScheduledAt: 'asc' }
    });
    
    console.log('');
    console.log('📅 LEMBRETES PRÓXIMOS (30 min):', upcomingReminders.length);
    upcomingReminders.forEach((reminder, index) => {
      const minutesUntil = Math.round((new Date(reminder.nextScheduledAt).getTime() - now.getTime()) / (1000 * 60));
      console.log('  ' + (index + 1) + '. ' + reminder.type + ' - ' + reminder.user.name + ' - Em ' + minutesUntil + ' min');
      console.log('     ID: ' + reminder.id);
      console.log('     Hora: ' + new Date(reminder.nextScheduledAt).toLocaleTimeString('pt-BR'));
    });
    
    console.log('');
    console.log('🎯 PRÓXIMOS PASSOS:');
    console.log('1. O scheduler executará automaticamente a cada minuto');
    console.log('2. Quando chegar às 12:08, o lembrete será disparado');
    console.log('3. Uma notificação push será enviada (se configurada)');
    console.log('4. O lembrete será marcado como enviado');
    console.log('5. Para lembrete "scheduled", será reagendado para o próximo dia');
    
    console.log('');
    console.log('🔍 MONITORAMENTO:');
    console.log('   - Status do scheduler: curl -H "Authorization: Bearer TOKEN" http://localhost:3001/api/scheduler/status');
    console.log('   - Executar manualmente: curl -X POST -H "Authorization: Bearer TOKEN" http://localhost:3001/api/scheduler/run');
    
    console.log('');
    console.log('====================================');
    
  } catch (error) {
    console.error('❌ Erro ao criar lembrete:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTodayReminder();