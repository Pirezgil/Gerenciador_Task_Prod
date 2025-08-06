const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkTasks() {
  const user = await prisma.user.findUnique({ where: { email: 'demo@gerenciador.com' } });
  if (!user) return console.log('User not found');
  
  const tasks = await prisma.task.findMany({
    where: { userId: user.id, isDeleted: false },
    select: { id: true, description: true, status: true, plannedForToday: true, dueDate: true }
  });
  
  const planned = tasks.filter(t => t.plannedForToday === true);
  const today = new Date().toISOString().split('T')[0];
  const dueToday = tasks.filter(t => t.dueDate && t.dueDate.toISOString().split('T')[0] === today);
  
  console.log('=== ANÁLISE DAS TAREFAS ===');
  console.log('Total de tarefas:', tasks.length);
  console.log('Planejadas para hoje (plannedForToday=true):', planned.length);
  console.log('Com vencimento hoje:', dueToday.length);
  console.log('Status das planejadas:');
  planned.forEach(t => console.log(`  - ${t.description.substring(0, 50)} (${t.status})`));
  
  console.log('\nTarefas que deveriam aparecer no bombeiro:');
  const shouldAppear = tasks.filter(task => {
    if (task.plannedForToday === true) {
      return task.status === 'pending' || task.status === 'postponed';
    }
    if (task.dueDate && task.dueDate.toISOString().split('T')[0] === today) {
      return task.status === 'pending' || task.status === 'postponed';
    }
    if (!task.dueDate) {
      return task.status === 'pending';
    }
    return false;
  });
  
  console.log('Tarefas que deveriam aparecer:', shouldAppear.length);
  shouldAppear.forEach(t => console.log(`  - ${t.description.substring(0, 50)} (${t.status}) [planned: ${t.plannedForToday}] [due: ${t.dueDate ? t.dueDate.toISOString().split('T')[0] : 'null'}]`));
  
  await prisma.$disconnect();
}

checkTasks().catch(console.error);