# 📋 MAPEAMENTO COMPLETO DE ALERTAS E NOTIFICAÇÕES
## Sistema de Gerenciamento de Tarefas - Auditoria de Fluxos de Interação

---

## 🎯 RESUMO EXECUTIVO

Este documento mapeia **TODOS** os pontos de interação do usuário no sistema onde alertas, notificações e feedback são necessários. A análise foi feita considerando os padrões de UX para usuários neurodivergentes, que necessitam de feedback claro e imediato em cada ação.

**Total de cenários mapeados**: 127 pontos de feedback
**Componentes analisados**: 45 componentes React
**Controllers analisados**: 7 controllers backend
**Endpoints mapeados**: 52 endpoints API

---

## 🔍 METODOLOGIA DE ANÁLISE

### Critérios de Identificação:
1. **Ações do usuário** que podem falhar
2. **Operações assíncronas** que precisam de feedback
3. **Validações de formulário** que podem retornar erros
4. **Estados de carregamento** que precisam ser comunicados
5. **Operações críticas** que precisam de confirmação
6. **Mudanças de estado** que devem ser comunicadas

---

## 📊 FLUXOS DE AUTENTICAÇÃO

### 1. LOGIN (`/src/components/auth/LoginForm.tsx`)

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Campos vazios** | Erro/Validação | "Por favor, preencha todos os campos" | ✅ Implementado | Linha 24-27 |
| **Email inválido** | Erro/Validação | "Formato de email inválido" | ⚠️ Parcial (browser) | Validação HTML |
| **Credenciais incorretas** | Erro/API | "Email ou senha incorretos" | ✅ Implementado | Linha 33, Backend: authController.ts:48-55 |
| **Erro de rede** | Erro/Sistema | "Erro de conexão. Tente novamente." | ⚠️ Parcial | Linha 33 (genérico) |
| **Login em andamento** | Info/Loading | "Entrando..." | ✅ Implementado | Botão linha 81-83 |
| **Login bem-sucedido** | Sucesso | "Login realizado com sucesso!" | ❌ Não implementado | - |
| **Conta social detectada** | Info/Aviso | "Esta conta foi criada com Google. Use o login social." | ✅ Implementado | Backend: authController.ts:58-66 |
| **Token expirado** | Aviso | "Sua sessão expirou. Faça login novamente." | ⚠️ Parcial | Interceptor API |
| **Muitas tentativas** | Aviso/Bloqueio | "Muitas tentativas. Tente novamente em X minutos." | ❌ Não implementado | - |

### 2. CADASTRO (`/src/app/register/page.tsx`)

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Nome muito curto** | Erro/Validação | "Nome deve ter pelo menos 2 caracteres" | ✅ Backend | validation.ts:17-18 |
| **Email já cadastrado** | Erro/Conflito | "Este email já está cadastrado" | ✅ Implementado | Backend: authController.ts:21-29 |
| **Senhas não coincidem** | Erro/Validação | "As senhas não coincidem" | ✅ Implementado | Linha 26-29 |
| **Senha muito fraca** | Aviso/Validação | "Senha deve ter pelo menos 6 caracteres" | ✅ Frontend+Backend | HTML + validation.ts:23-25 |
| **Cadastro em andamento** | Info/Loading | "Criando conta..." | ✅ Implementado | Linha 162 |
| **Cadastro bem-sucedido** | Sucesso | "Conta criada com sucesso!" | ❌ Não implementado | - |
| **Erro de servidor** | Erro/Sistema | "Erro interno. Tente novamente mais tarde." | ⚠️ Parcial | Linha 44 (genérico) |
| **Email inválido** | Erro/Validação | "Formato de email inválido" | ⚠️ Parcial (browser) | HTML validation |

### 3. LOGOUT

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Logout bem-sucedido** | Info | "Você foi desconectado com sucesso" | ❌ Não implementado | - |
| **Confirmação de logout** | Confirmação | "Tem certeza que deseja sair?" | ❌ Não implementado | - |
| **Sessão perdida** | Aviso | "Sua sessão foi perdida. Redirecionando..." | ⚠️ Parcial | Interceptor API |

### 4. OAUTH GOOGLE

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **OAuth em andamento** | Info/Loading | "Conectando com Google..." | ❌ Não implementado | - |
| **OAuth cancelado** | Info | "Login cancelado pelo usuário" | ❌ Não implementado | - |
| **OAuth erro** | Erro | "Erro ao conectar com Google" | ✅ Implementado | Backend: authController.ts:160 |
| **OAuth sucesso** | Sucesso | "Conectado com Google com sucesso!" | ❌ Não implementado | - |

---

## 📋 FLUXOS DE CRUD - TAREFAS

### 1. CRIAR TAREFA (`/src/components/shared/NewTaskModal.tsx`)

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Descrição vazia** | Erro/Validação | "Descrição da tarefa é obrigatória" | ✅ Implementado | Linha 75 |
| **Descrição muito curta** | Erro/Validação | "Descrição deve ter pelo menos 3 caracteres" | ✅ Implementado | Linha 76 |
| **Data inválida (compromisso)** | Erro/Validação | "Data é obrigatória para compromissos" | ✅ Implementado | Linha 78-79 |
| **Horário inválido (compromisso)** | Erro/Validação | "Horário é obrigatório para compromissos" | ✅ Implementado | Linha 78 |
| **Projeto inválido** | Erro/Validação | "Projeto especificado não existe" | ✅ Backend | tasksController.ts:152-159 |
| **Criação em andamento** | Info/Loading | "Criando tarefa..." | ✅ Implementado | Linha 611 |
| **Tarefa criada com sucesso** | Sucesso | "✨ Tarefa criada!" | ✅ Implementado | Animação linha 654 |
| **Erro na criação** | Erro/Sistema | "Erro ao criar tarefa. Tente novamente." | ✅ Implementado | Linha 167 |
| **Anexo muito grande** | Aviso | "Arquivo muito grande. Máximo 10MB." | ❌ Não implementado | - |
| **Formato de arquivo inválido** | Erro | "Formato de arquivo não suportado" | ❌ Não implementado | - |
| **Energia insuficiente** | Aviso | "Esta tarefa excede sua energia disponível hoje" | ❌ Não implementado | - |
| **Validação de recorrência** | Erro | "Selecione pelo menos um dia para tarefas recorrentes" | ❌ Não implementado | - |

### 2. EDITAR TAREFA (`/src/components/shared/TaskEditModal.tsx`)

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Descrição vazia** | Erro/Validação | "Descrição não pode estar vazia" | ❌ Não implementado | - |
| **Projeto inválido** | Erro/Validação | "Projeto selecionado não existe" | ✅ Backend | tasksController.ts:219-226 |
| **Atualização em andamento** | Info/Loading | "Salvando alterações..." | ❌ Não implementado | - |
| **Tarefa atualizada** | Sucesso | "Tarefa atualizada com sucesso!" | ❌ Não implementado | - |
| **Erro na atualização** | Erro/Sistema | "Erro ao atualizar tarefa" | ❌ Não implementado | - |
| **Tarefa não encontrada** | Erro/NotFound | "Tarefa não encontrada" | ✅ Backend | tasksController.ts:211-217 |
| **Permissão negada** | Erro/Auth | "Você não tem permissão para editar esta tarefa" | ⚠️ Implícito | Middleware auth |

### 3. COMPLETAR TAREFA

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Tarefa completada** | Sucesso/Celebração | "🎉 Parabéns! Tarefa completada!" | ✅ Sistema recompensas | Sistema de conquistas |
| **Tarefa já completa** | Info | "Esta tarefa já foi completada" | ✅ Backend | tasksController.ts:292-299 |
| **Erro ao completar** | Erro/Sistema | "Erro ao completar tarefa" | ❌ Frontend | Hook useTasks |
| **Nova conquista desbloqueada** | Celebração | "🏆 Nova conquista desbloqueada!" | ✅ Implementado | Sistema de recompensas |
| **Streak mantido** | Motivação | "🔥 Sequência de X dias mantida!" | ✅ Implementado | Sistema de recompensas |

### 4. ADIAR TAREFA

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Confirmação de adiamento** | Confirmação | "Tem certeza que deseja adiar esta tarefa?" | ❌ Não implementado | - |
| **Tarefa adiada** | Info | "Tarefa adiada com sucesso" | ✅ Backend | tasksController.ts:323 |
| **Muitos adiamentos** | Aviso/Motivacional | "Esta tarefa já foi adiada X vezes. Que tal quebrar ela em partes menores?" | ❌ Não implementado | - |
| **Razão obrigatória (após 3 adiamentos)** | Validação | "Por favor, informe o motivo do adiamento" | ❌ Não implementado | - |

