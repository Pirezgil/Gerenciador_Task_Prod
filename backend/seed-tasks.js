const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Dados de exemplo
const projects = [
  { name: 'Aprender Inglês', icon: '🇺🇸', color: '#3B82F6' },
  { name: 'Fitness & Saúde', icon: '💪', color: '#10B981' },
  { name: 'Trabalho', icon: '💼', color: '#8B5CF6' },
  { name: 'Casa & Família', icon: '🏠', color: '#F59E0B' },
  { name: 'Projetos Pessoais', icon: '🚀', color: '#EF4444' },
  { name: 'Estudos', icon: '📚', color: '#06B6D4' },
  { name: 'Hobbies', icon: '🎨', color: '#EC4899' }
];

const taskTemplates = [
  // Inglês
  { description: 'Estudar inglês 30 min', energyPoints: 3, type: 'task', isRecurring: true },
  { description: 'Assistir série em inglês', energyPoints: 1, type: 'task' },
  { description: 'Fazer exercícios de gramática', energyPoints: 5, type: 'task' },
  { description: 'Conversar com tutor online', energyPoints: 5, type: 'task', isAppointment: true },
  { description: 'Ler artigo em inglês', energyPoints: 3, type: 'task' },
  
  // Fitness
  { description: 'Treino na academia', energyPoints: 5, type: 'task', isRecurring: true },
  { description: 'Caminhada 30 min', energyPoints: 3, type: 'task' },
  { description: 'Yoga matinal', energyPoints: 3, type: 'task', isRecurring: true },
  { description: 'Preparar shake de proteína', energyPoints: 1, type: 'task' },
  { description: 'Consulta com nutricionista', energyPoints: 3, type: 'task', isAppointment: true },
  
  // Trabalho
  { description: 'Revisar código do projeto X', energyPoints: 5, type: 'task' },
  { description: 'Reunião equipe desenvolvimento', energyPoints: 3, type: 'task', isAppointment: true },
  { description: 'Atualizar documentação', energyPoints: 3, type: 'task' },
  { description: 'Corrigir bugs reportados', energyPoints: 5, type: 'task' },
  { description: 'Planejar sprint da semana', energyPoints: 3, type: 'task' },
  
  // Casa
  { description: 'Limpar a casa', energyPoints: 3, type: 'task' },
  { description: 'Fazer compras no mercado', energyPoints: 3, type: 'task' },
  { description: 'Organizar armário', energyPoints: 5, type: 'task' },
  { description: 'Pagar contas do mês', energyPoints: 1, type: 'task' },
  { description: 'Jantar em família', energyPoints: 1, type: 'task', isAppointment: true },
  
  // Projetos Pessoais
  { description: 'Trabalhar no app pessoal', energyPoints: 5, type: 'task' },
  { description: 'Escrever no blog', energyPoints: 3, type: 'task' },
  { description: 'Editar vídeo YouTube', energyPoints: 5, type: 'task' },
  { description: 'Pesquisa para novo projeto', energyPoints: 3, type: 'task' },
  { description: 'Networking online', energyPoints: 1, type: 'task' },
  
  // Estudos
  { description: 'Curso online React', energyPoints: 5, type: 'task' },
  { description: 'Ler livro técnico', energyPoints: 3, type: 'task' },
  { description: 'Praticar algoritmos', energyPoints: 5, type: 'task' },
  { description: 'Assistir palestra tech', energyPoints: 1, type: 'task' },
  { description: 'Fazer anotações de estudo', energyPoints: 3, type: 'task' },
  
  // Hobbies
  { description: 'Tocar violão 1 hora', energyPoints: 3, type: 'task' },
  { description: 'Desenhar por 30 min', energyPoints: 3, type: 'task' },
  { description: 'Jogar videogame', energyPoints: 1, type: 'task' },
  { description: 'Assistir filme', energyPoints: 1, type: 'task' },
  { description: 'Cozinhar receita nova', energyPoints: 3, type: 'task' },
  
  // Extras
  { description: 'Meditar 15 minutos', energyPoints: 1, type: 'task', isRecurring: true },
  { description: 'Planejar a semana', energyPoints: 3, type: 'task' },
  { description: 'Backup dos arquivos', energyPoints: 1, type: 'task' },
  { description: 'Ligar para os pais', energyPoints: 1, type: 'task' },
  { description: 'Revisar objetivos mensais', energyPoints: 3, type: 'task' },
  { description: 'Organizar desktop', energyPoints: 1, type: 'task' },
  { description: 'Atualizar CV', energyPoints: 3, type: 'task' },
  { description: 'Pesquisar viagem férias', energyPoints: 1, type: 'task' },
  { description: 'Manutenção do carro', energyPoints: 3, type: 'task', isAppointment: true },
  { description: 'Agendar exames médicos', energyPoints: 1, type: 'task' },
  { description: 'Renovar documentos', energyPoints: 3, type: 'task' },
  { description: 'Doar roupas antigas', energyPoints: 1, type: 'task' },
  { description: 'Instalar app de produtividade', energyPoints: 1, type: 'task' },
  { description: 'Configurar backup automático', energyPoints: 3, type: 'task' },
  { description: 'Ler emails importantes', energyPoints: 1, type: 'task' },
  { description: 'Organizar fotos no celular', energyPoints: 1, type: 'task' },
  { description: 'Planejar cardápio da semana', energyPoints: 3, type: 'task' },
  { description: 'Limpar e organizar mesa trabalho', energyPoints: 1, type: 'task' }
];

