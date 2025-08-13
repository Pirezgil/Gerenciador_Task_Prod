const { PrismaClient } = require('@prisma/client');

async function checkFinalSubscriptions() {
  const prisma = new PrismaClient();
  
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'demo@gerenciador.com' },
      select: { id: true, name: true, email: true }
    });
    
    if (!user) {
      console.log('❌ Usuário não encontrado!');
      return;
    }
    
    const subscriptions = await prisma.pushSubscription.count({
      where: { 
        userId: user.id,
        isActive: true
      }
    });
    
    console.log(`👤 Usuário: ${user.name}`);
    console.log(`📱 Assinaturas ativas: ${subscriptions}`);
    
    if (subscriptions > 0) {
      console.log('✅ SUCESSO: Usuário tem assinaturas push ativas!');
      console.log('🔔 Os lembretes agora devem funcionar.');
    } else {
      console.log('❌ PROBLEMA: Usuário ainda não tem assinaturas push.');
      console.log('📋 Siga os passos do console para registrar manualmente.');
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkFinalSubscriptions();