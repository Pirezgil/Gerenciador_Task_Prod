const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkReminders() {
  try {
    console.log('📊 ANÁLISE GERAL DO SISTEMA DE LEMBRETES:');
    
    // Total de lembretes no sistema
    const totalReminders = await prisma.reminder.count();
    console.log('Total de lembretes no sistema:', totalReminders);
    
    // Lembretes por tipo
    const remindersByType = await prisma.reminder.groupBy({
      by: ['type'],
      _count: { type: true }
    });
    
    console.log('\nLembretes por tipo:');
    remindersByType.forEach(group => {
      console.log('  ' + group.type + ': ' + group._count.type);
    });
    
    // Lembretes ativos
    const activeReminders = await prisma.reminder.count({
      where: { isActive: true }
    });
    console.log('\nLembretes ativos:', activeReminders);
    
    // Últimos 5 lembretes criados
    const recentReminders = await prisma.reminder.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    
    console.log('\n🕐 ÚLTIMOS 5 LEMBRETES CRIADOS:');
    recentReminders.forEach((reminder, index) => {
      console.log('  ' + (index + 1) + '. ID: ' + reminder.id);
      console.log('     Tipo: ' + reminder.type + (reminder.subType ? ' (' + reminder.subType + ')' : ''));
      console.log('     Entidade: ' + (reminder.entityType || 'N/A') + ' - ' + (reminder.entityId || 'N/A'));
      console.log('     Usuário: ' + reminder.user.name);
      console.log('     Próximo agendamento: ' + reminder.nextScheduledAt);
      console.log('     Ativo: ' + reminder.isActive);
      console.log('     Criado em: ' + reminder.createdAt);
      console.log('');
    });
    
  } catch (error) {
    console.error('Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkReminders();