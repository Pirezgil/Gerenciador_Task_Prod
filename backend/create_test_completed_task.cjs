const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestCompletedTask() {
  try {
    console.log('🎯 Criando tijolo concluído para teste...');
    
    // Buscar o projeto
    const project = await prisma.project.findFirst({
      where: {
        name: 'Aprender Inglês'
      }
    });
    
    if (!project) {
      console.log('❌ Projeto não encontrado');
      return;
    }
    
    // Criar uma tarefa concluída
    const completedTask = await prisma.task.create({
      data: {
        description: 'Revisão de vocabulário - CONCLUÍDO',
        status: 'completed',
        energyPoints: 1,
        type: 'task',
        projectId: project.id,
        userId: 'cme1wvcwt0000qpvbb8b6yqj6',
        plannedForToday: false,
        completedAt: new Date()
      }
    });
    
    console.log('✅ Tijolo concluído criado:', completedTask.description);
    
    // Buscar todos os tijolos do projeto para verificar
    const allTasks = await prisma.task.findMany({
      where: {
        projectId: project.id
      }
    });
    
    console.log('\n📊 RESUMO DO PROJETO:');
    console.log('====================');
    console.log(`📂 Projeto: ${project.name}`);
    console.log(`🧱 Total de tijolos: ${allTasks.length}`);
    
    const pending = allTasks.filter(t => t.status?.toLowerCase() === 'pending').length;
    const completed = allTasks.filter(t => t.status?.toLowerCase() === 'completed').length;
    const postponed = allTasks.filter(t => t.status?.toLowerCase() === 'postponed').length;
    
    console.log(`🔵 ${pending} pendentes`);
    console.log(`🟢 ${completed} concluídos`);
    console.log(`🟡 ${postponed} adiados`);
    
    console.log('\n📋 LISTA DE TIJOLOS:');
    allTasks.forEach((task, index) => {
      console.log(`${index + 1}. "${task.description}" - Status: ${task.status}`);
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createTestCompletedTask();