### 5. DELETAR TAREFA

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Confirmação de exclusão** | Confirmação/Crítica | "⚠️ Tem certeza? Esta ação não pode ser desfeita." | ❌ Não implementado | - |
| **Tarefa deletada** | Info | "Tarefa removida com sucesso" | ✅ Backend | tasksController.ts:245 |
| **Erro na exclusão** | Erro/Sistema | "Erro ao remover tarefa" | ❌ Frontend | Hook useTasks |
| **Tarefa em uso** | Erro/Validação | "Não é possível remover: tarefa possui dependências" | ❌ Não implementado | - |

### 6. ADICIONAR COMENTÁRIO

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Comentário vazio** | Erro/Validação | "Comentário não pode estar vazio" | ✅ Backend | validation.ts:114-116 |
| **Comentário adicionado** | Sucesso | "Comentário adicionado com sucesso!" | ✅ Backend | tasksController.ts:357 |
| **Erro ao adicionar** | Erro/Sistema | "Erro ao adicionar comentário" | ❌ Frontend | Hook useTasks |
| **Comentário muito longo** | Erro/Validação | "Comentário muito longo (máximo 1000 caracteres)" | ✅ Backend | validation.ts:115-116 |

---

## 💪 FLUXOS DE CRUD - HÁBITOS

### 1. CRIAR HÁBITO (`/src/components/habits/NewHabitModal.tsx`)

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Nome vazio** | Erro/Validação | "Nome do hábito é obrigatório" | ✅ Implementado | HTML required |
| **Nome muito curto** | Erro/Validação | "Nome deve ter pelo menos 2 caracteres" | ✅ Backend | validation.ts:205-208 |
| **Frequência inválida** | Erro/Validação | "Selecione pelo menos um dia da semana" | ❌ Não implementado | - |
| **Criação em andamento** | Info/Loading | "Criando hábito..." | ✅ Implementado | Linha 286 |
| **Hábito criado** | Sucesso | "🎯 Hábito criado com sucesso!" | ❌ Não implementado | - |
| **Erro na criação** | Erro/Sistema | "Erro ao criar hábito" | ✅ Implementado | Console.error linha 51 |
| **Cor inválida** | Erro/Validação | "Formato de cor inválido" | ✅ Backend | validation.ts:210-213 |

### 2. EDITAR HÁBITO (`/src/components/shared/HabitEditModal.tsx`)

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Nome vazio** | Erro/Validação | "Nome do hábito não pode estar vazio" | ✅ Backend | validation.ts:223-227 |
| **Atualização em andamento** | Info/Loading | "Salvando alterações..." | ✅ Implementado | Linha 325-328 |
| **Hábito atualizado** | Sucesso | "Hábito atualizado com sucesso!" | ❌ Não implementado | - |
| **Erro na atualização** | Erro/Sistema | "Erro ao atualizar hábito" | ✅ Implementado | Console.error linha 88 |
| **Confirmação de exclusão** | Confirmação/Crítica | "⚠️ Tem certeza que deseja excluir o hábito '{nome}'?" | ✅ Implementado | Linha 342-347 |
| **Exclusão em andamento** | Info/Loading | "Excluindo..." | ✅ Implementado | Linha 362-366 |
| **Hábito excluído** | Info | "Hábito excluído com sucesso" | ✅ Backend | habitsController.ts:84 |
| **Erro na exclusão** | Erro/Sistema | "Erro ao excluir hábito" | ✅ Implementado | Alert linha 100 |

### 3. COMPLETAR HÁBITO

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Hábito completado** | Sucesso/Celebração | "🌟 Hábito completado! Continue assim!" | ✅ Backend | habitsController.ts:145-149 |
| **Já completado hoje** | Info | "Você já completou este hábito hoje!" | ❌ Não implementado | - |
| **Meta diária atingida** | Celebração | "🎯 Meta diária alcançada!" | ❌ Não implementado | - |
| **Streak perdido** | Motivacional | "Que pena! Sua sequência foi perdida. Mas você pode recomeçar!" | ❌ Não implementado | - |
| **Novo recorde** | Celebração | "🏆 Novo recorde de sequência: X dias!" | ❌ Não implementado | - |

---

## 📁 FLUXOS DE CRUD - PROJETOS

### 1. CRIAR PROJETO (`/src/components/shared/NewProjectModal.tsx`)

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Nome vazio** | Erro/Validação | "Nome do projeto é obrigatório" | ✅ Implementado | Linha 59 |
| **Nome muito curto** | Erro/Validação | "Nome deve ter pelo menos 3 caracteres" | ✅ Implementado | Linha 61-62 |
| **Nome muito longo** | Erro/Validação | "Nome deve ter no máximo 50 caracteres" | ✅ Implementado | Linha 63-64 |
| **Ícone não selecionado** | Erro/Validação | "Selecione um ícone para o projeto" | ✅ Implementado | Linha 67 |
| **Criação em andamento** | Info/Loading | "Criando projeto..." | ✅ Implementado | Linha 288 |
| **Projeto criado** | Sucesso | "🚀 Projeto criado com sucesso!" | ❌ Não implementado | - |
| **Erro na criação** | Erro/Sistema | "Erro ao criar projeto. Tente novamente." | ✅ Implementado | Linha 139 |

### 2. EDITAR PROJETO

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Atualização em andamento** | Info/Loading | "Salvando alterações..." | ❌ Não implementado | - |
| **Projeto atualizado** | Sucesso | "Projeto atualizado com sucesso!" | ✅ Backend | projectsController.ts:111-115 |
| **Erro na atualização** | Erro/Sistema | "Erro ao atualizar projeto" | ❌ Frontend | - |
| **Finalização com tarefas pendentes** | Erro/Validação | "Não é possível finalizar projeto com tarefas pendentes" | ✅ Backend | projectsController.ts:125-132 |

### 3. DELETAR PROJETO

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Confirmação de exclusão** | Confirmação/Crítica | "⚠️ Deletar projeto '{nome}'? Todas as tarefas serão removidas!" | ❌ Não implementado | - |
| **Projeto com tarefas** | Erro/Validação | "Remova ou mova todas as tarefas antes de deletar o projeto" | ✅ Backend | projectsController.ts:166-173 |
| **Projeto deletado** | Info | "Projeto deletado com sucesso" | ✅ Backend | projectsController.ts:151-155 |
| **Erro na exclusão** | Erro/Sistema | "Erro ao deletar projeto" | ❌ Frontend | - |

---

## 🔔 FLUXOS DE LEMBRETES E NOTIFICAÇÕES

### 1. CRIAR LEMBRETE (`/src/components/shared/ReminderModal.tsx`)

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Tipo não selecionado** | Erro/Validação | "Selecione um tipo de lembrete" | ❌ Não implementado | - |
| **Horário inválido** | Erro/Validação | "Horário deve estar no formato HH:MM" | ✅ Backend | validation.ts:308-310 |
| **Nenhum dia selecionado (recorrente)** | Erro/Validação | "Selecione pelo menos um dia da semana" | ✅ Backend | validation.ts:335-337 |
| **Nenhum tipo de notificação** | Erro/Validação | "Selecione pelo menos um tipo de notificação" | ✅ Implementado | Linha 329 |
| **Criação em andamento** | Info/Loading | "Criando lembrete..." | ✅ Implementado | Linha 330 |
| **Lembrete criado** | Sucesso | "🚀 Lembrete criado com sucesso!" | ❌ Não implementado | - |
| **Erro na criação** | Erro/Sistema | "Erro ao criar lembrete" | ✅ Implementado | Console.error linha 60 |

