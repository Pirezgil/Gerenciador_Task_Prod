const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testNewPendingLogic() {
  try {
    console.log('🧪 TESTE: Nova Lógica de Contadores Inteligente');
    console.log('==============================================');
    
    // Buscar o projeto e suas tarefas
    const project = await prisma.project.findFirst({
      where: {
        name: 'Aprender Inglês'
      },
      include: {
        tasks: true
      }
    });
    
    if (!project) {
      console.log('❌ Projeto não encontrado');
      return;
    }
    
    console.log(`📂 Projeto: ${project.name}`);
    console.log(`🧱 Total de tijolos: ${project.tasks.length}`);
    console.log('');
    
    // Implementar a nova lógica inteligente
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
    
    console.log('📋 ANÁLISE DETALHADA DE CADA TIJOLO:');
    console.log('=====================================');
    
    project.tasks.forEach((task, index) => {
      const status = task.status?.toLowerCase();
      const isPending = isTaskPending(task);
      const isCompleted = status === 'completed';
      
      console.log(`${index + 1}. "${task.description}"`);
      console.log(`   Status: ${task.status}`);
      console.log(`   PlannedForToday: ${task.plannedForToday || false}`);
      
      if (task.postponedAt) {
        const postponedDate = new Date(task.postponedAt);
        const today = new Date();
        const wasPostponedToday = postponedDate.toDateString() === today.toDateString();
        console.log(`   PostponedAt: ${postponedDate.toLocaleString('pt-BR')}`);
        console.log(`   Adiada hoje? ${wasPostponedToday ? 'SIM' : 'NÃO'}`);
      }
      
      console.log(`   É PENDENTE? ${isPending ? '✅ SIM' : '❌ NÃO'}`);
      console.log(`   É CONCLUÍDA? ${isCompleted ? '✅ SIM' : '❌ NÃO'}`);
      console.log('');
    });
    
    // Calcular contadores
    const pendingCount = project.tasks.filter(isTaskPending).length;
    const completedCount = project.tasks.filter(t => t.status?.toLowerCase() === 'completed').length;
    
    console.log('📊 RESULTADO DOS CONTADORES:');
    console.log('============================');
    console.log(`🔵 ${pendingCount} pendentes`);
    console.log(`🟢 ${completedCount} concluídos`);
    
    console.log('\n💡 EXPLICAÇÃO DA LÓGICA:');
    console.log('========================');
    console.log('Uma tarefa é considerada PENDENTE se:');
    console.log('1. Status = "pending" OU');
    console.log('2. PlannedForToday = true OU'); 
    console.log('3. Status = "postponed" MAS não foi adiada hoje');
    console.log('');
    console.log('Uma tarefa NÃO é pendente se:');
    console.log('- Status = "completed" OU');
    console.log('- Foi adiada hoje (postponedAt = hoje)');
    
    // Verificar se a nova lógica captura a tarefa POSTPONED como pendente
    const postponedTasks = project.tasks.filter(t => t.status?.toLowerCase() === 'postponed');
    if (postponedTasks.length > 0) {
      console.log('\n🔍 ANÁLISE DE TAREFAS ADIADAS:');
      console.log('==============================');
      postponedTasks.forEach(task => {
        const wasPostponedToday = task.postponedAt && 
          new Date(task.postponedAt).toDateString() === new Date().toDateString();
        const shouldBePending = !wasPostponedToday;
        
        console.log(`Tarefa: "${task.description}"`);
        console.log(`Adiada em: ${task.postponedAt}`);
        console.log(`Foi adiada hoje? ${wasPostponedToday ? 'SIM' : 'NÃO'}`);
        console.log(`Deve ser contada como pendente? ${shouldBePending ? 'SIM ✅' : 'NÃO ❌'}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testNewPendingLogic();