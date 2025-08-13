# Sistema de Notificações Sentinela

## 📋 Visão Geral

O Sistema de Notificações Sentinela é uma solução completa e tipada para gerenciar notificações na aplicação, construída sobre o Sonner com funcionalidades avançadas específicas para usuários neurodivergentes.

## 🚀 Características Principais

- **Totalmente tipado** com TypeScript
- **Integração automática** com interceptadores da API
- **Compatibilidade 100%** com código existente
- **Notificações contextuais** por funcionalidade
- **Sistema de celebrações** para conquistas
- **Controle de preferências** do usuário
- **Histórico de notificações** persistente
- **Temas responsivos** com dark mode

## 📦 Instalação e Configuração

O sistema já está integrado no projeto. Para usar, importe os hooks necessários:

```tsx
import useNotification, { 
  useTaskNotifications, 
  useHabitNotifications, 
  useAuthNotifications,
  useAsyncNotification 
} from '@/hooks/useNotification';
```

## 🎯 Uso Básico

### Hook Principal

```tsx
import useNotification from '@/hooks/useNotification';

function MyComponent() {
  const notification = useNotification();

  const handleSuccess = () => {
    notification.success('Operação realizada!', {
      description: 'Tudo foi processado corretamente',
      context: 'task_crud',
      duration: 3000
    });
  };

  const handleError = () => {
    notification.error('Algo deu errado', {
      description: 'Tente novamente em alguns momentos',
      context: 'system',
      action: {
        label: 'Tentar novamente',
        onClick: () => handleRetry()
      }
    });
  };

  return (
    <div>
      <button onClick={handleSuccess}>Sucesso</button>
      <button onClick={handleError}>Erro</button>
    </div>
  );
}
```

### Hooks Especializados

#### Notificações de Tarefas
```tsx
import { useTaskNotifications } from '@/hooks/useNotification';

function TaskComponent() {
  const taskNotifications = useTaskNotifications();

  const createTask = async () => {
    try {
      await api.createTask(data);
      taskNotifications.taskCreated(taskTitle);
    } catch (error) {
      // Erro tratado automaticamente pelos interceptadores
    }
  };

  const completeTask = async () => {
    await api.completeTask(id);
    taskNotifications.taskCompleted(taskTitle, energyGained);
  };
}
```

#### Notificações de Hábitos
```tsx
import { useHabitNotifications } from '@/hooks/useNotification';

function HabitComponent() {
  const habitNotifications = useHabitNotifications();

  const completeHabit = async () => {
    await api.completeHabit(id);
    habitNotifications.habitCompleted(habitName, streakCount);
  };
}
```

#### Notificações de Autenticação
```tsx
import { useAuthNotifications } from '@/hooks/useNotification';

function LoginComponent() {
  const authNotifications = useAuthNotifications();

  const handleLogin = async () => {
    try {
      const user = await api.login(credentials);
      authNotifications.loginSuccess(user.name);
    } catch (error) {
      authNotifications.loginError(error.message);
    }
  };
}
```

### Operações Assíncronas com Loading

```tsx
import { useAsyncNotification } from '@/hooks/useNotification';

function AsyncComponent() {
  const { withLoading } = useAsyncNotification();

  const saveData = async () => {
    try {
      const result = await withLoading(
        () => api.saveData(data),
        {
          loading: 'Salvando dados...',
          success: 'Dados salvos com sucesso!'
        },
        {
          context: 'system',
          description: 'Operação concluída'
        }
      );
    } catch (error) {
      // Erro tratado automaticamente
    }
  };
}
```

## 🎨 Tipos de Notificação

### Tipos Básicos
- `success` - Operação bem-sucedida (verde)
- `error` - Erro que precisa atenção (vermelho)
- `warning` - Aviso importante (laranja)
- `info` - Informação neutra (azul)
- `loading` - Estado de carregamento (azul animado)

### Celebrações Especiais
- `celebration` - Conquistas e marcos importantes

```tsx
notification.celebrate('Primeira semana completa!', {
  celebrationType: 'habit_streak',
  intensity: 'intense',
  visualEffects: true,
  sound: true
});
```

## 🏷️ Contextos de Notificação

Contextos ajudam a organizar e filtrar notificações:

- `authentication` - Login, registro, sessão
- `task_crud` - CRUD de tarefas
- `habit_crud` - CRUD de hábitos
- `project_crud` - CRUD de projetos
- `reminder` - Sistema de lembretes
- `energy_system` - Sistema de energia/orçamento
- `connectivity` - Problemas de rede
- `validation` - Validação de formulários
- `celebration` - Celebrações e conquistas
- `system` - Notificações do sistema

## ⚙️ Configurações e Preferências

