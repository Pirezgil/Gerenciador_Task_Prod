const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getTaskForTest() {
  const user = await prisma.user.findUnique({ where: { email: 'demo@gerenciador.com' } });
  const task = await prisma.task.findFirst({
    where: {
      userId: user.id,
      energyPoints: 3,
      plannedForToday: false,
      isDeleted: false
    }
  });
  
  if (task) {
    console.log('ID da tarefa de 3 pontos:', task.id);
    console.log('Descrição:', task.description.substring(0, 50));
  } else {
    console.log('Nenhuma tarefa de 3 pontos encontrada');
  }
  
  await prisma.$disconnect();
}

getTaskForTest().catch(console.error);