const comments = [
  'Ótimo progresso hoje!',
  'Preciso focar mais nisso',
  'Tarefa mais difícil que esperava',
  'Muito satisfatório completar',
  'Demorou mais que o planejado',
  'Excelente resultado',
  'Vou tentar uma abordagem diferente',
  'Tarefa bem executada',
  'Preciso de mais tempo para isso',
  'Superou minhas expectativas'
];

const statuses = ['pending', 'in_progress', 'completed'];

async function main() {
  console.log('🚀 Iniciando seed das tarefas...');
  
  // Buscar um usuário existente
  const user = await prisma.user.findFirst();
  if (!user) {
    console.error('❌ Nenhum usuário encontrado. Crie um usuário primeiro.');
    return;
  }
  
  console.log(`📝 Criando tarefas para usuário: ${user.email}`);
  
  // Criar projetos
  console.log('📁 Criando projetos...');
  const createdProjects = [];
  for (const project of projects) {
    const createdProject = await prisma.project.create({
      data: {
        ...project,
        userId: user.id
      }
    });
    createdProjects.push(createdProject);
  }
  
  // Criar tarefas
  console.log('✅ Criando 50 tarefas...');
  const tasks = [];
  
  for (let i = 0; i < 50; i++) {
    const template = taskTemplates[i % taskTemplates.length];
    const project = createdProjects[i % createdProjects.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    
    // Datas aleatórias
    const today = new Date();
    const randomDays = Math.floor(Math.random() * 30) - 15; // -15 a +15 dias
    const dueDate = new Date(today);
    dueDate.setDate(today.getDate() + randomDays);
    
    const task = await prisma.task.create({
      data: {
        description: `${template.description} ${i + 1}`,
        userId: user.id,
        projectId: Math.random() > 0.2 ? project.id : null, // 80% com projeto
        status: status,
        energyPoints: template.energyPoints,
        type: template.type,
        isRecurring: template.isRecurring || false,
        isAppointment: template.isAppointment || false,
        dueDate: Math.random() > 0.3 ? dueDate : null, // 70% com data
        plannedForToday: Math.random() > 0.7, // 30% planejadas para hoje
        externalLinks: Math.random() > 0.8 ? ['https://example.com', 'https://docs.google.com'] : [],
        postponementCount: Math.random() > 0.8 ? Math.floor(Math.random() * 3) : 0,
        completedAt: status === 'completed' ? new Date() : null
      }
    });
    
    tasks.push(task);
    
    // Adicionar comentários aleatórios
    if (Math.random() > 0.6) { // 40% das tarefas têm comentários
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < numComments; j++) {
        await prisma.taskComment.create({
          data: {
            taskId: task.id,
            author: user.name || user.email,
            content: comments[Math.floor(Math.random() * comments.length)],
            createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
          }
        });
      }
    }
    
    // Adicionar histórico
    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        action: 'created',
        details: { reason: 'Tarefa criada automaticamente' }
      }
    });
    
    if (status === 'completed') {
      await prisma.taskHistory.create({
        data: {
          taskId: task.id,
          action: 'completed',
          details: { completedBy: user.id }
        }
      });
    }
  }
  
  console.log('✨ Seed concluído com sucesso!');
  console.log(`📊 Criados: ${createdProjects.length} projetos e ${tasks.length} tarefas`);
  
  // Estatísticas
  const stats = {
    pending: tasks.filter(t => t.status === 'pending').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    completed: tasks.filter(t => t.status === 'completed').length,
    planned_today: tasks.filter(t => t.plannedForToday).length,
    with_projects: tasks.filter(t => t.projectId).length,
    recurring: tasks.filter(t => t.isRecurring).length,
    appointments: tasks.filter(t => t.isAppointment).length
  };
  
  console.log('📈 Estatísticas:');
  console.log(`   - Pendentes: ${stats.pending}`);
  console.log(`   - Em progresso: ${stats.in_progress}`);
  console.log(`   - Concluídas: ${stats.completed}`);
  console.log(`   - Planejadas para hoje: ${stats.planned_today}`);
  console.log(`   - Com projetos: ${stats.with_projects}`);
  console.log(`   - Recorrentes: ${stats.recurring}`);
  console.log(`   - Compromissos: ${stats.appointments}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });