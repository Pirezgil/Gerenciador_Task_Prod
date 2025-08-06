const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const prisma = new PrismaClient();

async function checkUser() {
  const user = await prisma.user.findUnique({ 
    where: { email: 'demo@gerenciador.com' },
    select: { id: true, email: true, password: true }
  });
  
  if (user) {
    console.log('✅ User found:', user.email);
    console.log('🔑 Password hash exists:', !!user.password);
    
    if (user.password) {
      const isValid = await bcrypt.compare('demo1234', user.password);
      console.log('✅ Password valid:', isValid);
    }
    
    // Test API call
    console.log('\n🔍 Testing API call...');
    const tasks = await prisma.task.findMany({
      where: { userId: user.id, isDeleted: false },
      select: { 
        id: true, 
        description: true, 
        status: true, 
        plannedForToday: true, 
        dueDate: true,
        energyPoints: true 
      }
    });
    
    const today = new Date().toISOString().split('T')[0];
    const todayTasks = tasks.filter(task => {
      if (task.plannedForToday === true) {
        return task.status === 'pending' || task.status === 'postponed';
      }
      if (task.dueDate && task.dueDate.toISOString().split('T')[0] === today) {
        return task.status === 'pending' || task.status === 'postponed';
      }
      if (!task.dueDate) {
        return task.status === 'pending';
      }
      return false;
    });
    
    console.log('📊 Total tasks in DB:', tasks.length);
    console.log('📅 Tasks for today (filtered):', todayTasks.length);
    console.log('⚡ Energy sum:', todayTasks.reduce((sum, t) => sum + t.energyPoints, 0));
    
  } else {
    console.log('❌ User not found');
  }
  
  await prisma.$disconnect();
}

checkUser().catch(console.error);