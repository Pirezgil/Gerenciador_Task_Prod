const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testEnergyValidation() {
  const user = await prisma.user.findUnique({ where: { email: 'demo@gerenciador.com' } });
  if (!user) return console.log('User not found');
  
  // Buscar uma tarefa de 3 pontos não planejada
  const task3Points = await prisma.task.findFirst({
    where: {
      userId: user.id,
      energyPoints: 3,
      plannedForToday: false,
      isDeleted: false
    }
  });
  
  // Buscar uma tarefa de 1 ponto não planejada  
  const task1Point = await prisma.task.findFirst({
    where: {
      userId: user.id,
      energyPoints: 1,
      plannedForToday: false,
      isDeleted: false
    }
  });
  
  console.log('=== TESTE DE VALIDAÇÃO DE ENERGIA ===');
  console.log('Energia atual usada: 10/12 pontos');
  console.log('Disponível: 2 pontos\n');
  
  if (task3Points) {
    try {
      console.log('🧪 Teste 1: Tentar adicionar tarefa de 3 pontos (deve FALHAR)');
      await prisma.task.update({
        where: { id: task3Points.id },
        data: { plannedForToday: true }
      });
      console.log('❌ ERRO: Deveria ter falhado!');
    } catch (error) {
      console.log('✅ SUCESSO: Bloqueou corretamente -', error.message);
    }
  }
  
  if (task1Point) {
    try {
      console.log('\n🧪 Teste 2: Tentar adicionar tarefa de 1 ponto (deve PASSAR)');
      await prisma.task.update({
        where: { id: task1Point.id },
        data: { plannedForToday: true }
      });
      console.log('✅ SUCESSO: Permitiu tarefa de 1 ponto');
      
      // Reverter para próximo teste
      await prisma.task.update({
        where: { id: task1Point.id },
        data: { plannedForToday: false }
      });
      console.log('🔄 Revertido para manter 10 pontos');
      
    } catch (error) {
      console.log('❌ ERRO: Não deveria ter falhado -', error.message);
    }
  }
  
  // Verificar estado atual
  const currentPlanned = await prisma.task.findMany({
    where: {
      userId: user.id,
      plannedForToday: true,
      isDeleted: false
    },
    select: { description: true, energyPoints: true }
  });
  
  const totalEnergy = currentPlanned.reduce((sum, t) => sum + t.energyPoints, 0);
  console.log(`\n📊 Estado final: ${currentPlanned.length} tarefas, ${totalEnergy} pontos`);
  
  await prisma.$disconnect();
}

testEnergyValidation().catch(console.error);