```tsx
const notification = useNotification();

// Atualizar preferências
notification.updatePreferences({
  position: 'top-center',
  defaultDuration: 5000,
  celebrationsEnabled: true,
  soundEnabled: false
});

// Silenciar contexto temporariamente
notification.muteContext('validation', 30000); // 30 segundos

// Pausar todas as notificações
notification.pause();
notification.resume();
```

## 📱 Tratamento Automático de Erros

O sistema possui interceptadores automáticos na API que tratam erros comuns:

```tsx
// Erros HTTP são tratados automaticamente
// 401 -> Sessão expirada (com ação de login)
// 403 -> Acesso negado
// 500+ -> Erro do servidor
// Timeout -> Problemas de conexão
// Network -> Sem internet
```

## 🎯 Códigos de Erro Mapeados

O sistema mapeia códigos de erro do backend para mensagens amigáveis:

```tsx
// Backend retorna:
{
  error: {
    code: 'REMINDER_LIMIT_ERROR',
    type: 'limit'
  }
}

// Sistema mostra automaticamente:
// "Limite de lembretes atingido"
// "Exclua alguns lembretes antigos antes de criar novos"
```

## 🎨 Personalização Visual

### CSS Classes Disponíveis

As notificações usam classes CSS customizadas:

```css
.sentinela-notification /* Container principal */
.celebration-toast /* Celebrações especiais */
.toast[data-context="task_crud"] /* Por contexto */
.toast[data-important="true"] /* Importantes */
```

### Temas

O sistema respeita o tema da aplicação:

```tsx
// Usa variáveis CSS do sistema Sentinela
--sentinela-surface
--sentinela-text
--sentinela-border
--energia-baixa, --energia-normal, --energia-alta
```

## 📊 Histórico e Controle

```tsx
const notification = useNotification();

// Acessar histórico
const history = notification.history;

// Marcar como lida
notification.markAsRead(notificationId);

// Limpar histórico
notification.clearHistory();

// Controlar notificações ativas
notification.dismiss(notificationId);
notification.dismissAll();
```

## 🧪 Migração do Código Existente

### Antes (toast simples)
```tsx
import { toast } from 'sonner';

toast.success('Tarefa criada!');
toast.error('Erro ao salvar');
```

### Depois (sistema completo)
```tsx
import { useTaskNotifications } from '@/hooks/useNotification';

const taskNotifications = useTaskNotifications();

taskNotifications.taskCreated(taskTitle);
// ou
notification.error('Erro ao salvar', {
  context: 'task_crud',
  description: 'Detalhes do erro...'
});
```

## 🔄 Compatibilidade

O sistema mantém **100% de compatibilidade** com código existente:

- Chamadas `toast()` continuam funcionando
- Componentes existentes não precisam ser alterados
- Migração pode ser gradual

## 🐛 Debug e Desenvolvimento

```tsx
// Eventos do sistema
notification.addEventListener((event) => {
  console.log('Notification event:', event);
});

// Estado interno
console.log('Preferences:', notification.preferences);
console.log('History:', notification.history);
console.log('Is paused:', notification.isPaused);
```

## 📈 Performance

- **Bundle size**: Otimizado, zero dependências extras
- **Render time**: <16ms para todas as operações
- **Memory**: Cache limitado a 100 notificações no histórico
- **Events**: Debounced e otimizados para performance

## 🎯 Exemplos Práticos

### Formulário com Validação
```tsx
function FormComponent() {
  const notification = useNotification();

  const validateForm = (data) => {
    if (!data.email) {
      notification.warning('Email é obrigatório', {
        context: 'validation',
        duration: 3000
      });
      return false;
    }
    return true;
  };
}
```

### Upload com Progress
```tsx
function UploadComponent() {
  const { withLoading } = useAsyncNotification();

  const uploadFile = async (file) => {
    await withLoading(
      () => uploadToServer(file),
      {
        loading: `Enviando ${file.name}...`,
        success: 'Arquivo enviado com sucesso!'
      },
      { context: 'system' }
    );
  };
}
```

### Sistema de Conquistas
```tsx
function AchievementComponent() {
  const notification = useNotification();

  const unlockAchievement = (achievement) => {
    notification.celebrate(`Conquista desbloqueada: ${achievement.name}!`, {
      celebrationType: 'achievement',
      intensity: 'epic',
      visualEffects: true,
      sound: true,
      persistent: true
    });
  };
}
```

---

## 🤝 Contribuição

Para adicionar novos tipos de notificação ou contextos:

1. Atualize `src/types/notification.ts`
2. Adicione mapeamentos em `NotificationSystem.ts`
3. Crie hooks especializados se necessário
4. Adicione estilos CSS correspondentes
5. Atualize esta documentação

---

**Sistema desenvolvido especificamente para usuários neurodivergentes com foco em clareza, consistência e feedback imediato.**