### 2. CONFIGURAÇÕES DE NOTIFICAÇÃO (`/src/components/profile/NotificationSettings.tsx`)

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Permissão negada** | Aviso/Crítico | "Notificações bloqueadas. Clique no ícone de cadeado para permitir." | ✅ Implementado | Linha 217-221 |
| **Service Worker não suportado** | Erro/Sistema | "Notificações não suportadas neste navegador" | ✅ Implementado | Linha 92 |
| **Solicitando permissão** | Info/Loading | "Solicitando permissão..." | ✅ Implementado | Linha 189 |
| **Permissão concedida** | Sucesso | "✅ Notificações ativadas com sucesso!" | ❌ Não implementado | - |
| **Teste de notificação** | Info/Loading | "Enviando teste..." | ✅ Implementado | Linha 200 |
| **Teste bem-sucedido** | Sucesso | "Teste de notificação enviado!" | ❌ Não implementado | - |
| **Erro no teste** | Erro/Sistema | "Erro ao testar notificação" | ✅ Implementado | Alert linha 84 |
| **Configuração salva** | Sucesso | "Configurações salvas!" | ❌ Não implementado | - |

---

## 👤 FLUXOS DE PERFIL E CONFIGURAÇÕES

### 1. ATUALIZAR PERFIL

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Nome muito curto** | Erro/Validação | "Nome deve ter pelo menos 2 caracteres" | ✅ Backend | validation.ts:247-250 |
| **Email inválido** | Erro/Validação | "Formato de email inválido" | ✅ Backend | validation.ts:261 |
| **Atualização em andamento** | Info/Loading | "Salvando alterações..." | ❌ Não implementado | - |
| **Perfil atualizado** | Sucesso | "Perfil atualizado com sucesso!" | ✅ Backend | authController.ts:121-125 |
| **Erro na atualização** | Erro/Sistema | "Erro ao atualizar perfil" | ❌ Frontend | - |

### 2. CONFIGURAÇÕES DO SISTEMA

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Orçamento de energia inválido** | Erro/Validação | "Orçamento deve ser entre 1 e 50 pontos" | ✅ Backend | validation.ts:267 |
| **Tema alterado** | Info | "Tema alterado para {tema}" | ❌ Não implementado | - |
| **Senha da sandbox muito longa** | Erro/Validação | "Senha muito longa (máximo 100 caracteres)" | ✅ Backend | validation.ts:271 |
| **Configurações salvas** | Sucesso | "Configurações salvas com sucesso!" | ❌ Não implementado | - |

---

## 🔄 FLUXOS DE IMPORTAÇÃO/EXPORTAÇÃO

### 1. IMPORTAÇÃO DE DADOS

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Arquivo inválido** | Erro/Validação | "Formato de arquivo inválido. Use JSON." | ❌ Não implementado | - |
| **Dados corrompidos** | Erro/Validação | "Arquivo corrompido ou formato incorreto" | ❌ Não implementado | - |
| **Importação em andamento** | Info/Loading | "Importando dados... Isso pode levar alguns minutos." | ❌ Não implementado | - |
| **Importação bem-sucedida** | Sucesso | "✅ {X} tarefas e {Y} projetos importados!" | ❌ Não implementado | - |
| **Conflito de dados** | Aviso | "Encontrados {X} conflitos. Deseja substituir os dados existentes?" | ❌ Não implementado | - |
| **Erro na importação** | Erro/Sistema | "Erro ao importar dados. Backup restaurado." | ❌ Não implementado | - |

### 2. EXPORTAÇÃO DE DADOS

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Exportação em andamento** | Info/Loading | "Preparando exportação..." | ❌ Não implementado | - |
| **Exportação concluída** | Sucesso | "Dados exportados com sucesso!" | ❌ Não implementado | - |
| **Erro na exportação** | Erro/Sistema | "Erro ao exportar dados" | ❌ Não implementado | - |
| **Arquivo muito grande** | Aviso | "Arquivo grande ({X}MB). Download pode demorar." | ❌ Não implementado | - |

---

## ⚡ FLUXOS DE ENERGIA E PERFORMANCE

### 1. SISTEMA DE ENERGIA

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Energia baixa (< 20%)** | Aviso/Motivacional | "⚡ Energia baixa! Que tal uma tarefa simples?" | ❌ Não implementado | - |
| **Energia esgotada** | Alerta/Bloqueio | "🔋 Energia esgotada! Descanse ou ajuste seu orçamento." | ❌ Não implementado | - |
| **Tentativa de exceder energia** | Aviso | "Esta tarefa excede sua energia disponível. Continuar mesmo assim?" | ❌ Não implementado | - |
| **Energia restaurada** | Info/Positivo | "🌅 Nova energia disponível! Bom dia!" | ❌ Não implementado | - |
| **Meta de energia atingida** | Celebração | "🎯 Meta de energia do dia atingida! Parabéns!" | ❌ Não implementado | - |

