const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testPostponedYesterday() {
  try {
    console.log('🧪 TESTE: Simulando tarefa adiada ontem');
    console.log('======================================');
    
    const taskId = 'cmea9ud4a000110fx347tpi92';
    
    // Calcular ontem
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    console.log(`📅 Hoje: ${new Date().toLocaleDateString('pt-BR')}`);
    console.log(`📅 Ontem: ${yesterday.toLocaleDateString('pt-BR')}`);
    
    // Atualizar a tarefa para ter sido adiada ontem
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        postponedAt: yesterday
      }
    });
    
    console.log('\n✅ Tarefa atualizada para ter sido adiada ONTEM');
    console.log(`PostponedAt alterado para: ${yesterday.toLocaleString('pt-BR')}`);
    
    // Testar a nova lógica
    const isTaskPending = (task) => {
      const status = task.status?.toLowerCase();
      
      // Se está completada, não é pendente
      if (status === 'completed') return false;
      
      // Se é pending, é pendente
      if (status === 'pending') return true;
      
      // Se está planejada para hoje, é pendente
      if (task.plannedForToday === true) return true;
      
      // Se foi adiada (postponed), só é pendente se NÃO foi adiada hoje
      if (status === 'postponed') {
        const wasPostponedToday = task.postponedAt && 
          new Date(task.postponedAt).toDateString() === new Date().toDateString();
        return !wasPostponedToday;
      }
      
      return false;
    };
    
    const isPending = isTaskPending(updatedTask);
    const today = new Date().toDateString();
    const postponedToday = new Date(updatedTask.postponedAt).toDateString() === today;
    
    console.log('\n🧪 TESTE DA LÓGICA:');
    console.log('==================');
    console.log(`Tarefa: "${updatedTask.description}"`);
    console.log(`Status: ${updatedTask.status}`);
    console.log(`PostponedAt: ${new Date(updatedTask.postponedAt).toLocaleString('pt-BR')}`);
    console.log(`Foi adiada hoje? ${postponedToday ? 'SIM' : 'NÃO'}`);
    console.log(`É PENDENTE pela nova lógica? ${isPending ? '✅ SIM' : '❌ NÃO'}`);
    
    if (isPending) {
      console.log('\n🎉 SUCESSO! Agora a tarefa seria contada como pendente!');
      console.log('   O contador mostraria "1 pendente" na página /arquiteto');
    } else {
      console.log('\n⚠️  A tarefa ainda não seria considerada pendente');
    }
    
    // Restaurar para hoje (desfazer o teste)
    const today_date = new Date();
    await prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        postponedAt: new Date('2025-08-13T18:52:04.011Z') // Valor original
      }
    });
    
    console.log('\n🔄 Tarefa restaurada ao estado original');
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testPostponedYesterday();