const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function getTask1Point() {
  const user = await prisma.user.findUnique({ where: { email: 'demo@gerenciador.com' } });
  const task = await prisma.task.findFirst({
    where: {
      userId: user.id,
      energyPoints: 1,
      plannedForToday: false,
      isDeleted: false
    }
  });
  
  console.log('ID tarefa 1 ponto:', task ? task.id : 'Não encontrada');
  if (task) console.log('Descrição:', task.description.substring(0, 50));
  
  await prisma.$disconnect();
}

getTask1Point().catch(console.error);