# Deep Dive: Motor de Gamificação

Este documento detalha as regras de negócio e os fluxos de dados do sistema de energia, conquistas e recompensas do Gerenciador_Task.

## 1. Visão Geral dos Conceitos

* **Energia:** Sistema central de gamificação que funciona como um orçamento diário de produtividade. Cada usuário possui um `dailyEnergyBudget` (padrão: 12 pontos) que limita quantas tarefas pode planejar por dia. Tarefas consomem energia baseado em sua complexidade (1, 3 ou 5 pontos). O sistema previne sobrecarga e incentiva foco nas atividades mais importantes.

* **Conquistas (Achievements):** Sistema automático de reconhecimento que recompensa marcos de produtividade. Existem 4 tipos principais: `task_completion` (bronze/prata/ouro baseado na energia da tarefa), `project_completion` (finalizar projetos), `daily_master` (atingir orçamento diário de energia) e `weekly_legend` (maestria em todos os 7 dias da semana). Cada conquista é única por evento e armazena metadados contextuais.

* **Recompensas:** Interface visual que exibe conquistas, estatísticas de progresso, streaks de maestria diária e histórico de 30 dias. Inclui métricas como streak atual vs. melhor streak, total de conquistas por tipo, e análise de padrões de produtividade através do `DailyProgress` tracking.

## 2. O Sistema de Energia

Esta seção detalha como a energia do usuário é gerenciada.

| Ação do Usuário               | Arquivo/Serviço Responsável           | Lógica Aplicada                                                                    |
| :------------------------------ | :------------------------------------ | :--------------------------------------------------------------------------------- |
| **Criação de Tarefa** | `backend/src/services/taskService.ts` | Tarefa criada com `energyPoints` (1, 3 ou 5) mas não consome energia até ser planejada. Energia é validada apenas no momento de `plannedForToday = true` |
| **Planejar Tarefa para Hoje** | `taskService.ts` linha 400-408 | Valida se `currentEnergyUsed + taskEnergyPoints <= dailyBudget`. Busca total de energia já consumida por tarefas planejadas hoje, rejeita se exceder limite, define `plannedDate = today` |
| **Completar uma Tarefa** | `taskService.ts` linha 715-735 | Incrementa `DailyEnergyLog.energyUsed` com `task.energyPoints`, decrementa `energyRemaining`, incrementa `tasksCompleted`. Mantém `plannedForToday = true` para preservar controle de orçamento |
| **Reabastecimento de Energia** | Job diário (processamento automático) | Energia é "resetada" indiretamente através do cálculo diário - cada novo dia permite o uso total do `dailyEnergyBudget`. Não há reset explícito, mas queries filtram por data atual |

## 3. O Motor de Conquistas (Achievements)

Esta seção explica como as conquistas são verificadas e desbloqueadas.

| Gatilho (Trigger)                 | Serviço que Dispara o Evento         | Serviço que Avalia a Conquista                 | Exemplo de Regra de Negócio Avaliada                                                 |
| :-------------------------------- | :----------------------------------- | :--------------------------------------------- | :----------------------------------------------------------------------------------- |
| **Usuário Completa uma Tarefa** | `taskService.completeTask()` linha 741 | `achievementService.processTaskCompletion()` | Cria conquista baseada em `energyPoints`: 1=bronze, 3=prata, 5=ouro. Armazena `taskDescription` e `energyPoints` nos metadados |
| **Usuário Finaliza Projeto** | `projectService.ts` (implícito) | `achievementService.processProjectCompletion()` | Verifica se projeto está completo, conta tarefas finalizadas no projeto, cria conquista `project_completion` com `projectName` e `tasksInProject` |
| **Usuário Atinge Orçamento Diário** | `taskService.completeTask()` linha 812 | `achievementService.checkDailyMastery()` | Compara `completedEnergyPoints >= energyBudget`, verifica se `achievedMastery = false`, marca como `true` e cria conquista `daily_master` |
| **Usuário Completa Semana Perfeita** | `taskService.completeTask()` linha 820 (domingos) | `achievementService.checkWeeklyLegend()` | Busca 7 dias consecutivos com `achievedMastery = true`, verifica se não existe conquista `weekly_legend` para a semana, cria com `totalTasksWeek` |
| **Usuário Completa um Hábito** | `habitService.ts` (implícito) | `achievementService.processHabitCompletion()` | Atualmente não gera conquistas diretas, mas contribui para verificação de `daily_mastery` através de atualização de progresso diário |

## 4. Sistema de Progresso Diário (DailyProgress)

O tracking de progresso é fundamental para as conquistas e métricas de gamificação.

| Campo | Propósito | Como é Calculado | Uso nas Conquistas |
| :---- | :-------- | :--------------- | :----------------- |
| **plannedTasks** | Total de tarefas planejadas para o dia | Conta tarefas com `plannedForToday = true` | Usado para calcular taxa de conclusão |
| **completedTasks** | Tarefas finalizadas no dia | Conta tarefas com `status = completed` e `completedAt` na data | Usado em `daily_master` e `weekly_legend` |
| **plannedEnergyPoints** | Energia total planejada | Soma `energyPoints` de todas as tarefas com `plannedForToday = true` | Comparado com orçamento para validações |
| **completedEnergyPoints** | Energia consumida efetivamente | Soma `energyPoints` de tarefas completadas no dia | Usado em `checkDailyMastery` para validar se atingiu orçamento |
| **achievedMastery** | Flag de maestria diária | `true` quando `completedEnergyPoints >= dailyEnergyBudget` | Usado em `checkWeeklyLegend` para semanas perfeitas |

