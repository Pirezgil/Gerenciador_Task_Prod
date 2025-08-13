const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkSpecificTaskStatus() {
  try {
    console.log('🔍 Verificando tarefa específica: cmea9ud4a000110fx347tpi92');
    console.log('========================================================');
    
    // Buscar a tarefa específica
    const task = await prisma.task.findUnique({
      where: {
        id: 'cmea9ud4a000110fx347tpi92'
      },
      include: {
        project: {
          select: {
            name: true,
            id: true
          }
        },
        history: {
          orderBy: {
            timestamp: 'desc'
          }
        }
      }
    });
    
    if (!task) {
      console.log('❌ Tarefa não encontrada');
      return;
    }
    
    console.log('📋 INFORMAÇÕES DA TAREFA:');
    console.log('========================');
    console.log(`Descrição: "${task.description}"`);
    console.log(`Status Atual: "${task.status}"`);
    console.log(`Status (lowercase): "${task.status?.toLowerCase()}"`);
    console.log(`Projeto: ${task.project?.name || 'SEM PROJETO'} (${task.projectId})`);
    console.log(`Criada em: ${task.createdAt}`);
    console.log(`Atualizada em: ${task.updatedAt}`);
    
    if (task.postponedAt) {
      console.log(`Adiada em: ${task.postponedAt}`);
    }
    
    console.log('\n📚 HISTÓRICO DA TAREFA:');
    console.log('======================');
    task.history.forEach((entry, index) => {
      console.log(`${index + 1}. ${entry.action.toUpperCase()}`);
      console.log(`   Timestamp: ${entry.timestamp}`);
      if (entry.details) {
        console.log(`   Detalhes: ${JSON.stringify(entry.details, null, 2)}`);
      }
      console.log('');
    });
    
    console.log('🧪 TESTE DOS CONTADORES:');
    console.log('========================');
    
    // Simular como seria interpretada pelos contadores
    const isPending = task.status?.toLowerCase() === 'pending';
    const isCompleted = task.status?.toLowerCase() === 'completed';
    const isPostponed = task.status?.toLowerCase() === 'postponed';
    
    console.log(`É PENDING? ${isPending ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`É COMPLETED? ${isCompleted ? '✅ SIM' : '❌ NÃO'}`);
    console.log(`É POSTPONED? ${isPostponed ? '✅ SIM' : '❌ NÃO'}`);
    
    console.log('\n💡 ANÁLISE:');
    console.log('===========');
    if (task.status === 'POSTPONED') {
      console.log('⚠️  A tarefa tem status "POSTPONED" (maiúsculo)');
      console.log('   Aplicando .toLowerCase() = "postponed"');
      console.log('   Resultado: NÃO será contada como "pending"');
      console.log('   Isso está CORRETO - tarefas adiadas não são pendentes');
    } else if (task.status === 'pending') {
      console.log('✅ A tarefa tem status "pending" - deveria ser contada');
    } else {
      console.log(`⚠️  Status inesperado: "${task.status}"`);
    }
    
    // Verificar se você quer que ela seja pending
    console.log('\n🔧 AÇÃO SUGERIDA:');
    console.log('=================');
    if (task.status === 'POSTPONED') {
      console.log('Se esta tarefa deveria estar PENDENTE:');
      console.log('1. Alterar status de "POSTPONED" para "pending"');
      console.log('2. Remover postponedAt');
      console.log('3. Atualizar updatedAt');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkSpecificTaskStatus();