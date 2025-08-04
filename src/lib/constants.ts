// ============================================================================
// CONSTANTS - Constantes para o Sentinela
// ============================================================================



/**
 * Configurações padrão de energia
 */
export const ENERGY_CONFIG = {
  DEFAULT_DAILY_BUDGET: 12,
  LEVELS: {
    LOW: 1,
    MEDIUM: 3,
    HIGH: 5,
  } as const,
  LABELS: {
    1: 'Bateria Fraca',
    3: 'Cérebro Normal',
    5: 'Cérebro Ligado',
  } as const,
  ICONS: {
    1: '🔋',
    3: '🧠', 
    5: '⚡',
  } as const,
} as const;

/**
 * Status de tarefas
 */
export const TASK_STATUS = {
  BACKLOG: 'backlog',
  TODAY: 'today',
  PENDING: 'pending',
  DONE: 'done',
  POSTPONED: 'postponed',
} as const;

/**
 * Páginas da aplicação
 */
export const PAGES = {
  BOMBEIRO: 'bombeiro',
  ARQUITETO: 'arquiteto',
  CAIXA_DE_AREIA: 'caixa-de-areia',
  FLORESTA: 'floresta',
} as const;

/**
 * Protocolos do sistema
 */
export const PROTOCOLS = {
  LOW_ENERGY: 'low-energy',
  DECOMPOSITION: 'decomposition',
  EMERGENCY: 'emergency',
  SENTINEL: 'sentinel',
} as const;

/**
 * Limites do sistema
 */
export const LIMITS = {
  MAX_POSTPONEMENTS: 3,
  MAX_TASK_DESCRIPTION: 200,
  MAX_PROJECT_NAME: 100,
  MAX_NOTE_LENGTH: 2000,
  MIN_ENERGY_POINTS: 1,
  MAX_ENERGY_POINTS: 5,
} as const;

/**
 * Mensagens padrão
 */
export const MESSAGES = {
  ERRORS: {
    ENERGY_INSUFFICIENT: '⚡ Energia insuficiente! Reorganize seu dia ou escolha tarefas mais leves.',
    TASK_NOT_FOUND: '❌ Tarefa não encontrada!',
    PROJECT_NOT_FOUND: '❌ Projeto não encontrado!',
    MAX_POSTPONEMENTS: '🔧 Esta tarefa já foi adiada muitas vezes. Que tal quebrá-la em pedaços menores?',
    INVALID_DATE: '❗ Por favor, escolha uma data futura (a partir de amanhã).',
    EMPTY_CONTENT: '❗ Por favor, preencha o conteúdo antes de continuar.',
  },
  SUCCESS: {
    TASK_MOVED: '✅ Tijolo movido para hoje!',
    TASK_COMPLETED: '✅ Tarefa concluída!',
    PROJECT_CREATED: '✅ Projeto criado com sucesso!',
    NOTE_SAVED: '✅ Pensamento salvo na Caixa de Areia!',
    TASK_SCHEDULED: '✅ Tarefa agendada com sucesso!',
  },
  INFO: {
    ALL_TASKS_DONE: '🎉 Todas as missões concluídas! Excelente trabalho!',
    NO_TASKS_TODAY: '🌟 Nenhuma tarefa para hoje. Aproveite para descansar!',
    NO_PROJECTS: '🏗️ Nenhum projeto ainda. Que tal criar o primeiro?',
    NO_NOTES: '🕊️ Mente tranquila. Nenhum pensamento salvo ainda.',
    LOW_ENERGY_SUPPORT: '🫂 Está tudo bem não conseguir hoje. Dias difíceis fazem parte da jornada.',
  },
} as const;

/**
 * Configurações de animação
 */
export const ANIMATIONS = {
  DURATION: {
    FAST: 0.2,
    NORMAL: 0.3,
    SLOW: 0.5,
  },
  EASING: {
    DEFAULT: 'cubic-bezier(0.4, 0, 0.2, 1)',
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    EASE_OUT: 'cubic-bezier(0, 0, 0.2, 1)',
  },
  SPRING: {
    DEFAULT: { type: 'spring', stiffness: 400, damping: 25 },
    BOUNCY: { type: 'spring', stiffness: 200, damping: 15 },
    SMOOTH: { type: 'spring', stiffness: 300, damping: 30 },
  },
} as const;

/**
 * Cores do tema
 */
export const THEME_COLORS = {
  PRIMARY: {
    50: '#eff6ff',
    100: '#dbeafe',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
  },
  SECONDARY: {
    50: '#faf5ff',
    100: '#f3e8ff',
    500: '#8b5cf6',
    600: '#7c3aed',
    700: '#6d28d9',
  },
  SUCCESS: {
    50: '#ecfdf5',
    100: '#d1fae5',
    500: '#10b981',
    600: '#059669',
    700: '#047857',
  },
  WARNING: {
    50: '#fffbeb',
    100: '#fef3c7',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
  },
  DANGER: {
    50: '#fef2f2',
    100: '#fee2e2',
    500: '#ef4444',
    600: '#dc2626',
    700: '#b91c1c',
  },
} as const;

/**
 * Breakpoints responsivos
 */
export const BREAKPOINTS = {
  SM: '640px',
  MD: '768px',
  LG: '1024px',
  XL: '1280px',
  '2XL': '1536px',
} as const;

/**
 * Configurações de localStorage
 */
export const STORAGE_KEYS = {
  TASKS: 'sentinela-tasks',
  PROJECTS: 'sentinela-projects',
  NOTES: 'sentinela-notes',
  SETTINGS: 'sentinela-settings',
  TREES: 'sentinela-trees',
} as const;

/**
 * URLs da API (para futuras implementações)
 */
export const API_ENDPOINTS = {
  TASKS: '/api/tasks',
  PROJECTS: '/api/projects',
  NOTES: '/api/notes',
  TREES: '/api/trees',
  AUTH: '/api/auth',
} as const;
