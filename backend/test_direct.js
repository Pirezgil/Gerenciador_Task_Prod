// Teste direto usando o Prisma Client do projeto
const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

const prisma = new PrismaClient();

async function testSystem() {
  try {
    console.log('🔗 Testando sistema de lembretes...');
    
    // 1. Verificar conexão com banco
    const userCount = await prisma.user.count();
    console.log(`👥 Usuários no sistema: ${userCount}`);
    
    // 2. Verificar lembretes ativos
    const now = new Date();
    const activeReminders = await prisma.reminder.findMany({
      where: {
        isActive: true,
        nextScheduledAt: {
          lte: now
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            settings: {
              select: {
                notifications: true
              }
            }
          }
        }
      },
      take: 5
    });
    
    console.log(`📋 Lembretes prontos: ${activeReminders.length}`);
    
    activeReminders.forEach((reminder, index) => {
      console.log(`\n--- Lembrete ${index + 1} ---`);
      console.log(`ID: ${reminder.id}`);
      console.log(`Usuário: ${reminder.user.name}`);
      console.log(`Tipo: ${reminder.type}`);
      console.log(`Agendado: ${reminder.nextScheduledAt}`);
      console.log(`Notificações habilitadas: ${reminder.user.settings?.notifications ?? true}`);
    });
    
    // 3. Verificar push subscriptions
    const pushSubscriptions = await prisma.pushSubscription.findMany({
      where: { isActive: true },
      include: {
        user: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });
    
    console.log(`\n📱 Push subscriptions ativas: ${pushSubscriptions.length}`);
    
    if (pushSubscriptions.length === 0) {
      console.log('❌ PROBLEMA IDENTIFICADO: Sem push subscriptions!');
      console.log('💡 O frontend precisa registrar push subscriptions para receber notificações.');
    }
    
    // 4. Verificar chaves VAPID
    console.log(`\n🔑 Chaves VAPID configuradas:`);
    console.log(`VAPID_PUBLIC_KEY: ${process.env.VAPID_PUBLIC_KEY ? 'Configurada' : 'Ausente'}`);
    console.log(`VAPID_PRIVATE_KEY: ${process.env.VAPID_PRIVATE_KEY ? 'Configurada' : 'Ausente'}`);
    console.log(`VAPID_SUBJECT: ${process.env.VAPID_SUBJECT || 'Não configurado'}`);
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSystem();