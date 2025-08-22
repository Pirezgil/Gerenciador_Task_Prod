-- ========================================
-- BACKUP MANUAL DO BANCO DE DADOS
-- Sistema: Gerenciador de Tarefas
-- Data: 2025-08-20
-- ========================================

-- Este arquivo pode ser usado como template para backup manual
-- Execute estas queries no seu cliente PostgreSQL (pgAdmin, DBeaver, etc.)

-- 1. BACKUP DA ESTRUTURA DAS TABELAS
-- Execute no banco de origem para obter a estrutura

-- Para obter o schema completo:
-- \d+ (no psql) ou use a interface gráfica do seu cliente

-- 2. BACKUP DOS DADOS
-- Execute estas queries para exportar os dados:

-- Usuários
COPY users TO 'C:\temp\users_backup.csv' DELIMITER ',' CSV HEADER;

-- Configurações de usuário
COPY user_settings TO 'C:\temp\user_settings_backup.csv' DELIMITER ',' CSV HEADER;

-- Projetos
COPY projects TO 'C:\temp\projects_backup.csv' DELIMITER ',' CSV HEADER;

-- Tarefas
COPY tasks TO 'C:\temp\tasks_backup.csv' DELIMITER ',' CSV HEADER;

-- Recorrência de tarefas
COPY task_recurrence TO 'C:\temp\task_recurrence_backup.csv' DELIMITER ',' CSV HEADER;

-- Compromissos
COPY task_appointments TO 'C:\temp\task_appointments_backup.csv' DELIMITER ',' CSV HEADER;

-- Comentários de tarefas
COPY task_comments TO 'C:\temp\task_comments_backup.csv' DELIMITER ',' CSV HEADER;

-- Anexos
COPY task_attachments TO 'C:\temp\task_attachments_backup.csv' DELIMITER ',' CSV HEADER;

-- Histórico de tarefas
COPY task_history TO 'C:\temp\task_history_backup.csv' DELIMITER ',' CSV HEADER;

-- Notas
COPY notes TO 'C:\temp\notes_backup.csv' DELIMITER ',' CSV HEADER;

-- Layout do sandbox
COPY sandbox_layout TO 'C:\temp\sandbox_layout_backup.csv' DELIMITER ',' CSV HEADER;

-- Hábitos
COPY habits TO 'C:\temp\habits_backup.csv' DELIMITER ',' CSV HEADER;

-- Frequência de hábitos
COPY habit_frequency TO 'C:\temp\habit_frequency_backup.csv' DELIMITER ',' CSV HEADER;

-- Conclusões de hábitos
COPY habit_completions TO 'C:\temp\habit_completions_backup.csv' DELIMITER ',' CSV HEADER;

-- Comentários de hábitos
COPY habit_comments TO 'C:\temp\habit_comments_backup.csv' DELIMITER ',' CSV HEADER;

-- Configurações de tema
COPY theme_configs TO 'C:\temp\theme_configs_backup.csv' DELIMITER ',' CSV HEADER;

-- Logs diários de energia
COPY daily_energy_logs TO 'C:\temp\daily_energy_logs_backup.csv' DELIMITER ',' CSV HEADER;

-- Animações de dopamina
COPY dopamine_animations TO 'C:\temp\dopamine_animations_backup.csv' DELIMITER ',' CSV HEADER;

-- Conquistas
COPY achievements TO 'C:\temp\achievements_backup.csv' DELIMITER ',' CSV HEADER;

-- Progresso diário
COPY daily_progress TO 'C:\temp\daily_progress_backup.csv' DELIMITER ',' CSV HEADER;

-- Sequências de hábitos
COPY habit_streaks TO 'C:\temp\habit_streaks_backup.csv' DELIMITER ',' CSV HEADER;

-- Lembretes
COPY reminders TO 'C:\temp\reminders_backup.csv' DELIMITER ',' CSV HEADER;

-- Subscrições push
COPY push_subscriptions TO 'C:\temp\push_subscriptions_backup.csv' DELIMITER ',' CSV HEADER;

