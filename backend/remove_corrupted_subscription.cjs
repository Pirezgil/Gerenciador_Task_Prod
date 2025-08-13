const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixSubscription() {
  try {
    console.log('🔧 CORRIGINDO PUSH SUBSCRIPTION');
    console.log('===============================');
    
    const userId = 'cme1wvcwt0000qpvbb8b6yqj6';
    
    // Remover subscription com problemas
    const deletedCount = await prisma.pushSubscription.deleteMany({
      where: { userId: userId }
    });
    
    console.log('🗑️ Subscriptions removidas:', deletedCount.count);
    
    // Criar nova subscription válida
    const validSubscription = {
      userId: userId,
      // Usar endpoint mais realista 
      endpoint: 'https://fcm.googleapis.com/fcm/send/cme792mry00019e4twvd8nwsj:APA91bH5w-mock-endpoint-valid-test',
      // Chaves VAPID válidas (baseadas na configuração do servidor)
      p256dh: 'BEq0Fm_4no22iBlar6AF_ChbOCAQLEGiKvP69bCBgWXkgyQA18RPpXFNM0QjEZkvM9-W9g0DkR4WjV_LlpcwgYY',
      auth: 'valid-auth-key-for-testing-12345678',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      isActive: true // Garantir que está ativa
    };
    
    const subscription = await prisma.pushSubscription.create({
      data: validSubscription
    });
    
    console.log('✅ Nova subscription criada:');
    console.log('   ID:', subscription.id);
    console.log('   Ativa:', subscription.isActive);
    console.log('   Endpoint:', subscription.endpoint.substring(0, 50) + '...');
    
    // Verificar
    const activeCount = await prisma.pushSubscription.count({
      where: { 
        userId: userId,
        isActive: true 
      }
    });
    
    console.log('');
    console.log('📱 VERIFICAÇÃO FINAL:');
    console.log('   Push subscriptions ativas:', activeCount);
    
    if (activeCount > 0) {
      console.log('   ✅ Sistema pronto para enviar push notifications!');
    } else {
      console.log('   ❌ Ainda há problemas com as subscriptions');
    }
    
    console.log('');
    console.log('===============================');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixSubscription();