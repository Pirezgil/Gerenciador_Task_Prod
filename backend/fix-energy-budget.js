const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixEnergyBudget() {
  const user = await prisma.user.findUnique({ where: { email: 'demo@gerenciador.com' } });
  if (!user) return console.log('User not found');
  
  // Resetar todas as tarefas para plannedForToday = false
  await prisma.task.updateMany({
    where: { userId: user.id },
    data: { plannedForToday: false }
  });
  
  // Buscar tarefas pendentes ordenadas por energia (crescente)
  const tasks = await prisma.task.findMany({
    where: { 
      userId: user.id, 
      isDeleted: false,
      status: { in: ['pending', 'postponed'] }
    },
    orderBy: { energyPoints: 'asc' }
  });
  
  // Selecionar tarefas até atingir 10 pontos de energia
  let totalEnergy = 0;
  const selectedTasks = [];
  
  for (const task of tasks) {
    if (totalEnergy + task.energyPoints <= 10) {
      totalEnergy += task.energyPoints;
      selectedTasks.push(task.id);
      
      if (totalEnergy === 10) break; // Parar exatamente em 10
    }
  }
  
  // Marcar tarefas selecionadas como plannedForToday = true
  if (selectedTasks.length > 0) {
    await prisma.task.updateMany({
      where: { id: { in: selectedTasks } },
      data: { plannedForToday: true }
    });
  }
  
  console.log(`✅ ${selectedTasks.length} tarefas marcadas para hoje`);
  console.log(`⚡ Total de energia: ${totalEnergy}/12 pontos`);
  
  // Mostrar tarefas selecionadas
  const finalTasks = await prisma.task.findMany({
    where: { id: { in: selectedTasks } },
    select: { description: true, energyPoints: true, status: true }
  });
  
  finalTasks.forEach(t => 
    console.log(`  - ${t.description.substring(0, 50)} (${t.energyPoints} pts) [${t.status}]`)
  );
  
  await prisma.$disconnect();
}

fixEnergyBudget().catch(console.error);