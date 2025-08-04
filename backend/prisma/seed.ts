import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar usuário de exemplo
  const hashedPassword = await bcrypt.hash('123456', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@gerenciador.com' },
    update: {},
    create: {
      name: 'Usuário Demo',
      email: 'demo@gerenciador.com',
      avatarUrl: null,
    },
  });

  // Criar configurações padrão do usuário
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      dailyEnergyBudget: 12,
      theme: 'light',
      timezone: 'America/Sao_Paulo',
      notifications: true,
      sandboxEnabled: false,
    },
  });

  // Criar projeto exemplo
  const project = await prisma.project.create({
    data: {
      userId: user.id,
      name: 'Projeto Exemplo',
      icon: '🚀',
      color: '#3B82F6',
      status: 'active',
    },
  });

  // Criar tarefas exemplo
  const tasks = [
    {
      description: 'Configurar ambiente de desenvolvimento',
      energyPoints: 5,
      type: 'task',
      status: 'completed',
      completedAt: new Date(),
    },
    {
      description: 'Implementar autenticação JWT',
      energyPoints: 5,
      type: 'task',
      status: 'pending',
    },
    {
      description: 'Revisar documentação do projeto',
      energyPoints: 1,
      type: 'brick',
      status: 'pending',
    },
  ];

  for (const taskData of tasks) {
    await prisma.task.create({
      data: {
        ...taskData,
        userId: user.id,
        projectId: project.id,
      },
    });
  }

  // Criar hábito exemplo
  const habit = await prisma.habit.create({
    data: {
      userId: user.id,
      name: 'Exercitar-se',
      description: 'Fazer pelo menos 30 minutos de exercício',
      icon: '💪',
      color: '#10B981',
      targetCount: 1,
    },
  });

  // Criar frequência do hábito
  await prisma.habitFrequency.create({
    data: {
      habitId: habit.id,
      type: 'daily',
      intervalDays: 1,
      daysOfWeek: [1, 2, 3, 4, 5], // Segunda a sexta
    },
  });

  // Criar nota exemplo
  await prisma.note.create({
    data: {
      userId: user.id,
      content: 'Esta é uma nota de exemplo na caixa de areia',
      status: 'active',
    },
  });

  // Criar log de energia diário
  await prisma.dailyEnergyLog.create({
    data: {
      userId: user.id,
      date: new Date(),
      budgetTotal: 12,
      energyUsed: 5,
      energyRemaining: 7,
      tasksCompleted: 1,
    },
  });

  console.log('✅ Seed concluído com sucesso!');
  console.log(`👤 Usuário criado: ${user.email}`);
  console.log(`📋 Projeto criado: ${project.name}`);
  console.log(`✅ ${tasks.length} tarefas criadas`);
  console.log(`🔄 1 hábito criado`);
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });