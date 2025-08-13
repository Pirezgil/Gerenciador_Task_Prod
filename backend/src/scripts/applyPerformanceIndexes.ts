import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const performanceIndexes = [
  // Índice composto para consultas de notificação ativas
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_active_scheduled 
   ON reminders (is_active, next_scheduled_at) 
   WHERE is_active = true`,

  // Índice para consultas por usuário e entidade
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_user_entity 
   ON reminders (user_id, entity_id, entity_type, is_active)`,

  // Índice para lembretes de intervalo
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_interval_enabled 
   ON reminders (interval_enabled, is_active, next_scheduled_at) 
   WHERE interval_enabled = true`,

  // Índice para sub-tipos de lembretes
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_subtype 
   ON reminders (sub_type, entity_id, is_active) 
   WHERE sub_type IS NOT NULL`,

  // Índice para limpeza automática
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_created_at 
   ON reminders (created_at, is_active)`,

  // Índice para lembretes por tipo
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_type_active 
   ON reminders (type, is_active, next_scheduled_at)`,

  // Índice para parent_reminder_id
  `CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_parent_id 
   ON reminders (parent_reminder_id) 
   WHERE parent_reminder_id IS NOT NULL`,
];

async function applyPerformanceIndexes() {
  console.log('🚀 Aplicando índices de performance para lembretes...');
  
  try {
    for (let i = 0; i < performanceIndexes.length; i++) {
      const indexSQL = performanceIndexes[i];
      console.log(`📝 Aplicando índice ${i + 1}/${performanceIndexes.length}...`);
      
      await prisma.$executeRawUnsafe(indexSQL);
      console.log(`✅ Índice ${i + 1} aplicado com sucesso`);
    }
    
    console.log('✅ Todos os índices de performance foram aplicados com sucesso!');
    
    // Verificar os índices criados
    const indexesQuery = `
      SELECT indexname, indexdef 
      FROM pg_indexes 
      WHERE tablename = 'reminders' 
      AND indexname LIKE 'idx_reminders_%'
      ORDER BY indexname;
    `;
    
    const indexes = await prisma.$queryRawUnsafe(indexesQuery);
    console.log('📊 Índices criados:', indexes);
    
  } catch (error) {
    console.error('❌ Erro ao aplicar índices de performance:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  applyPerformanceIndexes()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

export { applyPerformanceIndexes };