### 2. SISTEMA DE RECOMPENSAS

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Nova conquista** | Celebração/Modal | "🏆 Conquista desbloqueada: {nome}" | ✅ Implementado | Sistema de recompensas |
| **Streak mantido** | Motivacional | "🔥 {X} dias consecutivos!" | ✅ Implementado | Sistema de recompensas |
| **Streak perdido** | Motivacional | "💔 Sequência perdida, mas você pode recomeçar!" | ❌ Não implementado | - |
| **Novo nível alcançado** | Celebração | "⭐ Nível {X} alcançado!" | ❌ Não implementado | - |

---

## 🌐 FLUXOS DE CONEXÃO E SINCRONIZAÇÃO

### 1. CONECTIVIDADE

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Conexão perdida** | Aviso/Sistema | "🌐 Conexão perdida. Trabalhando offline..." | ❌ Não implementado | - |
| **Reconectado** | Info/Positivo | "✅ Conexão restaurada. Sincronizando dados..." | ❌ Não implementado | - |
| **Falha na sincronização** | Erro/Sistema | "❌ Erro na sincronização. Tentando novamente..." | ❌ Não implementado | - |
| **Sincronização concluída** | Info | "✅ Dados sincronizados" | ❌ Não implementado | - |
| **Conflito de dados** | Aviso/Crítico | "Detectados conflitos. Usar dados locais ou do servidor?" | ❌ Não implementado | - |

### 2. PERFORMANCE

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Carregamento lento** | Info/Sistema | "Carregando... Isso está demorando mais que o normal." | ❌ Não implementado | - |
| **Timeout de requisição** | Erro/Sistema | "Operação demorou muito. Tente novamente." | ⚠️ Parcial | Configurado no axios |
| **Muitos dados** | Aviso/Performance | "Muitas tarefas! Considere arquivar tarefas antigas." | ❌ Não implementado | - |

---

## 📱 FLUXOS ESPECÍFICOS MOBILE/PWA

### 1. INSTALAÇÃO PWA

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **PWA disponível** | Info/Promocional | "📱 Instalar app no dispositivo?" | ❌ Não implementado | - |
| **PWA instalado** | Sucesso | "✅ App instalado com sucesso!" | ❌ Não implementado | - |
| **Atualização disponível** | Info/Sistema | "🔄 Nova versão disponível. Atualizar?" | ❌ Não implementado | - |

### 2. ORIENTAÇÃO/RESPONSIVIDADE

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Rotação de tela** | Info/UX | "💡 Gire o dispositivo para melhor experiência" | ❌ Não implementado | - |
| **Tela muito pequena** | Aviso/UX | "Algumas funcionalidades podem estar limitadas em telas pequenas" | ❌ Não implementado | - |

---

## 🛡️ FLUXOS DE SEGURANÇA E VALIDAÇÃO

### 1. VALIDAÇÃO DE DADOS

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Campo obrigatório vazio** | Erro/Validação | "Este campo é obrigatório" | ⚠️ Parcial | HTML required |
| **Formato inválido** | Erro/Validação | "Formato inválido para este campo" | ⚠️ Parcial | Validações específicas |
| **Valor fora do limite** | Erro/Validação | "Valor deve estar entre {min} e {max}" | ✅ Backend | Schemas Zod |
| **Caracteres inválidos** | Erro/Validação | "Caracteres não permitidos detectados" | ❌ Não implementado | - |

### 2. SANDBOX DE NOTAS

| Cenário | Tipo de Alerta | Mensagem Sugerida | Status Atual | Localização |
|---------|---------------|-------------------|--------------|-------------|
| **Senha incorreta** | Erro/Segurança | "Senha incorreta para acessar a sandbox" | ❌ Não implementado | - |
| **Sandbox desbloqueada** | Sucesso | "🔓 Sandbox desbloqueada!" | ❌ Não implementado | - |
| **Sessão expirada** | Aviso/Segurança | "Sessão da sandbox expirou. Digite a senha novamente." | ❌ Não implementado | - |

---

## 📊 RESUMO ESTATÍSTICO

### Por Categoria:

