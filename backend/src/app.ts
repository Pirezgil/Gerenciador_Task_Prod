// Load environment variables FIRST
import dotenv from 'dotenv';
dotenv.config();

// CRITICAL: Environment validation must be after dotenv config
import { env } from './config/environment';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';

// Middleware imports
import { errorHandler } from './middleware/errorHandler';
import { apiLimiter, authLimiter, sensitiveLimiter, modificationLimiter } from './middleware/rateLimiting';
import { generateCSRFToken, validateCSRF, getCSRFToken } from './middleware/csrfProtection';

// Routes imports
import { authRoutes } from './routes/auth';
import { taskRoutes } from './routes/tasks';
import { projectRoutes } from './routes/projects';
import { noteRoutes } from './routes/notes';
import { habitRoutes } from './routes/habits';
import { userRoutes } from './routes/users';
import { reminderRoutes } from './routes/reminders';
import { schedulerRoutes } from './routes/scheduler';
import { pushSubscriptionRoutes } from './routes/pushSubscriptions';
import { adminRoutes } from './routes/admin';
import achievementRoutes from './routes/achievements';
import habitStreakRoutes from './routes/habitStreak';
import { dailyProgressRoutes } from './routes/dailyProgress';
import attachmentRoutes from './routes/attachments';

// Services imports
import DailyTaskScheduler from './services/dailyTaskScheduler';
import { reminderScheduler, schedulerHealthCheck } from './services/reminderScheduler';

const app = express();
export const prisma = new PrismaClient();

// INTERCEPTAR TUDO - ANTES DE QUALQUER COISA
app.use('*', (req, res, next) => {
  console.log('⚡ [INTERCEPTA-TUDO]:', req.method, req.originalUrl);
  if (req.method === 'PUT') {
    console.log('⚡ [PUT-DETECTADO] Headers raw:', req.headers);
  }
  next();
});

// LOG ULTRA BÁSICO - LITERALMENTE O PRIMEIRO MIDDLEWARE
app.use((req, res, next) => {
  console.log('🚨 [PRIMEIRO-LOG] Requisição recebida:', {
    method: req.method,
    url: req.originalUrl,
    headers: {
      'content-type': req.get('content-type'),
      'origin': req.get('origin'),
      'user-agent': req.get('user-agent')?.substring(0, 50)
    },
    timestamp: new Date().toISOString()
  });
  next();
});

// ETAPA 3: Headers de segurança fortalecidos (P2)
app.use(helmet({
  // Configurações de CSP mais rigorosas
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // Necessário para Tailwind/styled-components
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:3000'],
      fontSrc: ["'self'", "https:"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"]
    },
  },
  crossOriginResourcePolicy: { policy: "cross-origin" },
  
  // Headers adicionais de segurança
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  hsts: {
    maxAge: 31536000, // 1 ano
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  frameguard: { action: 'deny' },
  xssFilter: true
}));

// CORS otimizado para produção com ngrok
const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    // Lista de origens permitidas baseada no ambiente
    const allowedOrigins = [
      env.FRONTEND_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];
    
    // Se há uma variável de ambiente com origens permitidas
    if (process.env.ALLOWED_ORIGINS) {
      allowedOrigins.push(...process.env.ALLOWED_ORIGINS.split(','));
    }
    
    // Para ngrok, permitir qualquer subdomínio ngrok
    const isNgrok = origin && (origin.includes('ngrok-free.app') || origin.includes('ngrok.io'));
    
    // Permitir se não há origin (requisições do servidor) ou se está na lista ou é ngrok
    if (!origin || allowedOrigins.includes(origin) || isNgrok) {
      callback(null, true);
    } else {
      console.warn('🚨 CORS: Origem bloqueada:', origin);
      callback(new Error('Não permitido pelo CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'X-Requested-With',
    'Accept',
    'Origin',
    'Authorization',
    'X-CSRF-Token'
  ],
  exposedHeaders: ['X-CSRF-Token', 'Set-Cookie'],
  optionsSuccessStatus: 200,
  preflightContinue: false
};

app.use(cors(corsOptions));

app.use(cookieParser()); // Necessário para cookies HTTP-only

// LOG ANTES DO PARSING
app.use((req, res, next) => {
  if (req.method === 'PUT') {
    console.log('🔥 [PRE-PARSE] Requisição PUT recebida:', {
      method: req.method,
      url: req.originalUrl,
      contentType: req.get('content-type'),
      contentLength: req.get('content-length'),
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// LOG EARLY PARA DEBUG 400
app.use((req, res, next) => {
  if (req.method === 'PUT' && req.path.includes('/tasks/')) {
    console.log('🐛 [EARLY DEBUG] PUT /tasks CAPTURADO:', {
      path: req.path,
      method: req.method,
      contentType: req.get('content-type'),
      contentLength: req.get('content-length'),
      origin: req.get('origin'),
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// Limitação de payload para segurança
app.use(express.json({ 
  limit: '1mb', // Reduzido de 10mb por segurança
  strict: true
}));
app.use(express.urlencoded({ 
  extended: true, 
  limit: '1mb'
}));

// LOG DEPOIS DO PARSING
app.use((req, res, next) => {
  if (req.method === 'PUT') {
    console.log('🔥 [POST-PARSE] Body parseado:', {
      method: req.method,
      url: req.originalUrl,
      body: req.body,
      bodyType: typeof req.body,
      bodyKeys: Object.keys(req.body || {}),
      timestamp: new Date().toISOString()
    });
  }
  next();
});

// Logging de segurança
app.use(morgan('combined'));

// LOG GLOBAL PARA DEBUG - capturar TODAS as requisições
app.use((req, res, next) => {
  console.log('🌐 [GLOBAL] Nova requisição:', {
    method: req.method,
    path: req.path,
    url: req.originalUrl,
    userAgent: req.get('User-Agent'),
    origin: req.get('origin'),
    referer: req.get('referer'),
    ip: req.ip,
    timestamp: new Date().toISOString()
  });
  next();
});

// ETAPA 3: Middleware de proteção CSRF personalizado
app.use((req, res, next) => {
  console.log('🛡️ [CSRF-CUSTOM] Verificação personalizada:', {
    path: req.path,
    method: req.method,
    hasAuthCookie: !!req.cookies['auth-token'],
    timestamp: new Date().toISOString()
  });

  // Pular CSRF para rotas de autenticação inicial e métodos seguros
  if (req.path === '/api/auth/login' || 
      req.path === '/api/auth/register' || 
      req.path === '/api/auth/logout' ||
      req.path === '/api/auth/refresh' ||
      req.path.startsWith('/api/auth/google') ||
      req.method === 'GET' ||
      req.method === 'HEAD' ||
      req.method === 'OPTIONS') {
    console.log('🛡️ [CSRF-CUSTOM] Pulando para:', req.method, req.path);
    return next();
  }
  
  // Para requests com cookies (usuários autenticados), verificar origem
  if (req.cookies['auth-token']) {
    console.log('🛡️ [CSRF-CUSTOM] Usuário autenticado, verificando origem...');
    const origin = req.get('origin');
    const referer = req.get('referer');
    const allowedOrigins = [
      process.env.FRONTEND_URL || 'http://localhost:3000',
      process.env.FRONTEND_URL_NETWORK || 'http://192.168.0.252:3000'
    ];
    
    console.log('🛡️ [CSRF-CUSTOM] Verificação de origem:', {
      origin,
      referer,
      allowedOrigins
    });
    
    // Verificar se a origem é confiável
    if (!origin && !referer) {
      console.log('❌ [CSRF-CUSTOM] Origem ausente - retornando 403');
      return res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_MISSING_ORIGIN',
          message: 'Origin header required'
        }
      });
    }
    
    const requestOrigin = origin || (referer ? new URL(referer).origin : '');
    if (!allowedOrigins.includes(requestOrigin)) {
      console.log('❌ [CSRF-CUSTOM] Origem inválida - retornando 403:', {
        requestOrigin,
        allowedOrigins
      });
      return res.status(403).json({
        success: false,
        error: {
          code: 'CSRF_INVALID_ORIGIN',
          message: 'Invalid origin'
        }
      });
    }
    
    console.log('✅ [CSRF-CUSTOM] Origem válida');
  }
  
  next();
});

// Rate limiting global
app.use((_req, res, next) => {
  // Header para indicar limite de requests (informativo)
  res.set('X-RateLimit-Limit', '1000');
  next();
});

// Health check endpoint
app.get('/health', async (_req, res) => {
  try {
    const schedulerStatus = await schedulerHealthCheck.getStatus();
    
    res.json({ 
      status: 'OK', 
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
      services: {
        scheduler: schedulerStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'ERROR',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// SECURITY: Rate limiting
app.use('/api/', apiLimiter); // General API rate limiting
app.use('/api/auth/login', authLimiter); // Stricter auth rate limiting
app.use('/api/auth/register', authLimiter);
app.use('/api/users/reset-password', sensitiveLimiter); // Very strict for password reset

// SECURITY: CSRF Protection  
app.use('/api', generateCSRFToken); // Generate CSRF tokens for all API requests
// CSRF validation com exceções para rotas de autenticação
app.use((req, res, next) => {
  // Log para debug do erro 400
  if (req.method === 'PUT' && req.path.includes('/tasks/')) {
    console.log('🔍 [MIDDLEWARE] PUT /tasks detectado:', {
      path: req.path,
      method: req.method,
      hasCSRFToken: !!req.get('x-csrf-token'),
      csrfToken: req.get('x-csrf-token')?.substring(0, 20) + '...',
      bodyKeys: Object.keys(req.body || {}),
      timestamp: new Date().toISOString()
    });
  }
  
  // Pular validação CSRF para rotas de autenticação e token CSRF
  if (req.path === '/api/csrf-token' ||
      req.path === '/api/auth/login' || 
      req.path === '/api/auth/register' || 
      req.path === '/api/auth/logout' ||
      req.path === '/api/auth/refresh' ||
      req.path.startsWith('/api/auth/google') ||
      req.path.includes('/attachments') || // Permitir anexos sem CSRF por enquanto
      req.path === '/api/push-subscriptions/test') { // Permitir teste de push sem CSRF
    return next();
  }
  // Aplicar validação CSRF para outras rotas
  return validateCSRF(req, res, next);
});

// CSRF Token endpoint
app.get('/api/csrf-token', getCSRFToken);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/tasks', attachmentRoutes); // Anexos específicos para tarefas
app.use('/api/projects', projectRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/users', userRoutes);
app.use('/api/reminders', reminderRoutes);
app.use('/api/scheduler', schedulerRoutes);
app.use('/api/push-subscriptions', pushSubscriptionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/achievements', achievementRoutes);
app.use('/api/habit-streak', habitStreakRoutes);
app.use('/api/daily-progress', dailyProgressRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Endpoint não encontrado',
    path: req.originalUrl,
    method: req.method
  });
});

// Global error handler (must be last)
app.use(errorHandler);

// Iniciar agendadores
DailyTaskScheduler.start();
reminderScheduler.start();

console.log('🔔 Reminder Scheduler configurado e iniciado');

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🔄 Encerrando servidor...');
  DailyTaskScheduler.stop();
  reminderScheduler.stop();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 Encerrando servidor...');
  DailyTaskScheduler.stop();
  reminderScheduler.stop();
  await prisma.$disconnect();
  process.exit(0);
});

const PORT = env.PORT;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🌐 Network: http://192.168.0.252:${PORT}/health`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
});

export default app;