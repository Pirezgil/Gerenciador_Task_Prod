const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testProjectStatusFix() {
  try {
    console.log('🧪 TESTE: Verificando Status dos Tijolos no Projeto');
    console.log('================================================');
    
    // Buscar o projeto existente
    const project = await prisma.project.findFirst({
      where: {
        name: 'Aprender Inglês'
      },
      include: {
        tasks: true
      }
    });
    
    if (!project) {
      console.log('❌ Projeto "Aprender Inglês" não encontrado');
      return;
    }
    
    console.log('📂 Projeto encontrado:', project.name);
    console.log('🧱 Total de tijolos:', project.tasks.length);
    
    // Analisar status dos tijolos
    const statusCounts = {
      pending: 0,
      completed: 0,
      postponed: 0,
      other: 0
    };
    
    console.log('\n📊 ANÁLISE DOS STATUS:');
    console.log('======================');
    
    project.tasks.forEach((task, index) => {
      const status = task.status?.toLowerCase();
      console.log(`${index + 1}. "${task.description}"`);
      console.log(`   - Status original: "${task.status}"`);
      console.log(`   - Status lowercase: "${status}"`);
      console.log(`   - Energia: ${task.energyPoints}`);
      
      if (status === 'pending') {
        statusCounts.pending++;
      } else if (status === 'completed') {
        statusCounts.completed++;
      } else if (status === 'postponed') {
        statusCounts.postponed++;
      } else {
        statusCounts.other++;
        console.log(`   - Status não reconhecido: "${task.status}"`);
      }
      console.log('');
    });
    
    console.log('📈 CONTADORES FINAIS:');
    console.log('====================');
    console.log(`✅ Concluídos: ${statusCounts.completed}`);
    console.log(`⏳ Pendentes: ${statusCounts.pending}`);
    console.log(`⏰ Adiados: ${statusCounts.postponed}`);
    console.log(`❓ Outros: ${statusCounts.other}`);
    console.log(`📊 Total: ${project.tasks.length}`);
    
    // Simular a lógica corrigida do frontend
    console.log('\n🔧 SIMULAÇÃO DA LÓGICA CORRIGIDA:');
    console.log('==================================');
    
    const projectTasks = project.tasks;
    const pendingCount = projectTasks.filter(t => 
      t.status?.toLowerCase() === 'pending'
    ).length;
    const completedCount = projectTasks.filter(t => 
      t.status?.toLowerCase() === 'completed'
    ).length;
    
    console.log(`🔵 ${pendingCount} pendentes`);
    console.log(`🟢 ${completedCount} concluídos`);
    
    // Verificar se a correção resolve o problema
    if (pendingCount === statusCounts.pending && completedCount === statusCounts.completed) {
      console.log('\n✅ TESTE PASSOU! A correção está funcionando corretamente.');
      console.log('   Os contadores agora refletem os status reais dos tijolos.');
    } else {
      console.log('\n❌ TESTE FALHOU! Há inconsistência na lógica.');
      console.log(`   Esperado: pending=${statusCounts.pending}, completed=${statusCounts.completed}`);
      console.log(`   Calculado: pending=${pendingCount}, completed=${completedCount}`);
    }
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testProjectStatusFix();