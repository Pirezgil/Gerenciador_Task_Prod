const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugProjectIds() {
  try {
    console.log('🔍 DEBUG: Verificando IDs dos projetos');
    console.log('====================================');
    
    const userId = 'cme1wvcwt0000qpvbb8b6yqj6';
    
    // Buscar todos os projetos do usuário
    const allProjects = await prisma.project.findMany({
      where: { userId }
    });
    
    console.log('📂 TODOS OS PROJETOS DO USUÁRIO:');
    allProjects.forEach((project, index) => {
      console.log(`${index + 1}. Nome: "${project.name}"`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Status: ${project.status}`);
      console.log('');
    });
    
    // Buscar todas as tasks do usuário
    const allTasks = await prisma.task.findMany({
      where: { userId },
      include: {
        project: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log('📋 TODAS AS TASKS DO USUÁRIO:');
    allTasks.forEach((task, index) => {
      console.log(`${index + 1}. Descrição: "${task.description}"`);
      console.log(`   Status: ${task.status}`);
      console.log(`   Project ID: ${task.projectId}`);
      console.log(`   Project Name: ${task.project?.name || 'SEM PROJETO'}`);
      console.log('');
    });
    
    // Verificar tasks por projeto
    console.log('🔗 TASKS POR PROJETO:');
    for (const project of allProjects) {
      const projectTasks = allTasks.filter(task => task.projectId === project.id);
      console.log(`📂 ${project.name} (${project.id}): ${projectTasks.length} tasks`);
      
      projectTasks.forEach((task, index) => {
        console.log(`   ${index + 1}. "${task.description}" - ${task.status}`);
      });
      
      if (projectTasks.length === 0) {
        console.log('   (nenhuma task)');
      }
      console.log('');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugProjectIds();