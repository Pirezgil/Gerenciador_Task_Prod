const { PrismaClient } = require('@prisma/client');

async function testReminderPersistence() {
  const prisma = new PrismaClient();
  
  try {
    console.log('🔍 ETAPA 2 - Verificando Persistência de Lembretes no Banco de Dados');
    console.log('================================================================\n');

    // 1. Buscar o usuário de teste
    console.log('1️⃣ Buscando usuário de teste...');
    const testUser = await prisma.user.findFirst({
      where: { email: 'demo@gerenciador.com' }
    });

    if (!testUser) {
      console.log('❌ Usuário de teste não encontrado');
      return;
    }

    console.log(`✅ Usuário encontrado: ${testUser.name} (${testUser.email})`);
    console.log(`   ID: ${testUser.id}\n`);

    // 2. Buscar uma tarefa do usuário para testar
    console.log('2️⃣ Buscando tarefa do usuário para teste...');
    const testTask = await prisma.task.findFirst({
      where: { 
        userId: testUser.id,
        status: { not: 'completed' }
      }
    });

    if (!testTask) {
      console.log('❌ Nenhuma tarefa encontrada para o usuário de teste');
      return;
    }

    console.log(`✅ Tarefa encontrada para teste: "${testTask.description}"`);
    console.log(`   ID: ${testTask.id}`);
    console.log(`   Tipo: ${testTask.type}`);
    console.log(`   É recorrente: ${testTask.isRecurring ? 'Sim' : 'Não'}`);
    console.log(`   É compromisso: ${testTask.isAppointment ? 'Sim' : 'Não'}\n`);

    // 3. Verificar lembretes existentes
    console.log('3️⃣ Verificando lembretes existentes para esta tarefa...');
    const existingReminders = await prisma.reminder.findMany({
      where: {
        userId: testUser.id,
        entityId: testTask.id,
        entityType: 'task'
      },
      orderBy: { createdAt: 'desc' }
    });

    console.log(`📊 Lembretes existentes: ${existingReminders.length}`);
    
    if (existingReminders.length > 0) {
      existingReminders.forEach((reminder, index) => {
        console.log(`   ${index + 1}. ID: ${reminder.id}`);
        console.log(`      Tipo: ${reminder.type}`);
        console.log(`      Horário: ${reminder.scheduledTime || 'N/A'}`);
        console.log(`      Minutos antes: ${reminder.minutesBefore || 'N/A'}`);
        console.log(`      Tipos de notificação: ${JSON.stringify(reminder.notificationTypes)}`);
        console.log(`      Ativo: ${reminder.isActive ? 'Sim' : 'Não'}`);
        console.log(`      Último envio: ${reminder.lastSentAt || 'Nunca'}`);
        console.log(`      Próximo agendamento: ${reminder.nextScheduledAt || 'N/A'}`);
        console.log(`      Criado em: ${reminder.createdAt}`);
        console.log('');
      });
    } else {
      console.log('   Nenhum lembrete encontrado para esta tarefa\n');
    }

    // 4. Testar criação de um novo lembrete via simulação da API
    console.log('4️⃣ Testando criação de lembrete via simulação...');
    
    const testReminderData = {
      userId: testUser.id,
      entityId: testTask.id,
      entityType: 'task',
      type: 'single',
      scheduledTime: '14:30',
      minutesBefore: 30,
      notificationTypes: ['push'],
      message: 'Lembrete de teste - ETAPA 2',
      isActive: true,
      subType: 'main'
    };

    console.log('📝 Dados do lembrete a ser criado:');
    console.log(JSON.stringify(testReminderData, null, 2));

    // Criar o lembrete
    const createdReminder = await prisma.reminder.create({
      data: testReminderData
    });

    console.log('\n✅ Lembrete criado com sucesso!');
    console.log(`   ID: ${createdReminder.id}`);
    console.log(`   Criado em: ${createdReminder.createdAt}`);

    // 5. Verificar se o lembrete foi salvo corretamente
    console.log('\n5️⃣ Verificando se o lembrete foi persistido...');
    
    const savedReminder = await prisma.reminder.findUnique({
      where: { id: createdReminder.id }
    });

    if (savedReminder) {
      console.log('✅ Lembrete encontrado no banco de dados!');
      console.log('📋 Dados salvos:');
      console.log(`   ID: ${savedReminder.id}`);
      console.log(`   Usuário: ${savedReminder.userId}`);
      console.log(`   Tarefa: ${savedReminder.entityId}`);
      console.log(`   Tipo entidade: ${savedReminder.entityType}`);
      console.log(`   Tipo: ${savedReminder.type}`);
      console.log(`   Horário: ${savedReminder.scheduledTime}`);
      console.log(`   Minutos antes: ${savedReminder.minutesBefore}`);
      console.log(`   Tipos notificação: ${JSON.stringify(savedReminder.notificationTypes)}`);
      console.log(`   Mensagem: ${savedReminder.message}`);
      console.log(`   Ativo: ${savedReminder.isActive}`);
      console.log(`   Subtipo: ${savedReminder.subType}`);
    } else {
      console.log('❌ Lembrete NÃO encontrado no banco de dados!');
    }

    // 6. Estatísticas finais
    console.log('\n6️⃣ Estatísticas finais do usuário...');
    
    const finalStats = await prisma.reminder.groupBy({
      by: ['type', 'isActive'],
      where: { userId: testUser.id },
      _count: true
    });

    console.log('📊 Lembretes por tipo e status:');
    finalStats.forEach(stat => {
      console.log(`   ${stat.type} (${stat.isActive ? 'ativo' : 'inativo'}): ${stat._count} lembrete(s)`);
    });

    // Contar total de lembretes do usuário
    const totalReminders = await prisma.reminder.count({
      where: { userId: testUser.id }
    });

    console.log(`\n📈 Total de lembretes do usuário: ${totalReminders}`);

    console.log('\n================================================================');
    console.log('✅ ETAPA 2 CONCLUÍDA - Persistência de lembretes verificada!');
    console.log('================================================================');

    // Limpar o lembrete de teste
    await prisma.reminder.delete({
      where: { id: createdReminder.id }
    });
    console.log('\n🧹 Lembrete de teste removido');

  } catch (error) {
    console.error('❌ Erro durante teste de persistência:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

testReminderPersistence();