## 5. Exemplo de Fluxo Integrado: "Completar a Primeira Tarefa do Dia"

Descreva passo a passo a cadeia de eventos que ocorre quando o usuário completa sua primeira tarefa do dia.

1. **Ação na UI:** O usuário clica em "Completar Tarefa" no frontend. O hook `useCompleteTask()` é chamado, fazendo mutação via React Query.

2. **Chamada de API:** Uma requisição `POST` é enviada para `/api/tasks/{taskId}/complete` através do `tasksController.completeTask()`.

3. **Lógica da Tarefa:** O `taskService.completeTask()` é executado, validando se tarefa existe e não está deletada, atualizando `status = 'completed'` e `completedAt = now()`.

4. **Atualização de Energia:** Cria/atualiza `DailyEnergyLog` incrementando `energyUsed` com `task.energyPoints`, decrementando `energyRemaining`, incrementando `tasksCompleted` (linhas 715-735).

5. **Disparo do Evento de Conquista:** Chama `AchievementService.processTaskCompletion(userId, task)` criando conquista baseada em energia: bronze(1pt), prata(3pts) ou ouro(5pts) (linha 741).

6. **Atualização de Progresso Diário:** Conta tarefas planejadas/completadas hoje, calcula pontos de energia, chama `AchievementService.updateDailyProgress()` com estatísticas atualizadas (linhas 802-809).

7. **Verificação de Maestria:** Executa `AchievementService.checkDailyMastery()` comparando `completedEnergyPoints` com `dailyEnergyBudget`. Se atingiu orçamento e `achievedMastery = false`, marca como `true` e cria conquista `daily_master` (linha 812).

8. **Verificação Semanal:** Se for domingo (linha 817), chama `checkWeeklyLegend()` verificando se os últimos 7 dias têm `achievedMastery = true`. Se sim e não existe conquista para a semana, cria `weekly_legend`.

9. **Retorno Enriquecido:** Retorna `TaskResponse` enriquecida com array `newAchievements[]` contendo todas as conquistas desbloqueadas nesta operação (linha 830-833).

10. **Notificação/Feedback:** Frontend recebe resposta com `newAchievements`, React Query invalida cache, UI exibe toast de "Nova Conquista Desbloqueada!" e atualiza página de recompensas automaticamente.

## 6. Regras de Negócio Detalhadas

### 6.1. Validações de Energia
- **Planejamento**: Usuário só pode planejar tarefas se `soma(energyPoints_tarefas_planejadas) + nova_tarefa.energyPoints <= dailyEnergyBudget`
- **Orçamento Padrão**: Novos usuários começam com `dailyEnergyBudget = 12`, usuários Google com 15
- **Energia Mínima**: Tarefas devem ter 1, 3 ou 5 pontos de energia (validado por schema Zod)
- **Persistência**: Energia é controlada por data, permitindo planejamento antecipado para datas futuras

### 6.2. Tipos de Conquistas
- **task_completion**: Criada a cada tarefa completa, subtipo baseado na energia (bronze/prata/ouro)
- **project_completion**: Uma por projeto finalizado, inclui contagem de tarefas do projeto
- **daily_master**: Uma por dia quando `completedEnergyPoints >= dailyEnergyBudget`
- **weekly_legend**: Uma por semana quando todos os 7 dias têm `achievedMastery = true`

### 6.3. Metadados das Conquistas
```json
{
  "task_completion": {
    "energyPoints": 3,
    "taskDescription": "Implementar sistema de login"
  },
  "daily_master": {
    "tasksCompletedToday": 4,
    "dateCompleted": "2025-01-15"
  },
  "weekly_legend": {
    "weekStartDate": "2025-01-12",
    "weekEndDate": "2025-01-18", 
    "totalTasksWeek": 28,
    "consecutiveDays": 7
  }
}
```

## 7. Integrações com Outros Sistemas

### 7.1. Sistema de Hábitos
- **Contribuição**: Hábitos completados podem contribuir para `daily_master` através de `processHabitCompletion()`
- **Progresso**: Atualiza `DailyProgress` mas não gera conquistas específicas atualmente
- **Streak**: Sistema independente de streak por hábito, não integrado com conquistas gerais

### 7.2. Sistema de Lembretes  
- **Independente**: Sistema de lembretes não interfere diretamente na gamificação
- **Complementar**: Lembretes ajudam usuário a completar tarefas, indiretamente gerando mais conquistas

### 7.3. Tarefas Recorrentes
- **Energia**: Cada instância de tarefa recorrente consome energia normalmente
- **Conquistas**: Cada conclusão de instância recorrente gera conquista `task_completion`
- **Progresso**: Contribui para métricas diárias normalmente

## 8. Performance e Otimizações

### 8.1. Índices de Database
- **Achievements**: Índices em `(userId, type)` e `(userId, earnedAt)` para consultas rápidas
- **DailyProgress**: Chave única em `(userId, date)` para upserts eficientes
- **Tasks**: Queries otimizadas para `plannedForToday` e `completedAt` com filtros de data

### 8.2. Caching
- **Frontend**: React Query cacheia conquistas recentes por 5 minutos
- **Agregações**: Estatísticas de conquista são agregadas em tempo real para página de recompensas
- **Progresso**: `DailyProgress` usa upsert para evitar duplicações e melhorar performance

### 8.3. Rate Limiting
- **Conquistas**: Uma conquista por evento (unicidade garantida por lógica de negócio)
- **Progresso**: Atualizações de `DailyProgress` são idempotentes e seguras para múltiplas chamadas
- **Validações**: Validações de energia acontecem antes de operações custosas no DB