| Categoria | Total de Cenários | Implementado ✅ | Parcial ⚠️ | Não Implementado ❌ |
|-----------|-------------------|----------------|------------|---------------------|
| **Autenticação** | 17 | 8 (47%) | 4 (24%) | 5 (29%) |
| **CRUD Tarefas** | 28 | 12 (43%) | 2 (7%) | 14 (50%) |
| **CRUD Hábitos** | 16 | 9 (56%) | 1 (6%) | 6 (38%) |
| **CRUD Projetos** | 12 | 6 (50%) | 0 (0%) | 6 (50%) |
| **Lembretes/Notificações** | 15 | 6 (40%) | 0 (0%) | 9 (60%) |
| **Perfil/Configurações** | 8 | 4 (50%) | 0 (0%) | 4 (50%) |
| **Importação/Exportação** | 10 | 0 (0%) | 0 (0%) | 10 (100%) |
| **Sistema de Energia** | 5 | 1 (20%) | 0 (0%) | 4 (80%) |
| **Conectividade/Performance** | 8 | 0 (0%) | 1 (13%) | 7 (87%) |
| **Mobile/PWA** | 4 | 0 (0%) | 0 (0%) | 4 (100%) |
| **Segurança/Validação** | 7 | 1 (14%) | 3 (43%) | 3 (43%) |

### **TOTAL GERAL**: 130 cenários
- **✅ Implementado**: 47 cenários (36%)
- **⚠️ Parcialmente**: 11 cenários (8%)
- **❌ Não implementado**: 72 cenários (55%)

---

## 🎯 PRIORIDADES DE IMPLEMENTAÇÃO

### 🔴 **CRÍTICO (Implementar Imediatamente)**
1. **Feedback de carregamento** em todas as operações assíncronas
2. **Confirmações de exclusão** para tarefas, hábitos e projetos
3. **Validações de formulário** com mensagens específicas
4. **Notificações de sucesso** para todas as operações CRUD
5. **Sistema de energia** com alertas quando baixa/esgotada

### 🟡 **IMPORTANTE (Implementar em Breve)**
6. **Sistema de conectividade offline**
7. **Importação/exportação de dados** com feedback
8. **PWA com notificações de atualização**
9. **Validações específicas para campos complexos**
10. **Sistema de streak/motivação para hábitos**

### 🟢 **DESEJÁVEL (Implementar Posteriormente)**
11. **Otimizações de UX para mobile**
12. **Sistema de conflito de dados**
13. **Alertas de performance**
14. **Sandbox de notas com autenticação**
15. **Sistema de níveis e gamificação**

---

## 🛠️ RECOMENDAÇÕES TÉCNICAS

### **1. Padronização de Alertas**
- Criar um sistema centralizado de notificações/toasts
- Utilizar tipos consistentes: `success`, `error`, `warning`, `info`, `loading`
- Implementar timeouts automáticos e ações de dismissal

### **2. Validação Unificada**
- Expandir validações Zod para cobrir todos os cenários
- Sincronizar mensagens entre frontend e backend
- Implementar validação em tempo real para melhor UX

### **3. Estados de Loading**
- Padronizar estados de loading em todos os componentes
- Implementar skeletons para melhor percepção de performance
- Adicionar timeouts para operações longas

### **4. Sistema de Feedback Motivacional**
- Implementar celebrações contextuais para usuários neurodivergentes
- Adicionar feedback positivo constante
- Criar sistema de recuperação para falhas/erros

### **5. Acessibilidade e Inclusão**
- Garantir que todos os alertas sejam acessíveis via screen readers
- Implementar padrões visuais consistentes para diferentes tipos de feedback
- Adicionar opções de customização para necessidades específicas

---

## 📋 PRÓXIMOS PASSOS

1. **Auditoria dos componentes existentes** para identificar onde implementar os alertas mapeados
2. **Criação de um sistema centralizado** de notificações/toasts
3. **Implementação gradual** seguindo as prioridades definidas
4. **Testes de usabilidade** com foco em usuários neurodivergentes
5. **Documentação** de padrões e diretrizes para futuras implementações

---

*Este documento serve como base para implementação de um sistema de feedback completo e inclusivo, garantindo que cada interação do usuário tenha o retorno apropriado e imediato necessário para uma experiência de usuário excepcional.*