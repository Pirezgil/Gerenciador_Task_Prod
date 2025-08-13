// Usar uma conexão direta ao PostgreSQL para verificar
const { Client } = require('pg');

const client = new Client({
  connectionString: "postgresql://postgres:20262595@localhost:5432/banco_sentinela"
});

async function checkPushSubscriptions() {
  try {
    await client.connect();
    console.log('🔍 Verificando Push Subscriptions no banco...');
    
    // Verificar push subscriptions
    const subscriptionsResult = await client.query(`
      SELECT 
        ps.id, ps.endpoint, ps.is_active, ps.created_at,
        u.name, u.email
      FROM push_subscriptions ps
      JOIN users u ON ps.user_id = u.id
      ORDER BY ps.created_at DESC
    `);
    
    console.log(`📊 Total de push subscriptions: ${subscriptionsResult.rows.length}`);
    
    if (subscriptionsResult.rows.length > 0) {
      subscriptionsResult.rows.forEach((sub, index) => {
        console.log(`\n--- Subscription ${index + 1} ---`);
        console.log(`ID: ${sub.id}`);
        console.log(`User: ${sub.name} (${sub.email})`);
        console.log(`Endpoint: ${sub.endpoint.substring(0, 50)}...`);
        console.log(`Active: ${sub.is_active}`);
        console.log(`Created: ${sub.created_at}`);
      });
    } else {
      console.log('⚠️ Nenhuma push subscription encontrada no banco.');
      console.log('💡 Isso explica por que as notificações não estão sendo enviadas.');
    }
    
    // Verificar lembretes ativos também
    console.log('\n🔍 Verificando lembretes ativos...');
    const remindersResult = await client.query(`
      SELECT 
        r.id, r.type, r.entity_type, r.next_scheduled_at,
        u.name
      FROM reminders r
      JOIN users u ON r.user_id = u.id
      WHERE r.is_active = true AND r.next_scheduled_at IS NOT NULL
      ORDER BY r.next_scheduled_at ASC
      LIMIT 5
    `);
    
    console.log(`📋 Lembretes ativos: ${remindersResult.rows.length}`);
    
    if (remindersResult.rows.length > 0) {
      remindersResult.rows.forEach((reminder, index) => {
        console.log(`\n--- Lembrete ${index + 1} ---`);
        console.log(`ID: ${reminder.id}`);
        console.log(`User: ${reminder.name}`);
        console.log(`Type: ${reminder.type}`);
        console.log(`Next run: ${reminder.next_scheduled_at}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar push subscriptions:', error);
  } finally {
    await client.end();
  }
}

checkPushSubscriptions();