# Análise de Segurança do localStorage no Projeto Gerenciador de Tarefas

## Resumo Executivo

Esta análise identificou **12 categorias principais** de uso do localStorage no projeto, com diferentes níveis de risco de segurança. O sistema utiliza localStorage para autenticação, configurações de usuário, rastreamento de eventos e dados temporários de migração.

## ⚠️ RISCOS CRÍTICOS IDENTIFICADOS

### 🔴 RISCO ALTO - Tokens de Autenticação
**Localização**: `src/stores/authStore.ts`, `src/hooks/api/useAuth.ts`, múltiplos arquivos
- **Dados armazenados**: `auth-token`, `cerebro-auth`
- **Risco**: Tokens JWT expostos no localStorage são vulneráveis a ataques XSS
- **Impacto**: Acesso não autorizado à conta do usuário

### 🟡 RISCO MÉDIO - Dados Sensíveis de Estado
**Localização**: `src/components/shared/MigrationHelper.tsx`
- **Dados armazenados**: `tasks-store`, `habits-store`, `notes-store`, `energy-store`
- **Risco**: Informações pessoais do usuário expostas
- **Impacto**: Vazamento de dados pessoais

## 📊 CATEGORIAS DE USO DO LOCALSTORAGE

### 1. **AUTENTICAÇÃO E SESSÃO**
| Item | Arquivos | Função | Risco |
|------|----------|---------|-------|
| `auth-token` | `authStore.ts`, `useAuth.ts`, `AuthProvider.tsx`, `AuthMiddleware.tsx` | Armazenar JWT token | 🔴 ALTO |
| `cerebro-auth` | `authStore.ts`, `MigrationHelper.tsx` | Dados completos do usuário autenticado | 🟡 MÉDIO |

**Uso**: 
- Persistência de sessão entre recarregamentos
- Autenticação automática
- Fallback quando API não responde

**Riscos**:
- Tokens JWT expostos a ataques XSS
- Não expira automaticamente no cliente
- Dados sensíveis do usuário em texto claro

### 2. **CONFIGURAÇÕES DE ÁUDIO/UX**
| Item | Arquivos | Função | Risco |
|------|----------|---------|-------|
| `achievement-sounds-enabled` | `achievementSounds.ts`, `RewardsSettingsPanel.tsx` | Ativar/desativar sons | 🟢 BAIXO |
| `achievement-sound-volume` | `achievementSounds.ts`, `RewardsSettingsPanel.tsx` | Controle de volume | 🟢 BAIXO |
| `achievement-animations-enabled` | `RewardsSettingsPanel.tsx` | Ativar/desativar animações | 🟢 BAIXO |
| `achievement-reduced-motion` | `RewardsSettingsPanel.tsx` | Acessibilidade - movimento reduzido | 🟢 BAIXO |

**Uso**: Preferências de interface do usuário
**Riscos**: Mínimos - apenas configurações de UX

### 3. **SISTEMA DE CONQUISTAS/NOTIFICAÇÕES**
| Item | Arquivos | Função | Risco |
|------|----------|---------|-------|
| `shown-achievements` | `AchievementNotificationSystem.tsx` | Conquistas já exibidas | 🟢 BAIXO |
| `pending-achievements` | `AchievementNotificationSystem.tsx` | Conquistas pendentes | 🟢 BAIXO |

**Uso**: Evitar re-exibição de notificações de conquistas
**Riscos**: Baixos - apenas IDs de conquistas

### 4. **RASTREAMENTO TEMPORAL DE EVENTOS**
| Item | Arquivos | Função | Risco |
|------|----------|---------|-------|
| `task-completion-timestamp` | `BombeiroPageClient.tsx`, `AchievementNotificationSystem.tsx` | Timestamp de conclusão | 🟡 MÉDIO |
| `last-completed-task-id` | `BombeiroPageClient.tsx`, `AchievementNotificationSystem.tsx` | ID da última tarefa | 🟡 MÉDIO |
| `task-completion-triggered` | `BombeiroPageClient.tsx`, `AchievementNotificationSystem.tsx` | Flag de evento | 🟢 BAIXO |
| `project-completion-timestamp` | `ProjectContainer.tsx`, `AchievementNotificationSystem.tsx` | Timestamp de conclusão de projeto | 🟡 MÉDIO |
| `last-completed-project-id` | `ProjectContainer.tsx`, `AchievementNotificationSystem.tsx` | ID do último projeto | 🟡 MÉDIO |
| `project-completion-triggered` | `ProjectContainer.tsx`, `AchievementNotificationSystem.tsx` | Flag de evento | 🟢 BAIXO |

**Uso**: Sincronização entre ações do usuário e sistema de conquistas
**Riscos**: Médios - IDs podem revelar padrões de uso

### 5. **DADOS DE MIGRAÇÃO (LEGADO)**
| Item | Arquivos | Função | Risco |
|------|----------|---------|-------|
| `tasks-store` | `MigrationHelper.tsx` | Dados de tarefas do sistema antigo | 🟡 MÉDIO |
| `habits-store` | `MigrationHelper.tsx` | Dados de hábitos do sistema antigo | 🟡 MÉDIO |
| `notes-store` | `MigrationHelper.tsx` | Notas do usuário | 🟡 MÉDIO |
| `energy-store` | `MigrationHelper.tsx` | Dados de energia/produtividade | 🟡 MÉDIO |

