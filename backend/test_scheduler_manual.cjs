const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testSchedulerManually() {
  try {
    console.log('🔧 TESTE MANUAL DO SCHEDULER DE LEMBRETES');
    console.log('==========================================');
    
    const now = new Date();
    console.log('Horário atual:', now.toISOString());
    
    // 1. Verificar lembretes vencidos
    const overdueReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        nextScheduledAt: {
          lte: now
        }
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
            settings: {
              select: { notifications: true }
            }
          }
        }
      },
      orderBy: { nextScheduledAt: 'asc' }
    });
    
    console.log('\n📊 LEMBRETES VENCIDOS ENCONTRADOS:', overdueReminders.length);
    
    if (overdueReminders.length === 0) {
      console.log('✅ Nenhum lembrete vencido no momento');
      return;
    }
    
    // 2. Mostrar detalhes dos lembretes vencidos
    overdueReminders.forEach((reminder, index) => {
      const overdueMins = Math.round((now.getTime() - new Date(reminder.nextScheduledAt).getTime()) / (1000 * 60));
      
      console.log(`\n${index + 1}. Lembrete ID: ${reminder.id}`);
      console.log(`   Tipo: ${reminder.type} (${reminder.subType || 'N/A'})`);
      console.log(`   Usuário: ${reminder.user.name} (${reminder.user.email})`);
      console.log(`   Notificações habilitadas: ${reminder.user.settings?.notifications !== false ? 'Sim' : 'Não'}`);
      console.log(`   Era para disparar: ${reminder.nextScheduledAt}`);
      console.log(`   Atraso: ${overdueMins} minutos`);
      console.log(`   Última enviada: ${reminder.lastSentAt || 'Nunca'}`);
      console.log(`   Entidade: ${reminder.entityType} (${reminder.entityId || 'N/A'})`);
    });
    
    // 3. Testar o endpoint do scheduler (simulação)
    console.log('\n🎯 SIMULANDO PROCESSAMENTO DO SCHEDULER...');
    console.log('(Esta é uma simulação - o scheduler real seria executado pelo cron)');
    
    for (const reminder of overdueReminders.slice(0, 3)) { // Processar apenas os 3 primeiros para teste
      try {
        console.log(`\n🔄 Processando lembrete ${reminder.id}...`);
        
        // Simular o que o scheduler faria:
        // 1. Buscar dados da entidade
        let entityData = null;
        if (reminder.entityType === 'TASK' || reminder.entityType === 'task') {
          entityData = await prisma.task.findUnique({
            where: { id: reminder.entityId },
            select: { id: true, description: true, status: true, type: true }
          });
        } else if (reminder.entityType === 'HABIT' || reminder.entityType === 'habit') {
          entityData = await prisma.habit.findUnique({
            where: { id: reminder.entityId },
            select: { id: true, name: true, description: true }
          });
        }
        
        if (!entityData) {
          console.log(`   ❌ Entidade não encontrada: ${reminder.entityType} ${reminder.entityId}`);
          continue;
        }
        
        console.log(`   ✅ Entidade encontrada: ${entityData.description || entityData.name}`);
        console.log(`   📱 Tipos de notificação: ${reminder.notificationTypes.join(', ')}`);
        console.log(`   💬 Mensagem: ${reminder.message || 'Mensagem padrão'}`);
        
        // 2. Simular envio da notificação
        console.log(`   📨 Simulando envio de notificação push...`);
        
        // 3. Atualizar lembrete (simulação)
        console.log(`   🔄 Simulando atualização do lembrete...`);
        
        // Para lembretes recorrentes, calcular próximo agendamento
        if (reminder.type === 'recurring') {
          // Simular cálculo do próximo agendamento
          console.log(`   🔁 Lembrete recorrente - próximo agendamento seria calculado`);
        } else {
          console.log(`   🔚 Lembrete único - seria desativado após envio`);
        }
        
        console.log(`   ✅ Lembrete processado com sucesso`);
        
      } catch (error) {
        console.error(`   ❌ Erro ao processar lembrete ${reminder.id}:`, error.message);
      }
    }
    
    // 4. Próximos lembretes
    console.log('\n📅 PRÓXIMOS LEMBRETES AGENDADOS:');
    const upcomingReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        nextScheduledAt: {
          gt: now
        }
      },
      include: {
        user: { select: { name: true } }
      },
      orderBy: { nextScheduledAt: 'asc' },
      take: 5
    });
    
    if (upcomingReminders.length === 0) {
      console.log('Nenhum lembrete futuro agendado');
    } else {
      upcomingReminders.forEach((reminder, index) => {
        const minutesUntil = Math.round((new Date(reminder.nextScheduledAt).getTime() - now.getTime()) / (1000 * 60));
        console.log(`${index + 1}. ${reminder.type} - ${reminder.user.name} - Em ${minutesUntil} min (${reminder.nextScheduledAt})`);
      });
    }
    
    console.log('\n✅ TESTE CONCLUÍDO');
    console.log('==========================================');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSchedulerManually();