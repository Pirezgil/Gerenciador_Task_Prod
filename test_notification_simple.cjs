// Teste simples para verificar se o sistema de notificações está funcionando
const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:20262595@localhost:5432/banco_sentinela"
});

async function testNotificationFlow() {
  try {
    await client.connect();
    console.log('🔗 Conectado ao banco de dados');
    
    // 1. Verificar quantos lembretes estão prontos para serem enviados
    const now = new Date().toISOString();
    console.log(`📅 Hora atual: ${now}`);
    
    const remindersQuery = `
      SELECT 
        id, user_id, type, entity_type, next_scheduled_at,
        notification_types, message, is_active
      FROM reminders 
      WHERE is_active = true 
        AND next_scheduled_at <= NOW()
      ORDER BY next_scheduled_at ASC
      LIMIT 5
    `;
    
    const remindersResult = await client.query(remindersQuery);
    console.log(`📋 Lembretes prontos para envio: ${remindersResult.rows.length}`);
    
    if (remindersResult.rows.length > 0) {
      console.log('\n--- LEMBRETES ENCONTRADOS ---');
      remindersResult.rows.forEach((reminder, index) => {
        console.log(`${index + 1}. ID: ${reminder.id}`);
        console.log(`   Tipo: ${reminder.type}`);
        console.log(`   Agendado para: ${reminder.next_scheduled_at}`);
        console.log(`   Tipos de notificação: ${reminder.notification_types}`);
        console.log(`   Mensagem: ${reminder.message || 'N/A'}`);
      });
    }
    
    // 2. Verificar push subscriptions para esses usuários
    if (remindersResult.rows.length > 0) {
      const userIds = remindersResult.rows.map(r => r.user_id);
      const uniqueUserIds = [...new Set(userIds)];
      
      console.log(`\n🔍 Verificando push subscriptions para ${uniqueUserIds.length} usuário(s)...`);
      
      const subscriptionsQuery = `
        SELECT 
          user_id, COUNT(*) as subscription_count,
          SUM(CASE WHEN is_active = true THEN 1 ELSE 0 END) as active_subscriptions
        FROM push_subscriptions 
        WHERE user_id = ANY($1)
        GROUP BY user_id
      `;
      
      const subscriptionsResult = await client.query(subscriptionsQuery, [uniqueUserIds]);
      
      if (subscriptionsResult.rows.length > 0) {
        console.log('\n--- PUSH SUBSCRIPTIONS ---');
        subscriptionsResult.rows.forEach(sub => {
          console.log(`Usuário ${sub.user_id}: ${sub.subscription_count} total, ${sub.active_subscriptions} ativas`);
        });
      } else {
        console.log('❌ PROBLEMA IDENTIFICADO: Nenhuma push subscription encontrada!');
        console.log('💡 Isso explica por que as notificações não estão sendo enviadas.');
        console.log('💡 O sistema precisa de push subscriptions para funcionar.');
      }
    }
    
    // 3. Verificar configurações de notificação dos usuários
    console.log('\n🔍 Verificando configurações de notificação dos usuários...');
    const userSettingsQuery = `
      SELECT 
        u.id, u.name, u.email,
        COALESCE(us.notifications, true) as notifications_enabled
      FROM users u
      LEFT JOIN user_settings us ON u.id = us.user_id
      LIMIT 3
    `;
    
    const userSettingsResult = await client.query(userSettingsQuery);
    console.log('\n--- CONFIGURAÇÕES DE USUÁRIO ---');
    userSettingsResult.rows.forEach(user => {
      console.log(`${user.name} (${user.email}): Notificações ${user.notifications_enabled ? 'HABILITADAS' : 'DESABILITADAS'}`);
    });
    
  } catch (error) {
    console.error('❌ Erro no teste:', error);
  } finally {
    await client.end();
  }
}

testNotificationFlow();