**Uso**: Migração de dados do localStorage para PostgreSQL
**Riscos**: Médios - dados pessoais completos durante migração

## 🛡️ RECOMENDAÇÕES DE SEGURANÇA

### IMEDIATAS (Críticas)

1. **Migrar Tokens para HttpOnly Cookies**
   ```typescript
   // ❌ Atual - Vulnerável
   localStorage.setItem('auth-token', token);
   
   // ✅ Recomendado - Seguro
   // Backend definir cookie HttpOnly + Secure + SameSite
   res.cookie('auth-token', token, {
     httpOnly: true,
     secure: true,
     sameSite: 'strict'
   });
   ```

2. **Implementar Refresh Token Pattern**
   ```typescript
   // Separar access token (curta duração) de refresh token
   // Access token em memória, refresh token em HttpOnly cookie
   ```

### CURTO PRAZO

3. **Criptografar Dados Sensíveis**
   ```typescript
   // Para dados que devem permanecer no localStorage
   const encrypted = CryptoJS.AES.encrypt(data, userKey).toString();
   localStorage.setItem('key', encrypted);
   ```

4. **Implementar Limpeza Automática**
   ```typescript
   // Auto-limpeza de dados temporários
   const cleanupOldData = () => {
     const keys = ['task-completion-timestamp', 'project-completion-timestamp'];
     keys.forEach(key => {
       const timestamp = localStorage.getItem(key);
       if (timestamp && Date.now() - parseInt(timestamp) > 24 * 60 * 60 * 1000) {
         localStorage.removeItem(key);
       }
     });
   };
   ```

### MÉDIO PRAZO

5. **Migrar Configurações para Perfil do Usuário**
   ```sql
   -- Mover configurações de UX para banco de dados
   ALTER TABLE users ADD COLUMN ui_preferences JSONB;
   ```

6. **Implementar Content Security Policy (CSP)**
   ```typescript
   // Next.js - headers em next.config.js
   headers: [
     {
       key: 'Content-Security-Policy',
       value: "script-src 'self' 'unsafe-inline'; object-src 'none';"
     }
   ]
   ```

## 🔄 ALTERNATIVAS RECOMENDADAS

### Para Tokens de Autenticação
- **HttpOnly Cookies**: Não acessíveis via JavaScript
- **Secure + SameSite**: Proteção contra ataques CSRF
- **JWT em memória**: Para SPAs, usar estado da aplicação

### Para Configurações de Usuário
- **Database Storage**: Persistir no PostgreSQL
- **Server-Side Sessions**: Redis/PostgreSQL para sessões
- **Encrypted Storage**: Se localStorage necessário, criptografar

### Para Dados Temporários
- **SessionStorage**: Para dados que só precisam existir na sessão
- **IndexedDB**: Para dados estruturados offline
- **Memory State**: Zustand/Redux para dados voláteis

## 📈 MATRIZ DE PRIORIZAÇÃO

| Categoria | Risco | Impacto | Esforço | Prioridade |
|-----------|-------|---------|---------|------------|
| Tokens Auth | 🔴 Alto | Alto | Médio | 1️⃣ CRÍTICA |
| Dados Migração | 🟡 Médio | Alto | Baixo | 2️⃣ ALTA |
| Rastreamento Temporal | 🟡 Médio | Médio | Baixo | 3️⃣ MÉDIA |
| Configurações UX | 🟢 Baixo | Baixo | Alto | 4️⃣ BAIXA |
| Sistema Conquistas | 🟢 Baixo | Baixo | Baixo | 5️⃣ BAIXA |

## 🚀 PLANO DE IMPLEMENTAÇÃO

### Sprint 1 (Crítico)
- [ ] Implementar autenticação com HttpOnly cookies
- [ ] Remover `auth-token` do localStorage
- [ ] Testar fluxo de autenticação completo

### Sprint 2 (Alto)
- [ ] Migrar dados legados para PostgreSQL
- [ ] Remover stores de migração do localStorage
- [ ] Implementar limpeza automática de dados temporários

### Sprint 3 (Médio)
- [ ] Criptografar dados sensíveis remanescentes
- [ ] Migrar configurações UX para banco de dados
- [ ] Implementar CSP headers

### Sprint 4 (Baixo)
- [ ] Otimizar sistema de conquistas
- [ ] Melhorar performance de notificações
- [ ] Documentar novas práticas de segurança

## 📝 CONCLUSÃO

O projeto utiliza localStorage extensivamente, com **riscos críticos na gestão de autenticação**. A migração para HttpOnly cookies e a remoção de tokens do localStorage deve ser a prioridade máxima. As configurações de UX e sistema de conquistas apresentam riscos mínimos e podem ser tratadas posteriormente.

**Próximos passos**: Implementar autenticação segura com cookies HttpOnly como primeira prioridade, seguida pela migração completa dos dados de legado para PostgreSQL.

---
*Análise realizada em: {{ date }}*
*Autor: Claude Code - Sistema de Análise de Segurança*