-- Autenticação sandbox
COPY sandbox_auth TO 'C:\temp\sandbox_auth_backup.csv' DELIMITER ',' CSV HEADER;

-- Logs de segurança
COPY security_logs TO 'C:\temp\security_logs_backup.csv' DELIMITER ',' CSV HEADER;

-- ========================================
-- COMANDOS DE RESTAURAÇÃO
-- ========================================

-- Para restaurar os dados no novo banco:
-- 1. Primeiro crie a estrutura das tabelas usando o Prisma:
--    npx prisma migrate deploy
--    
-- 2. Depois importe os dados:

/*
COPY users FROM 'C:\temp\users_backup.csv' DELIMITER ',' CSV HEADER;
COPY user_settings FROM 'C:\temp\user_settings_backup.csv' DELIMITER ',' CSV HEADER;
COPY projects FROM 'C:\temp\projects_backup.csv' DELIMITER ',' CSV HEADER;
COPY tasks FROM 'C:\temp\tasks_backup.csv' DELIMITER ',' CSV HEADER;
COPY task_recurrence FROM 'C:\temp\task_recurrence_backup.csv' DELIMITER ',' CSV HEADER;
COPY task_appointments FROM 'C:\temp\task_appointments_backup.csv' DELIMITER ',' CSV HEADER;
COPY task_comments FROM 'C:\temp\task_comments_backup.csv' DELIMITER ',' CSV HEADER;
COPY task_attachments FROM 'C:\temp\task_attachments_backup.csv' DELIMITER ',' CSV HEADER;
COPY task_history FROM 'C:\temp\task_history_backup.csv' DELIMITER ',' CSV HEADER;
COPY notes FROM 'C:\temp\notes_backup.csv' DELIMITER ',' CSV HEADER;
COPY sandbox_layout FROM 'C:\temp\sandbox_layout_backup.csv' DELIMITER ',' CSV HEADER;
COPY habits FROM 'C:\temp\habits_backup.csv' DELIMITER ',' CSV HEADER;
COPY habit_frequency FROM 'C:\temp\habit_frequency_backup.csv' DELIMITER ',' CSV HEADER;
COPY habit_completions FROM 'C:\temp\habit_completions_backup.csv' DELIMITER ',' CSV HEADER;
COPY habit_comments FROM 'C:\temp\habit_comments_backup.csv' DELIMITER ',' CSV HEADER;
COPY theme_configs FROM 'C:\temp\theme_configs_backup.csv' DELIMITER ',' CSV HEADER;
COPY daily_energy_logs FROM 'C:\temp\daily_energy_logs_backup.csv' DELIMITER ',' CSV HEADER;
COPY dopamine_animations FROM 'C:\temp\dopamine_animations_backup.csv' DELIMITER ',' CSV HEADER;
COPY achievements FROM 'C:\temp\achievements_backup.csv' DELIMITER ',' CSV HEADER;
COPY daily_progress FROM 'C:\temp\daily_progress_backup.csv' DELIMITER ',' CSV HEADER;
COPY habit_streaks FROM 'C:\temp\habit_streaks_backup.csv' DELIMITER ',' CSV HEADER;
COPY reminders FROM 'C:\temp\reminders_backup.csv' DELIMITER ',' CSV HEADER;
COPY push_subscriptions FROM 'C:\temp\push_subscriptions_backup.csv' DELIMITER ',' CSV HEADER;
COPY sandbox_auth FROM 'C:\temp\sandbox_auth_backup.csv' DELIMITER ',' CSV HEADER;
COPY security_logs FROM 'C:\temp\security_logs_backup.csv' DELIMITER ',' CSV HEADER;
*/

-- IMPORTANTE: 
-- - Ajuste os caminhos dos arquivos conforme necessário
-- - Execute os comandos na ordem correta respeitando as dependências
-- - Faça backup antes de restaurar
-- - Teste em ambiente de desenvolvimento primeiro