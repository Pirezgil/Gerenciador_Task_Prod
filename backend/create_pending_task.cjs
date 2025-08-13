const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createPendingTask() {
  try {
    console.log('🎯 Criando tijolo pendente para testar contadores...');
    
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
    
    // Criar uma tarefa pendente
    const pendingTask = await prisma.task.create({
      data: {
        description: 'Estudar gramática - PENDENTE',
        status: 'pending',
        energyPoints: 3,
        type: 'task',
        projectId: project.id,
        userId: 'cme1wvcwt0000qpvbb8b6yqj6',
        plannedForToday: false
      }
    });
    
    console.log('✅ Tijolo pendente criado:', pendingTask.description);
    
    // Buscar todos os tijolos do projeto para verificar
    const allTasks = await prisma.task.findMany({
      where: {
        projectId: project.id
      }
    });
    
    console.log('\n📊 RESUMO DO PROJETO ATUALIZADO:');
    console.log('===============================');
    console.log(`📂 Projeto: ${project.name}`);
    console.log(`🧱 Total de tijolos: ${allTasks.length}`);
    
    const pending = allTasks.filter(t => t.status?.toLowerCase() === 'pending').length;
    const completed = allTasks.filter(t => t.status?.toLowerCase() === 'completed').length;
    const postponed = allTasks.filter(t => t.status?.toLowerCase() === 'postponed').length;
    
    console.log(`🔵 ${pending} pendentes`);
    console.log(`🟢 ${completed} concluídos`);
    console.log(`🟡 ${postponed} adiados`);
    
    console.log('\n📋 LISTA COMPLETA DE TIJOLOS:');
    allTasks.forEach((task, index) => {
      console.log(`${index + 1}. "${task.description}"`);
      console.log(`   Status: ${task.status} (lowercase: ${task.status?.toLowerCase()})`);
      console.log('');
    });
    
    console.log('🔧 TESTE DA LÓGICA CORRIGIDA:');
    console.log('=============================');
    console.log('Aplicando: projectTasks.filter(t => t.status?.toLowerCase() === "pending").length');
    console.log(`Resultado: ${pending} pendentes`);
    console.log('');
    console.log('Aplicando: projectTasks.filter(t => t.status?.toLowerCase() === "completed").length');
    console.log(`Resultado: ${completed} concluídos`);
    
    if (pending > 0) {
      console.log('\n✅ AGORA o contador deve mostrar corretamente:');
      console.log(`"${pending} pendentes" e "${completed} concluídos"`);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

createPendingTask();