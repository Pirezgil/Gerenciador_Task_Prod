const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugAllTasks() {
  try {
    console.log('🔍 DEBUG: Verificando TODAS as tarefas do projeto');
    console.log('=================================================');
    
    const projectId = 'cmea9l95n000osjy6r0pk8jvk';
    
    // Buscar todas as tarefas do projeto (incluindo deletadas)
    const allTasks = await prisma.task.findMany({
      where: {
        projectId: projectId
      }
    });
    
    console.log(`📂 Projeto ID: ${projectId}`);
    console.log(`🧱 Total de tarefas encontradas: ${allTasks.length}`);
    console.log('');
    
    console.log('📋 LISTA COMPLETA:');
    console.log('==================');
    allTasks.forEach((task, index) => {
      console.log(`${index + 1}. ID: ${task.id}`);
      console.log(`   Descrição: "${task.description}"`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Deletada: ${task.isDeleted || false}`);
      console.log(`   PlannedForToday: ${task.plannedForToday || false}`);
      console.log(`   Criada: ${task.createdAt}`);
      console.log(`   Atualizada: ${task.updatedAt}`);
      if (task.postponedAt) {
        console.log(`   Adiada: ${task.postponedAt}`);
      }
      if (task.completedAt) {
        console.log(`   Concluída: ${task.completedAt}`);
      }
      console.log('');
    });
    
    // Testar a nova lógica em cada tarefa
    console.log('🧪 TESTE DA NOVA LÓGICA:');
    console.log('========================');
    
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
    
    let pendingCount = 0;
    let completedCount = 0;
    
    allTasks.forEach((task, index) => {
      const isPending = isTaskPending(task);
      const isCompleted = task.status?.toLowerCase() === 'completed';
      
      console.log(`${index + 1}. "${task.description}"`);
      console.log(`   Status: ${task.status}`);
      console.log(`   É PENDENTE pela nova lógica? ${isPending ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   É CONCLUÍDA? ${isCompleted ? '✅ SIM' : '❌ NÃO'}`);
      
      if (isPending) pendingCount++;
      if (isCompleted) completedCount++;
      
      console.log('');
    });
    
    console.log('📊 CONTADORES FINAIS:');
    console.log('=====================');
    console.log(`🔵 ${pendingCount} pendentes`);
    console.log(`🟢 ${completedCount} concluídos`);
    
    if (pendingCount > 0) {
      console.log('\n✅ RESULTADO: O contador deve mostrar:');
      console.log(`"${pendingCount} pendentes" na página /arquiteto`);
    } else {
      console.log('\n⚠️  RESULTADO: Contador ainda mostrará "0 pendentes"');
      console.log('   Isso significa que todas as tarefas estão concluídas ou foram adiadas hoje');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugAllTasks();