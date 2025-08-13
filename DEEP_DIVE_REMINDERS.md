# Deep Dive: Sistema de Lembretes e Agendamento

Este documento detalha todos os componentes e a lógica envolvidos no ciclo de vida de um lembrete no Gerenciador_Task.

## 1. Criação e Agendamento de um Lembrete Simples

Esta tabela mapeia o fluxo quando um usuário cria um novo lembrete para uma tarefa.

| Camada  | Arquivo                               | Função/Middleware Principal | Descrição da Responsabilidade                                      |
| :------ | :------------------------------------ | :-------------------------- | :----------------------------------------------------------------- |
| Rota    | `backend/src/routes/reminders.ts`     | `router.post('/', validate(createReminderSchema), ...)`| Recebe POST para `/api/reminders`, aplica middleware de autenticação, valida dados com schema Zod específico para lembretes e direciona para controller |
| Controle| `backend/src/controllers/remindersController.ts` | `createReminder()`| Extrai dados validados da requisição, verifica autenticação do usuário, chama service de criação, padroniza resposta de sucesso/erro com status 201 |
| Serviço | `backend/src/services/reminderService.ts` | `createReminder()`| Aplica rate limiting (100 lembretes/usuário, 5 por entidade), valida dados específicos por tipo, calcula `nextScheduledAt` baseado no tipo (scheduled/recurring/before_due), salva no DB via Prisma com timestamps |
| Frontend| `src/hooks/api/useReminders.ts` | `useCreateReminder()`| Hook React Query para mutação de criação, invalida cache de lembretes após sucesso, atualiza queries relacionadas de tasks/habits, trata erros específicos de lembretes |
| UI      | `src/components/reminders/ReminderPicker.tsx`  | `handleAddReminder()`| Componente picker que captura tipo, horário, notificações, valida formulário local, constrói objeto CreateReminderData e chama hook de mutação |

## 2. O Agendador (Scheduler) - Como Lembretes São Disparados

Esta seção explica o processo em segundo plano que verifica e dispara os lembretes.

| Componente          | Arquivo                                 | Função Principal       | Descrição da Responsabilidade                                      |
| :------------------ | :-------------------------------------- | :--------------------- | :----------------------------------------------------------------- |
| Cron Job            | `backend/src/services/reminderScheduler.ts`| `start()` / `processReminders()`| Inicializa cron job com padrão `*/1 * * * *` (a cada minuto), gerencia singleton, controla timezone América/São_Paulo, previne execuções simultâneas com flag `isProcessing` |
| Busca de Lembretes  | `backend/src/services/reminderService.ts`| `getActiveReminders()`| Consulta DB para lembretes onde `isActive=true` e `nextScheduledAt <= now`, filtra usuários com notificações habilitadas, inclui dados do usuário e configurações para processamento |
| Processamento em Lote| `backend/src/services/reminderScheduler.ts`| `processReminders()` (método privado)| Processa em batches de 50 lembretes, executa `notificationService.sendReminderNotification()` para cada um, marca como enviado via `markReminderAsSent()`, coleta estatísticas de sucesso/erro, aplica timeout de 30s |

## 3. Fluxo de Envio da Notificação

Esta tabela mostra o que acontece após o agendador encontrar um lembrete para enviar.

| Serviço                   | Arquivo                               | Função Principal          | Descrição da Responsabilidade                                      |
| :------------------------ | :------------------------------------ | :------------------------ | :----------------------------------------------------------------- |
| Serviço de Notificação    | `backend/src/services/notificationService.ts` | `sendReminderNotification()`| Busca dados do usuário e da entidade (task/habit), gera título e mensagem baseados no tipo de lembrete, cria payloads para cada tipo de notificação configurado, chama serviços específicos |
| Serviço de Push           | `backend/src/services/notificationService.ts` | `PushNotificationService.send()` | Configura web-push com chaves VAPID, busca assinaturas ativas do usuário, envia via `webpush.sendNotification()` com payload JSON, trata erros 410 (endpoint inválido), atualiza timestamps |
| Busca de Assinaturas      | `backend/src/services/pushSubscriptionService.ts`| `getActivePushSubscriptions()`| Consulta DB por assinaturas onde `userId=X` e `isActive=true`, retorna endpoints com chaves p256dh e auth necessárias para web-push, filtra assinaturas válidas |

## 4. Lógica de Lembretes Especiais

Descreva a lógica específica para os tipos de lembretes mais complexos.

### 4.1. Tarefas Recorrentes e Hábitos
* **Arquivo(s) Chave:** 
  - `backend/src/services/reminderService.ts` - funções `createRecurringReminders()` e `createHabitReminders()`
  - `backend/src/services/reminderCalculator.ts` - classe `ReminderCalculator` com métodos de cálculo
* **Lógica Principal:** 
  - **Criação**: Cria lembrete principal (`subType: 'main'`) + lembrete de intervalo opcional (`subType: 'interval'`) se `intervalEnabled=true`
  - **Cálculo de nextScheduledAt**: Usa `calculateNextScheduledDate()` para encontrar próximo dia da semana válido baseado em `daysOfWeek[]`
  - **Recálculo pós-envio**: Em `markReminderAsSent()`, recalcula próxima ocorrência considerando dias da semana configurados, mantém horário (`scheduledTime`) mas avança para próximo dia válido
  - **Intervalos**: Se habilitado, calcula slots usando `calculateIntervalSlots()` com limite de segurança (500 lembretes estimados), cria lembrete representativo com dados de intervalo

### 4.2. Lembretes de Compromisso (Automáticos)
* **Arquivo(s) Chave:** 
  - `backend/src/services/reminderService.ts` - função `createAppointmentReminders()`
  - `backend/src/services/reminderCalculator.ts` - método `calculateAppointmentReminders()`
* **Lógica Principal:** 
  - **Cálculo duplo**: Cria 2 lembretes automáticos baseados no horário do compromisso e tempo de preparação
  - **Lembrete "Prepare-se"**: `compromisso - (2 * preparationTime + 10min)`, tipo `before_due` com `subType: 'prepare'`, prioridade normal
  - **Lembrete "Ultra Urgente"**: `compromisso - (2 * preparationTime)`, tipo `before_due` com `subType: 'urgent'`, prioridade alta (`priority: 'high'`)
  - **Integração**: Vinculado à tarefa do tipo compromisso, utiliza `appointmentTime` da tarefa para cálculos, notificações automáticas via push apenas

## 5. Tipos de Lembretes e Suas Características

### 5.1. Lembrete Scheduled (Horário Fixo)
| Característica | Valor/Comportamento |
| :------------- | :------------------ |
| **Tipo** | `type: 'scheduled'` |
| **Campos obrigatórios** | `scheduledTime` (formato HH:MM) |
| **Recorrência** | Diária no mesmo horário |
| **Cálculo nextScheduledAt** | Se horário já passou hoje, agenda para amanhã no mesmo horário |
| **Recálculo pós-envio** | Soma +1 dia mantendo horário fixo |
| **Uso típico** | Lembretes diários como "tomar vitamina às 8h" |

### 5.2. Lembrete Recurring (Dias Específicos)
| Característica | Valor/Comportamento |
| :------------- | :------------------ |
| **Tipo** | `type: 'recurring'` |
| **Campos obrigatórios** | `daysOfWeek[]` (array de 0-6), `scheduledTime` |
| **Recorrência** | Apenas nos dias da semana especificados |
| **Cálculo nextScheduledAt** | Busca próximo dia válido no array `daysOfWeek` |
| **Recálculo pós-envio** | Encontra próximo dia da semana no array, pode ser na próxima semana |
| **Uso típico** | Hábitos como "exercitar seg/qua/sex às 18h" |

### 5.3. Lembrete Before Due (Antes do Prazo)
| Característica | Valor/Comportamento |
| :------------- | :------------------ |
| **Tipo** | `type: 'before_due'` |
| **Campos obrigatórios** | `minutesBefore` (número inteiro), `entityId` da tarefa |
| **Recorrência** | Uma única vez baseada na `dueDate` da tarefa |
| **Cálculo nextScheduledAt** | `task.dueDate - minutesBefore`, busca no DB a data de vencimento |
| **Recálculo pós-envio** | Não recalcula, é um lembrete de uso único |
| **Uso típico** | "Reunião em 30 minutos", "Entrega do projeto em 2 horas" |

## 6. Sistema de Rate Limiting e Segurança

### 6.1. Limites Implementados
| Tipo de Limite | Valor | Arquivo | Função |
| :------------- | :---- | :------ | :----- |
| **Por usuário** | 100 lembretes ativos | `reminderService.ts` | `createReminder()` linha 70-82 |
| **Por entidade** | 5 lembretes por task/habit | `reminderService.ts` | `createReminder()` linha 96-111 |
| **Intervalos estimados** | 500 lembretes máx. | `reminderService.ts` | `createRecurringReminders()` linha 526-528 |
| **Batch processing** | 50 lembretes/batch | `reminderScheduler.ts` | `config.batchSize` linha 38 |
| **Timeout scheduler** | 30 segundos | `reminderScheduler.ts` | `config.timeoutMs` linha 39 |

### 6.2. Logs de Segurança
- **Criação de lembretes**: Log com userId, tipo, e configurações
- **Rate limiting**: Logs quando limites são atingidos com detalhes de bloqueio
- **Processamento scheduler**: Estatísticas de sucesso/erro por execução
- **Push notifications**: Logs de endpoints inválidos (410) e desativação automática
- **Limpeza automática**: Remoção de assinaturas push inativas após 30 dias

## 7. Arquitetura de Notificações Push

### 7.1. Configuração VAPID
| Componente | Arquivo | Descrição |
| :--------- | :------ | :-------- |
| **Chaves VAPID** | `backend/src/config/vapid.ts` | Chaves públicas/privadas para autenticação web-push |
| **Service Worker** | `public/sw.js` | Recebe e exibe notificações push no cliente |
| **Registro** | `src/hooks/useServiceWorker.ts` | Registra service worker e obtém assinatura push |

### 7.2. Fluxo de Assinatura Push
1. **Cliente**: Service worker registrado automaticamente no primeiro acesso
2. **Permissão**: Usuário concede permissão para notificações via browser
3. **Assinatura**: Browser gera endpoint único com chaves p256dh/auth
4. **Armazenamento**: Assinatura salva no DB via `pushSubscriptionService.createPushSubscription()`
5. **Validação**: Sistema valida endpoint antes de cada envio, desativa se inválido (410)

## 8. Monitoramento e Health Checks

### 8.1. Métricas do Scheduler
```typescript
interface SchedulerStats {
  totalProcessed: number;    // Total de lembretes processados
  successCount: number;      // Enviados com sucesso  
  errorCount: number;        // Falhas no envio
  lastRun: string | null;    // Última execução
  nextRun: string | null;    // Próxima execução estimada
  isRunning: boolean;        // Status atual
}
```

### 8.2. Health Check Endpoints
- **Status geral**: `schedulerHealthCheck.getStatus()` - estado do scheduler + próximos lembretes
- **Métricas**: `schedulerHealthCheck.getMetrics()` - taxa de sucesso e estatísticas
- **Lembretes futuros**: `getUpcomingReminders(limit)` - debug dos próximos agendamentos
- **Execução manual**: `runOnce()` - força execução para testes

## 9. Tratamento de Erros e Recuperação

### 9.1. Falhas de Envio
- **Retry automático**: 3 tentativas com delay de 5 segundos entre cada uma
- **Endpoints inválidos**: Status 410 desativa assinatura push automaticamente
- **Timeout**: Batch processamento com timeout de 30s, logs de warning
- **Rate limiting**: Bloqueia criação mas não interrompe envios existentes

### 9.2. Recuperação de Estado
- **Scheduler restart**: Método `restart()` para recarregar configurações
- **Limpeza de assinaturas**: Remoção automática de registros antigos/inativos
- **Recálculo de horários**: Se `nextScheduledAt` for nulo, recalcula na próxima execução
- **Estado consistente**: Transações do DB garantem integridade entre criação e agendamento

## 10. Performance e Otimizações

### 10.1. Índices de Database
- **Busca ativa**: Índice composto em `(isActive, nextScheduledAt)` para query do scheduler
- **Por usuário**: Índice em `userId` para queries de interface
- **Por entidade**: Índice em `(entityId, entityType)` para lembretes relacionados

### 10.2. Cache e Sincronização
- **React Query**: Cache inteligente com invalidação após mutações
- **Stale time**: 5 minutos para dados de lembretes (pouco voláteis)
- **Otimistic updates**: Atualização imediata da UI antes da confirmação do servidor
- **Background sync**: Scheduler independente da interface, executa mesmo sem usuários online