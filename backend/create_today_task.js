
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function createTodayTask() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@gerenciador.com' }
    });
    
    if (\!user) {
      console.log('❌ Usuário não encontrado');
      return;
    }
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const newTask = await prisma.task.create({
      data: {
        description: 'Tarefa para testar botão ADIAR - teste de repaginação',
        status: 'pending',
        energyPoints: 3,
        type: 'task',
        plannedForToday: true,
        plannedDate: today,
        userId: user.id
      }
    });
    
    console.log('✅ Tarefa para hoje criada:', newTask.id);
    
  } catch(error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.\();
  }
}

createTodayTask();

