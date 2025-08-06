const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const demoUser = {
  email: 'demo@gerenciador.com',
  password: 'demo1234'
};

async function main() {
  console.log('🔍 Procurando usuário demo...');
  
  // Buscar usuário demo
  const user = await prisma.user.findUnique({
    where: { email: demoUser.email }
  });

  if (!user) {
    console.log('❌ Usuário demo não encontrado no banco de dados!');
    console.log('Por favor, faça login no sistema primeiro para criar o usuário.');
    return;
  } else {
    console.log('✅ Usuário demo encontrado:', user.id);
    userId = user.id;
  }

  // Excluir todas as tarefas existentes do usuário demo
  console.log('🗑️ Excluindo tarefas existentes...');
  await prisma.taskHistory.deleteMany({
    where: { task: { userId } }
  });
  await prisma.taskComment.deleteMany({
    where: { task: { userId } }
  });
  await prisma.taskAttachment.deleteMany({
    where: { task: { userId } }
  });
  await prisma.taskRecurrence.deleteMany({
    where: { task: { userId } }
  });
  await prisma.taskAppointment.deleteMany({
    where: { task: { userId } }
  });
  await prisma.task.deleteMany({
    where: { userId }
  });

  // Buscar ou criar projetos
  console.log('📁 Criando projetos de teste...');
  const projects = await Promise.all([
    prisma.project.upsert({
      where: { id: 'test-frontend' },
      create: {
        id: 'test-frontend',
        userId,
        name: 'Testes Frontend',
        icon: '🎨',
        color: '#3B82F6',
        status: 'active'
      },
      update: {}
    }),
    prisma.project.upsert({
      where: { id: 'test-backend' },
      create: {
        id: 'test-backend',
        userId,
        name: 'Testes Backend',
        icon: '⚙️',
        color: '#10B981',
        status: 'active'
      },
      update: {}
    }),
    prisma.project.upsert({
      where: { id: 'test-calendar' },
      create: {
        id: 'test-calendar',
        userId,
        name: 'Testes Calendário',
        icon: '📅',
        color: '#F59E0B',
        status: 'active'
      },
      update: {}
    })
  ]);

  console.log('📝 Criando 100 tarefas de teste...');

  const tasks = [];
  const statuses = ['pending', 'completed', 'postponed'];
  const energyPoints = [1, 3, 5];
  const types = ['task', 'brick'];

  // Gerar datas para testes - últimos 30 dias e próximos 30 dias
  const generateDate = (daysOffset) => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD
  };

  const taskTemplates = [
    // Tarefas de teste de data - variadas
    { desc: 'Tarefa vencendo hoje', dueOffset: 0 },
    { desc: 'Tarefa venceu ontem', dueOffset: -1 },
    { desc: 'Tarefa vence amanhã', dueOffset: 1 },
    { desc: 'Tarefa vence em 3 dias', dueOffset: 3 },
    { desc: 'Tarefa venceu há 5 dias', dueOffset: -5 },
    { desc: 'Tarefa vence na próxima semana', dueOffset: 7 },
    { desc: 'Tarefa venceu semana passada', dueOffset: -7 },
    { desc: 'Tarefa vence no fim do mês', dueOffset: 30 },
    { desc: 'Tarefa venceu no início do mês', dueOffset: -30 },
    
    // Tarefas sem data
    { desc: 'Tarefa sem vencimento' },
    { desc: 'Backlog item sem data' },
    
    // Tarefas de componentes específicos
    { desc: 'Testar modal de nova tarefa' },
    { desc: 'Testar edição de tarefa' },
    { desc: 'Testar exclusão de tarefa' },
    { desc: 'Testar comentários em tarefas' },
    { desc: 'Testar anexos em tarefas' },
    { desc: 'Testar histórico de tarefas' },
    { desc: 'Testar postponement de tarefas' },
    { desc: 'Testar completar tarefa' },
    { desc: 'Testar filtros de status' },
    { desc: 'Testar busca de tarefas' },
    { desc: 'Testar paginação' },
    { desc: 'Testar ordenação' },
    
    // Tarefas de energia
    { desc: 'Tarefa energia baixa (1 ponto)', energy: 1 },
    { desc: 'Tarefa energia média (3 pontos)', energy: 3 },
    { desc: 'Tarefa energia alta (5 pontos)', energy: 5 },
    
    // Tarefas recorrentes
    { desc: 'Tarefa recorrente diária', recurring: 'daily' },
    { desc: 'Tarefa recorrente semanal', recurring: 'weekly' },
    { desc: 'Exercício matinal', recurring: 'daily' },
    { desc: 'Reunião semanal', recurring: 'weekly' },
    
    // Tarefas tipo brick
    { desc: 'Brick para decomposição', type: 'brick' },
    { desc: 'Tarefa complexa (brick)', type: 'brick' },
    
    // Tarefas de projeto
    { desc: 'Desenvolver componente X', project: 0 },
    { desc: 'Testar API endpoint Y', project: 1 },
    { desc: 'Verificar calendário Z', project: 2 },
    
    // Tarefas com links externos
    { desc: 'Tarefa com documentação', links: ['https://docs.example.com'] },
    { desc: 'Tarefa com GitHub issue', links: ['https://github.com/user/repo/issues/1'] },
    
    // Tarefas longas para testar truncamento
    { desc: 'Esta é uma tarefa com descrição muito longa para testar como o sistema lida com textos extensos e truncamento' },
    { desc: 'Outra tarefa longa: Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt' },
    
    // Tarefas especiais
    { desc: 'Tarefa com emoji 🚀' },
    { desc: 'Tarefa com caracteres especiais: áçêntõs' },
    { desc: 'Task in English' },
    { desc: 'Tarea en español' },
    { desc: '中文任务' },
    
    // Tarefas de status específico
    { desc: 'Tarefa completada hoje', status: 'completed', completedToday: true },
    { desc: 'Tarefa completada ontem', status: 'completed', completedYesterday: true },
    { desc: 'Tarefa adiada', status: 'postponed', postponed: true },
    { desc: 'Tarefa adiada múltiplas vezes', status: 'postponed', postponedMultiple: true }
  ];

  for (let i = 0; i < 100; i++) {
    const template = taskTemplates[i % taskTemplates.length] || { desc: `Tarefa de teste ${i + 1}` };
    const projectIndex = template.project !== undefined ? template.project : Math.floor(Math.random() * 4); // 3 projetos + sem projeto
    
    const task = {
      userId,
      description: template.desc || `Tarefa de teste ${i + 1}`,
      status: template.status || statuses[Math.floor(Math.random() * statuses.length)],
      energyPoints: template.energy || energyPoints[Math.floor(Math.random() * energyPoints.length)],
      type: template.type || types[Math.floor(Math.random() * types.length)],
      projectId: projectIndex < 3 ? projects[projectIndex].id : null,
      isRecurring: template.recurring ? true : false,
      externalLinks: template.links || [],
      plannedForToday: Math.random() > 0.7,
      postponementCount: template.postponedMultiple ? Math.floor(Math.random() * 3) + 1 : 0
    };

    // Adicionar data de vencimento se especificada
    if (template.dueOffset !== undefined) {
      task.dueDate = new Date(generateDate(template.dueOffset));
    } else if (Math.random() > 0.6) { // 40% das tarefas terão data aleatória
      const randomOffset = Math.floor(Math.random() * 60) - 30; // -30 a +30 dias
      task.dueDate = new Date(generateDate(randomOffset));
    }

    // Definir datas de conclusão/adiamento
    if (task.status === 'completed') {
      if (template.completedToday) {
        task.completedAt = new Date();
      } else if (template.completedYesterday) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        task.completedAt = yesterday;
      } else {
        const completedDate = new Date();
        completedDate.setDate(completedDate.getDate() - Math.floor(Math.random() * 10));
        task.completedAt = completedDate;
      }
    }

    if (task.status === 'postponed' || template.postponed) {
      task.postponedAt = new Date();
      task.postponementReason = 'Motivo de teste para adiamento';
    }

    tasks.push(task);
  }

  // Criar todas as tarefas
  const createdTasks = await prisma.task.createMany({
    data: tasks
  });

  console.log(`✅ Criadas ${createdTasks.count} tarefas de teste`);

  // Buscar algumas tarefas criadas para adicionar recorrência, comentários e anexos
  const sampleTasks = await prisma.task.findMany({
    where: { userId },
    take: 10
  });

  // Adicionar recorrência a algumas tarefas
  for (let i = 0; i < 3; i++) {
    if (sampleTasks[i] && tasks[i].isRecurring) {
      await prisma.taskRecurrence.create({
        data: {
          taskId: sampleTasks[i].id,
          frequency: i === 0 ? 'daily' : 'weekly',
          daysOfWeek: i === 1 ? [1, 2, 3, 4, 5] : []
        }
      });
    }
  }

  // Adicionar comentários a algumas tarefas
  for (let i = 0; i < 5; i++) {
    if (sampleTasks[i]) {
      await prisma.taskComment.create({
        data: {
          taskId: sampleTasks[i].id,
          author: 'Demo User',
          content: `Comentário de teste ${i + 1}: Este é um comentário para testar a funcionalidade de comentários nas tarefas.`
        }
      });
    }
  }

  // Adicionar histórico a algumas tarefas
  for (let i = 0; i < 8; i++) {
    if (sampleTasks[i]) {
      const actions = ['created', 'edited', 'postponed', 'completed'];
      await prisma.taskHistory.create({
        data: {
          taskId: sampleTasks[i].id,
          action: actions[i % actions.length],
          details: {
            field: 'status',
            oldValue: 'pending',
            newValue: 'completed',
            reason: 'Teste de histórico'
          }
        }
      });
    }
  }

  console.log('✅ Dados de teste adicionados com sucesso!');
  console.log(`👤 Usuário: ${demoUser.email}`);
  console.log(`🔑 Senha: ${demoUser.password}`);
  console.log(`📊 Total de tarefas: 100`);
  console.log(`📁 Projetos: ${projects.length}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });