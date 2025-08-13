const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function revertTaskToPending() {
  try {
    console.log('🔄 Revertendo tarefa para status PENDING...');
    console.log('==========================================');
    
    const taskId = 'cmea9ud4a000110fx347tpi92';
    
    // Atualizar a tarefa para pending
    const updatedTask = await prisma.task.update({
      where: {
        id: taskId
      },
      data: {
        status: 'pending',
        postponedAt: null, // Remover a data de adiamento
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Tarefa atualizada com sucesso!');
    console.log(`Status anterior: POSTPONED`);
    console.log(`Status atual: ${updatedTask.status}`);
    
    // Verificar o projeto agora
    const project = await prisma.project.findUnique({
      where: {
        id: updatedTask.projectId
      },
      include: {
        tasks: true
      }
    });
    
    console.log('\n📊 CONTADORES ATUALIZADOS:');
    console.log('==========================');
    console.log(`📂 Projeto: ${project.name}`);
    console.log(`🧱 Total de tijolos: ${project.tasks.length}`);
    
    const pending = project.tasks.filter(t => t.status?.toLowerCase() === 'pending').length;
    const completed = project.tasks.filter(t => t.status?.toLowerCase() === 'completed').length;
    const postponed = project.tasks.filter(t => t.status?.toLowerCase() === 'postponed').length;
    
    console.log(`🔵 ${pending} pendentes`);
    console.log(`🟢 ${completed} concluídos`);
    console.log(`🟡 ${postponed} adiados`);
    
    console.log('\n📋 LISTA ATUALIZADA DE TIJOLOS:');
    project.tasks.forEach((task, index) => {
      console.log(`${index + 1}. "${task.description}"`);
      console.log(`   Status: ${task.status}`);
      console.log('');
    });
    
    if (pending > 0) {
      console.log('🎉 SUCESSO! Agora o contador deve mostrar:');
      console.log(`"${pending} pendentes" na página /arquiteto`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

revertTaskToPending();