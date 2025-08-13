const { PrismaClient } = require('@prisma/client');

async function createTestReminder() {
  const prisma = new PrismaClient({
    datasources: {
      db: {
        url: "postgresql://postgres:20262595@localhost:5432/banco_sentinela"
      }
    }
  });

  try {
    console.log('=== CRIANDO LEMBRETE DE TESTE ===');
    
    // 1. Buscar o usuário
    console.log('1. Buscando usuário demo@gerenciador.com...');
    const user = await prisma.user.findUnique({
      where: { email: 'demo@gerenciador.com' }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    console.log(`✅ Usuário encontrado: ${user.name} (ID: ${user.id})`);
    
    // 2. Verificar se a tarefa existe
    console.log('\n2. Verificando tarefa cme2olk2f00018j7k7chw8owz...');
    const task = await prisma.task.findFirst({
      where: { 
        id: 'cme2olk2f00018j7k7chw8owz',
        userId: user.id
      }
    });
    
    if (task) {
      console.log(`✅ Tarefa encontrada: "${task.description}"`);
    } else {
      console.log('⚠️ Tarefa não encontrada, criando lembrete genérico');
    }
    
    // 3. Criar data e hora para hoje 11:24
    const today = new Date();
    const reminderTime = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 24, 0);
    
    console.log(`\n3. Criando lembrete para: ${reminderTime.toLocaleString('pt-BR')}`);
    
    // 4. Criar o lembrete
    const reminder = await prisma.reminder.create({
      data: {
        userId: user.id,
        entityId: task ? task.id : null,
        entityType: task ? 'task' : 'custom',
        type: 'custom',
        scheduledFor: reminderTime,
        message: task 
          ? `Lembrete da tarefa: ${task.description}`
          : 'Lembrete de teste criado via script',
        notificationTypes: ['push'],
        isActive: true,
        priority: 'normal',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Lembrete criado com sucesso!');
    console.log(`📝 ID: ${reminder.id}`);
    console.log(`⏰ Agendado para: ${reminder.scheduledFor.toLocaleString('pt-BR')}`);
    console.log(`💬 Mensagem: ${reminder.message}`);
    console.log(`🔔 Tipos: ${reminder.notificationTypes.join(', ')}`);
    
    // 5. Verificar se o lembrete será processado em breve
    const now = new Date();
    const timeDiff = reminderTime.getTime() - now.getTime();
    const minutesUntil = Math.floor(timeDiff / (1000 * 60));
    
    if (minutesUntil > 0) {
      console.log(`\n⏳ Lembrete será processado em ${minutesUntil} minuto(s)`);
      console.log('🔄 O Reminder Scheduler executa a cada minuto');
    } else if (minutesUntil === 0) {
      console.log('\n🔥 Lembrete será processado na próxima execução do scheduler (até 1 minuto)');
    } else {
      console.log('\n⚠️ Lembrete agendado para o passado, será processado imediatamente');
    }
    
    console.log('\n👀 Monitore o console do backend para ver o lembrete sendo processado!');
    
  } catch (error) {
    console.error('❌ Erro ao criar lembrete:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestReminder();