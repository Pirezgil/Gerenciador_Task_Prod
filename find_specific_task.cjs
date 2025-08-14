const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findTaskById() {
  try {
    const task = await prisma.task.findUnique({
      where: {
        id: 'cmeaejbar000lml01ikld71pm'
      },
      select: {
        id: true,
        description: true,
        status: true,
        dueDate: true,
        plannedForToday: true,
        energyPoints: true,
        isAppointment: true,
        completedAt: true,
        user: {
          select: {
            name: true
          }
        },
        project: {
          select: {
            name: true
          }
        }
      }
    });
    
    if (task) {
      console.log('📋 TAREFA ENCONTRADA:');
      console.log('====================');
      console.log('ID:', task.id);
      console.log('Descrição:', task.description);
      console.log('Status:', task.status);
      console.log('Data vencimento:', task.dueDate ? new Date(task.dueDate).toLocaleDateString('pt-BR') : 'SEM DATA');
      console.log('Planejada para hoje:', task.plannedForToday);
      console.log('Energia:', task.energyPoints);
      console.log('É compromisso:', task.isAppointment);
      console.log('Completada em:', task.completedAt ? new Date(task.completedAt).toLocaleDateString('pt-BR') : 'NÃO COMPLETADA');
      console.log('Usuário:', task.user.name);
      console.log('Projeto:', task.project?.name || 'SEM PROJETO');
      
      // Verificar se está atrasada
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const isOverdue = task.status !== 'completed' && task.dueDate && 
        new Date(task.dueDate).getTime() < today.getTime();
      
      console.log('');
      console.log('🔍 ANÁLISE DE ATRASO:');
      console.log('Data de hoje:', today.toLocaleDateString('pt-BR'));
      console.log('Está atrasada?', isOverdue ? 'SIM ❌' : 'NÃO ✅');
      
      if (isOverdue) {
        const daysDiff = Math.floor((today - new Date(task.dueDate)) / (1000 * 60 * 60 * 24));
        console.log('Dias de atraso:', daysDiff);
      } else if (task.dueDate) {
        const dueDate = new Date(task.dueDate);
        if (dueDate.getTime() > today.getTime()) {
          const daysDiff = Math.floor((dueDate - today) / (1000 * 60 * 60 * 24));
          console.log('Dias até vencimento:', daysDiff);
        }
      }
      
      console.log('');
      console.log('🎯 ONDE DEVE APARECER NA PÁGINA DE PLANEJAMENTO:');
      if (task.plannedForToday) {
        if (task.status === 'completed') {
          console.log('- Seção: 🎉 Tarefas Completadas (se completada hoje)');
        } else {
          console.log('- Seção: ✅ Tarefas Planejadas para Hoje');
        }
      } else if (isOverdue) {
        console.log('- Seção: 🚨 Tarefas Atrasadas');
      } else {
        console.log('- Seção: 📋 Atividades Disponíveis');
      }
      
    } else {
      console.log('❌ Tarefa não encontrada');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findTaskById();