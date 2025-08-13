const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fixTaskProjectId() {
  try {
    console.log('🔧 Corrigindo project ID da task completed...');
    
    const correctProjectId = 'cmea9l95n000osjy6r0pk8jvk';
    const taskDescription = 'Revisão de vocabulário - CONCLUÍDO';
    
    // Buscar a task que precisa ser corrigida
    const task = await prisma.task.findFirst({
      where: {
        description: taskDescription
      }
    });
    
    if (!task) {
      console.log('❌ Task não encontrada');
      return;
    }
    
    console.log(`📋 Task encontrada: "${task.description}"`);
    console.log(`   Project ID atual: ${task.projectId}`);
    console.log(`   Project ID correto: ${correctProjectId}`);
    
    // Atualizar o project ID
    const updatedTask = await prisma.task.update({
      where: {
        id: task.id
      },
      data: {
        projectId: correctProjectId
      }
    });
    
    console.log('✅ Task atualizada com sucesso!');
    
    // Verificar o resultado
    const project = await prisma.project.findUnique({
      where: {
        id: correctProjectId
      },
      include: {
        tasks: true
      }
    });
    
    console.log('\n📊 RESULTADO FINAL:');
    console.log('==================');
    console.log(`📂 Projeto: ${project.name}`);
    console.log(`🧱 Total de tijolos: ${project.tasks.length}`);
    
    project.tasks.forEach((task, index) => {
      console.log(`${index + 1}. "${task.description}" - Status: ${task.status}`);
    });
    
    const pending = project.tasks.filter(t => t.status?.toLowerCase() === 'pending').length;
    const completed = project.tasks.filter(t => t.status?.toLowerCase() === 'completed').length;
    const postponed = project.tasks.filter(t => t.status?.toLowerCase() === 'postponed').length;
    
    console.log('\n📈 CONTADORES:');
    console.log(`🔵 ${pending} pendentes`);
    console.log(`🟢 ${completed} concluídos`);
    console.log(`🟡 ${postponed} adiados`);
    
    // Remover projeto órfão se existir
    try {
      const orphanProject = await prisma.project.findUnique({
        where: { id: 'cmdxf4si10003139ocszyk2fm' },
        include: { tasks: true }
      });
      
      if (orphanProject && orphanProject.tasks.length === 0) {
        await prisma.project.delete({
          where: { id: 'cmdxf4si10003139ocszyk2fm' }
        });
        console.log('\n🗑️  Projeto órfão removido');
      }
    } catch (e) {
      console.log('\n⚠️  Projeto órfão não encontrado ou não pôde ser removido');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixTaskProjectId();