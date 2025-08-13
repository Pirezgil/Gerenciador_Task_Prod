-- =====================================================================
-- ÍNDICES DE PERFORMANCE PARA SISTEMA DE LEMBRETES
-- =====================================================================

-- Índice composto para consultas de notificação ativas
-- Usado em: consultas para buscar lembretes que precisam ser enviados
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_active_scheduled 
ON reminders (is_active, next_scheduled_at) 
WHERE is_active = true;

-- Índice para consultas por usuário e entidade
-- Usado em: buscar lembretes específicos de uma tarefa/hábito
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_user_entity 
ON reminders (user_id, entity_id, entity_type, is_active);

-- Índice para lembretes de intervalo
-- Usado em: processar lembretes com intervalos configurados
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_interval_enabled 
ON reminders (interval_enabled, is_active, next_scheduled_at) 
WHERE interval_enabled = true;

-- Índice para sub-tipos de lembretes (prepare, urgent, etc.)
-- Usado em: lembretes automáticos de compromissos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_subtype 
ON reminders (sub_type, entity_id, is_active) 
WHERE sub_type IS NOT NULL;

-- Índice para limpeza automática por data de criação
-- Usado em: operações de limpeza e manutenção
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_created_at 
ON reminders (created_at, is_active);

-- Índice para lembretes por tipo (scheduled, recurring, before_due)
-- Usado em: filtros e consultas específicas por tipo
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_type_active 
ON reminders (type, is_active, next_scheduled_at);

-- Índice para parent_reminder_id (hierarquia de lembretes)
-- Usado em: buscar lembretes filhos quando deletar um pai
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reminders_parent_id 
ON reminders (parent_reminder_id) 
WHERE parent_reminder_id IS NOT NULL;

-- =====================================================================
-- COMENTÁRIOS E EXPLICAÇÕES
-- =====================================================================

-- 1. idx_reminders_active_scheduled
--    - Usado na consulta mais crítica do sistema
--    - WHERE is_active = true AND next_scheduled_at <= NOW()
--    - Filtro parcial otimiza espaço

-- 2. idx_reminders_user_entity  
--    - Usado em TaskDetailClient e HabitDetailClient
--    - WHERE user_id = ? AND entity_id = ? AND entity_type = ?
--    - Essencial para prevenção de IDOR

-- 3. idx_reminders_interval_enabled
--    - Específico para lembretes de intervalo
--    - Filtro parcial reduz tamanho do índice
--    - Usado no processamento de intervalos

-- 4. idx_reminders_subtype
--    - Para lembretes automáticos (prepare/urgent)
--    - Usado na atualização/remoção de compromissos
--    - Filtro parcial para sub_type NOT NULL

-- 5. idx_reminders_created_at
--    - Para operações de limpeza e manutenção
--    - Usado no ReminderCleanupService
--    - Permite limpeza eficiente de dados antigos

-- 6. idx_reminders_type_active
--    - Para consultas específicas por tipo
--    - Usado em filtros da API
--    - Otimiza ordenação por next_scheduled_at

-- 7. idx_reminders_parent_id
--    - Para hierarquia de lembretes pai-filho
--    - Usado na função deleteReminderAndChildren
--    - Filtro parcial para apenas registros com pai

-- =====================================================================
-- MONITORAMENTO DOS ÍNDICES
-- =====================================================================

-- Query para verificar uso dos índices:
-- SELECT 
--   schemaname,
--   tablename,
--   indexname,
--   idx_tup_read,
--   idx_tup_fetch
-- FROM pg_stat_user_indexes 
-- WHERE tablename = 'reminders'
-- ORDER BY idx_tup_read DESC;

-- Query para verificar tamanho dos índices:
-- SELECT 
--   indexname,
--   pg_size_pretty(pg_relation_size(indexname::regclass)) as size
-- FROM pg_indexes 
-- WHERE tablename = 'reminders'
-- ORDER BY pg_relation_size(indexname::regclass) DESC;