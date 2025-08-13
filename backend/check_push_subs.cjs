const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkPushSubscriptions() {
  try {
    console.log('🔍 INVESTIGANDO NOTIFICAÇÕES PUSH');
    console.log('=================================');
    
    const userId = 'cme1wvcwt0000qpvbb8b6yqj6'; // Gilmar Pires
    
    // Verificar push subscriptions do usuário
    const subscriptions = await prisma.pushSubscription.findMany({
      where: { userId: userId },
      include: {
        user: { select: { name: true, email: true } }
      }
    });
    
    console.log('📱 PUSH SUBSCRIPTIONS DO USUÁRIO:', subscriptions.length);
    
    if (subscriptions.length === 0) {
      console.log('❌ PROBLEMA ENCONTRADO: Nenhuma push subscription registrada');
      console.log('');
      console.log('💡 CAUSA RAIZ:');
      console.log('   O usuário não tem push subscriptions ativas no banco');
      console.log('   Sem subscriptions, o notificationService não pode enviar push notifications');
      console.log('');
      console.log('🔧 SOLUÇÕES:');
      console.log('   1. No navegador: Permitir notificações quando solicitado');
      console.log('   2. Frontend: Registrar service worker e criar push subscription');
      console.log('   3. Backend: Salvar subscription no banco via API');
      console.log('');
      console.log('🎯 PRÓXIMO PASSO:');
      console.log('   Verificar se o Service Worker está registrado no frontend');
      console.log('   e se o usuário permitiu notificações no navegador');
    } else {
      console.log('');
      subscriptions.forEach((sub, index) => {
        console.log('  ' + (index + 1) + '. Subscription ID: ' + sub.id);
        console.log('     Usuário: ' + sub.user.name);
        console.log('     Endpoint: ' + sub.endpoint.substring(0, 50) + '...');
        console.log('     Ativa: ' + sub.isActive);
        console.log('     Criada em: ' + sub.createdAt);
        console.log('     Última notificação: ' + (sub.lastNotificationSent || 'Nunca'));
        console.log('     User Agent: ' + (sub.userAgent || 'N/A'));
        console.log('');
      });
      
      const activeCount = subscriptions.filter(s => s.isActive).length;
      console.log('📊 RESUMO:');
      console.log('   Total: ' + subscriptions.length);
      console.log('   Ativas: ' + activeCount);
      console.log('   Inativas: ' + (subscriptions.length - activeCount));
      
      if (activeCount === 0) {
        console.log('');
        console.log('⚠️ PROBLEMA: Existem subscriptions mas nenhuma está ativa');
        console.log('   Possível que as subscriptions expiraram ou são inválidas');
      }
    }
    
    // Verificar configurações do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { settings: true }
    });
    
    console.log('');
    console.log('⚙️ CONFIGURAÇÕES DO USUÁRIO:');
    console.log('   Notificações habilitadas:', user?.settings?.notifications !== false);
    
    // Verificar se há chaves VAPID configuradas
    console.log('');
    console.log('🔑 CONFIGURAÇÃO DO SERVIDOR:');
    console.log('   VAPID configurado: Verificar variáveis de ambiente');
    
  } catch (error) {
    console.error('❌ Erro:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkPushSubscriptions();