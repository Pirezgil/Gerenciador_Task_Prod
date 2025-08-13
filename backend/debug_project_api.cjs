const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugProjectAPI() {
  try {
    console.log('🔍 DEBUG: Verificando dados do projeto via API logic');
    console.log('================================================');
    
    const userId = 'cme1wvcwt0000qpvbb8b6yqj6';
    
    // Simular exatamente o que a API faz
    const projects = await prisma.project.findMany({
      where: { userId },
      include: {
        tasks: {
          select: {
            id: true,
            description: true,
            status: true,
            energyPoints: true,
            type: true,
            dueDate: true,
            createdAt: true,
            updatedAt: true,
            completedAt: true,
            postponedAt: true,
            comments: true,
            attachments: true,
            externalLinks: true,
            history: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    
    console.log('📂 Projetos encontrados:', projects.length);
    
    projects.forEach((project, index) => {
      console.log(`\n${index + 1}. PROJETO: ${project.name}`);
      console.log(`   ID: ${project.id}`);
      console.log(`   Tasks: ${project.tasks.length}`);
      
      if (project.tasks.length > 0) {
        console.log('   📋 TIJOLOS:');
        project.tasks.forEach((task, taskIndex) => {
          console.log(`      ${taskIndex + 1}. "${task.description}"`);
          console.log(`         Status: ${task.status}`);
          console.log(`         Energia: ${task.energyPoints}`);
          console.log(`         ID: ${task.id}`);
          console.log('');
        });
        
        // Simular lógica dos contadores
        const pending = project.tasks.filter(t => t.status?.toLowerCase() === 'pending').length;
        const completed = project.tasks.filter(t => t.status?.toLowerCase() === 'completed').length;
        const postponed = project.tasks.filter(t => t.status?.toLowerCase() === 'postponed').length;
        
        console.log('   📊 CONTADORES:');
        console.log(`      🔵 ${pending} pendentes`);
        console.log(`      🟢 ${completed} concluídos`);
        console.log(`      🟡 ${postponed} adiados`);
      }
    });
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

debugProjectAPI();