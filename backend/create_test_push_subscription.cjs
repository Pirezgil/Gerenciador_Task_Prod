const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createTestPushSubscription() {
  try {
    console.log('🔧 CRIANDO PUSH SUBSCRIPTION DE TESTE');
    console.log('====================================');
    
    const userId = 'cme1wvcwt0000qpvbb8b6yqj6'; // Gilmar Pires
    
    console.log('👤 Usuário:', userId);
    console.log('');
    
    // Criar uma subscription mock (simulando o que o navegador faria)
    const mockSubscription = {
      userId: userId,
      // Endpoint mock do FCM (Google Firebase Cloud Messaging)
      endpoint: 'https://fcm.googleapis.com/fcm/send/mock-endpoint-for-testing-' + Date.now(),
      // Chaves mock (em produção seriam geradas pelo navegador)
      p256dh: 'BEq0Fm_4no22iBlar6AF_ChbOCAQLEGiKvP69bCBgWXkgyQA18RPpXFNM0QjEZkvM9-W9g0DkR4WjV_LlpcwgYY',
      auth: 'xUauQW65D84wKE71CgOY45kzz9RVlhgSCbEDN0Rtdic',
      userAgent: 'Mozilla/5.0 (Test Browser) - Claude Code Testing',
      isActive: true
    };
    
    console.log('📋 DADOS DA SUBSCRIPTION:');
    console.log('   Endpoint:', mockSubscription.endpoint);
    console.log('   User Agent:', mockSubscription.userAgent);
    console.log('   Ativa:', mockSubscription.isActive);
    
    // Verificar se já existe uma subscription para este usuário
    const existingSubscriptions = await prisma.pushSubscription.findMany({
      where: { userId: userId }
    });
    
    if (existingSubscriptions.length > 0) {
      console.log('');
      console.log('⚠️ Subscriptions existentes encontradas:', existingSubscriptions.length);
      console.log('   Deletando subscriptions antigas para teste limpo...');
      
      await prisma.pushSubscription.deleteMany({
        where: { userId: userId }
      });
      
      console.log('   ✅ Subscriptions antigas removidas');
    }
    
    // Criar nova subscription
    const subscription = await prisma.pushSubscription.create({
      data: mockSubscription
    });
    
    console.log('');
    console.log('✅ PUSH SUBSCRIPTION CRIADA!');
    console.log('   ID:', subscription.id);
    console.log('   Criada em:', subscription.createdAt);
    console.log('   Status:', subscription.isActive ? 'Ativa' : 'Inativa');
    
    // Verificar se a subscription foi salva corretamente
    const savedSubscription = await prisma.pushSubscription.findUnique({
      where: { id: subscription.id },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    
    console.log('');
    console.log('🔍 VERIFICAÇÃO:');
    console.log('   Usuário:', savedSubscription?.user.name);
    console.log('   Endpoint salvo:', savedSubscription?.endpoint.substring(0, 50) + '...');
    console.log('   P256DH salvo:', savedSubscription?.p256dh.substring(0, 20) + '...');
    console.log('   Auth salvo:', savedSubscription?.auth.substring(0, 20) + '...');
    
    console.log('');
    console.log('🎯 PRÓXIMO TESTE:');
    console.log('   1. Agora temos uma push subscription ativa no banco');
    console.log('   2. Criar um novo lembrete para testar o fluxo completo');
    console.log('   3. Verificar se o notificationService consegue enviar');
    console.log('');
    console.log('⚠️ NOTA IMPORTANTE:');
    console.log('   Esta é uma subscription MOCK para testes');
    console.log('   Em produção, o navegador geraria os endpoints e chaves reais');
    console.log('   O envio pode falhar porque o endpoint é fictício');
    
    console.log('');
    console.log('====================================');
    
  } catch (error) {
    console.error('❌ Erro ao criar push subscription:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestPushSubscription();