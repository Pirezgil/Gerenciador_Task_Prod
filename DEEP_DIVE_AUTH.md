# Deep Dive: Fluxo de Autenticação e Segurança

Este documento detalha todos os componentes e a lógica envolvidos nos processos de autenticação do Gerenciador_Task.

## 1. Login de Usuário (Email/Senha)

| Camada  | Arquivo                               | Função/Middleware Principal | Descrição da Responsabilidade                                      |
| :------ | :------------------------------------ | :-------------------------- | :----------------------------------------------------------------- |
| Rota    | `backend/src/routes/auth.ts`          | `router.post('/login', authRateLimit, validate(loginSchema), ...)` | Recebe requisições POST para `/api/auth/login`, aplica rate limiting para prevenir ataques de força bruta, valida dados com Zod schema |
| Controle| `backend/src/controllers/authController.ts` | `login()`                   | Extrai dados do corpo da requisição, chama serviço de login, processa logs de segurança, limpa tentativas de rate limit em caso de sucesso, padroniza resposta da API |
| Serviço | `backend/src/services/authService.ts` | `loginUser()`               | Busca usuário por email no DB, executa hash bcrypt para verificação de senha com timing consistente (150ms mínimo), valida credenciais, gera token JWT, retorna dados do usuário e configurações |
| Frontend| `src/hooks/api/useAuth.ts`   | `useLogin()`                | Hook React Query que gerencia mutação de login, salva token JWT no localStorage após sucesso, atualiza cache global com dados do usuário, invalida todas as queries para refresh |
| UI      | `src/components/auth/LoginForm.tsx` | `onSubmit()` / `handleSubmit()` | Formulário React controlado que valida campos obrigatórios, chama hook useLogin via mutação assíncrona, exibe notificações de sucesso/erro, redireciona para página principal após login |

## 2. Geração e Validação de Token (JWT)

| Ação                | Arquivo                                | Função/Middleware Principal | Descrição da Responsabilidade                                     |
| :------------------ | :------------------------------------- | :-------------------------- | :---------------------------------------------------------------- |
| Geração do Token    | `backend/src/lib/jwt.ts`  | `generateToken()`| Cria token JWT assinado com payload contendo userId e email, utiliza JWT_SECRET do ambiente, define expiração configurável (padrão 7 dias), retorna string token |
| Validação (Middleware)| `backend/src/middleware/auth.ts`| `authenticate()`       | Extrai token do header Authorization (Bearer), verifica assinatura e expiração usando jwt.verify(), busca usuário no DB para confirmar existência, adiciona userId e dados do user à requisição para uso nas rotas protegidas |
| Verificação de Token| `backend/src/lib/jwt.ts`  | `verifyToken()`| Função utilitária que usa jwt.verify() para validar token, decodifica payload, trata erros de token expirado/inválido, retorna payload tipado com userId e email |
| Utilitários JWT| `backend/src/lib/jwt.ts`  | `isTokenExpired()`, `getTokenExpiration()`| Funções auxiliares para verificar expiração de token sem validar assinatura, decodifica payload para extrair campo 'exp', compara com timestamp atual |

## 3. Cadastro de Novo Usuário

| Camada  | Arquivo                               | Função/Middleware Principal | Descrição da Responsabilidade                                      |
| :------ | :------------------------------------ | :-------------------------- | :----------------------------------------------------------------- |
| Rota    | `backend/src/routes/auth.ts`          | `router.post('/register', authRateLimit, validate(registerSchema), ...)` | Recebe POST para `/api/auth/register`, aplica rate limiting, valida dados com schema Zod (nome, email, senha), executa middleware de validação de estrutura |
| Controle| `backend/src/controllers/authController.ts` | `register()`                | Extrai dados validados do corpo da requisição (RegisterRequest), chama serviço de registro, processa logs de segurança para auditoria, limpa tentativas de rate limit, padroniza resposta de sucesso |
| Serviço | `backend/src/services/authService.ts` | `registerUser()`            | Verifica se email já existe (com timing consistente), faz hash bcrypt da senha com 12 rounds, cria usuário via Prisma com configurações padrão (dailyEnergyBudget: 12, sandbox desabilitado), gera token JWT para login automático |
| Frontend| `src/hooks/api/useAuth.ts`   | `useRegister()`             | Hook React Query para mutação de registro, salva token no localStorage após sucesso, atualiza cache com dados do novo usuário, invalida queries globalmente para sincronização |
| UI      | `src/app/register/page.tsx` | `handleSubmit()`           | Página de registro com formulário React controlado, valida confirmação de senha no frontend, chama hook useRegister, exibe feedback visual de loading/erro, redireciona automaticamente após sucesso |

## 4. Fluxo de Recuperação de Senha

### 4.1. Solicitação de Redefinição

| Camada  | Arquivo                               | Função Principal          | Descrição da Responsabilidade                                      |
| :------ | :------------------------------------ | :------------------------ | :----------------------------------------------------------------- |
| Rota    | `backend/src/routes/auth.ts`          | `router.post('/forgot-password', checkPasswordResetRateLimit, validate(forgotPasswordSchema), ...)` | Recebe POST para `/api/auth/forgot-password`, aplica rate limiting específico para reset de senha, valida email com Zod schema |
| Controle| `backend/src/controllers/authController.ts` | `forgotPassword()`        | Extrai email da requisição, chama serviço de reset, processa logs de segurança, limpa rate limit em sucesso, retorna sempre mensagem genérica (não revela se email existe) |
| Serviço | `backend/src/services/passwordResetService.ts` | `requestPasswordReset()` | Gera token seguro de 32 bytes com crypto.randomBytes, faz hash bcrypt do token, busca usuário por email (sempre executa para timing consistente), salva token hasheado e expiração (1 hora) no DB, envia email via emailService |
| Frontend| `src/app/auth/forgot-password/page.tsx`| `handleSubmit()` | Página de esqueci senha com formulário simples, valida email obrigatório, faz chamada direta para API via lib/api, exibe tela de sucesso genérica, não revela se email existe no sistema |
| Email   | `backend/src/services/emailService.ts` | `sendPasswordResetEmail()`| Compõe email com link contendo token plano (não hasheado), configura template HTML/text, execução em background (fire and forget) para não bloquear resposta |

### 4.2. Execução da Redefinição

| Camada  | Arquivo                               | Função Principal          | Descrição da Responsabilidade                                      |
| :------ | :------------------------------------ | :------------------------ | :----------------------------------------------------------------- |
| Rota    | `backend/src/routes/auth.ts`          | `router.post('/reset-password', validate(resetPasswordSchema), ...)`  | Recebe POST para `/api/auth/reset-password`, valida token, nova senha e confirmação com Zod |
| Rota (Validação)| `backend/src/routes/auth.ts`    | `router.get('/validate-reset-token', ...)`| Endpoint GET para validar token antes do usuário preencher formulário, usado para UX melhorada |
| Controle| `backend/src/controllers/authController.ts` | `resetPassword()`         | Extrai token e senhas da requisição, chama serviço de reset, processa logs de segurança, limpa dados sensíveis, confirma redefinição bem-sucedida |
| Controle (Validação)| `backend/src/controllers/authController.ts` | `validateResetToken()` | Valida token fornecido sem alterar dados, retorna boolean indicando se token é válido e não expirado |
| Serviço | `backend/src/services/passwordResetService.ts` | `resetPassword()` | Busca usuários com tokens não expirados, compara token fornecido com hashes no DB (timing constante), valida força da senha, faz hash bcrypt da nova senha, atualiza senha e limpa tokens de reset |
| Serviço (Validação)| `backend/src/services/passwordResetService.ts` | `validateResetToken()` | Função utilitária que verifica se token existe e não expirou sem revelar qual usuário, executa comparação bcrypt em todos os tokens candidatos |
| Frontend| `src/app/auth/reset-password/page.tsx`| `handleSubmit()` / `useEffect()` | Página com validação automática de token na montagem, formulário para nova senha com requisitos visuais, validação client-side de força da senha, telas distintas para token inválido/sucesso |

## 5. Autenticação OAuth (Google)

| Camada  | Arquivo                               | Função Principal          | Descrição da Responsabilidade                                      |
| :------ | :------------------------------------ | :------------------------ | :----------------------------------------------------------------- |
| Rota    | `backend/src/routes/auth.ts`          | `router.get('/google', ...)` | Inicia fluxo OAuth redirecionando para Google com scopes de email e perfil |
| Rota (Callback)| `backend/src/routes/auth.ts`    | `router.get('/google/callback', ...)` | Recebe código de autorização do Google após usuário autorizar |
| Controle| `backend/src/controllers/authController.ts` | `googleAuth()`            | Gera URL de autorização do Google e redireciona usuário |
| Controle (Callback)| `backend/src/controllers/authController.ts` | `googleCallback()` | Processa código recebido, valida com Google, cria/busca usuário, redireciona para frontend com token |
| Serviço | `backend/src/services/googleAuthService.ts` | `verifyGoogleToken()` | Troca código por tokens com Google API, valida ID token recebido, extrai dados do usuário (email, nome, foto) |
| Serviço | `backend/src/services/googleAuthService.ts` | `findOrCreateGoogleUser()` | Busca usuário existente por email ou googleId, cria novo usuário se não existir, atualiza dados do Google em usuário existente, gera token JWT |
| Frontend| `src/components/auth/SocialLogin.tsx` | Botão de login Google | Componente que redireciona para `/api/auth/google` para iniciar fluxo OAuth |
| Frontend (Callback)| `src/app/auth/callback/page.tsx` | Processamento de callback | Página que recebe token e dados do usuário via URL params após OAuth, salva no localStorage e redireciona |

## 6. Middleware de Segurança

| Middleware | Arquivo | Função Principal | Descrição da Responsabilidade |
| :--------- | :------ | :--------------- | :--------------------------- |
| Rate Limiting (Auth) | `backend/src/middleware/authRateLimit.ts` | `authRateLimit` | Limita tentativas de login/registro por IP (5 tentativas em 15 minutos), armazena em memória, previne ataques de força bruta |
| Rate Limiting (Password) | `backend/src/middleware/passwordResetRateLimit.ts` | `checkPasswordResetRateLimit` | Rate limiting específico para reset de senha (3 tentativas em 15 minutos), mais restritivo que auth normal |
| Error Handler | `backend/src/middleware/errorHandler.ts` | `errorHandler` | Middleware global de tratamento de erros, sanitiza mensagens sensíveis em produção, padroniza formato de resposta de erro |
| Security Logger | `backend/src/lib/secureLogger.ts` | `info()`, `warn()` | Sistema de logs de segurança que registra eventos de autenticação, sanitiza dados sensíveis em produção, inclui metadados como IP e user agent |

## 7. Estado Global e Persistência (Frontend)

| Componente | Arquivo | Função Principal | Descrição da Responsabilidade |
| :--------- | :------ | :--------------- | :--------------------------- |
| Auth Store | `src/stores/authStore.ts` | Zustand store | Gerencia estado de autenticação global, persiste dados do usuário, sincroniza com localStorage, mantém dados de sandbox security |
| Auth Middleware | `src/components/auth/AuthMiddleware.tsx` | Proteção de rotas | HOC que verifica autenticação, redireciona usuários não autenticados, inicializa estado de auth na montagem da aplicação |
| Query Client | `src/lib/queryClient.ts` | Cache management | Configuração do React Query com interceptador de requests, adiciona token Bearer automaticamente, gerencia invalidação de cache |
| API Client | `src/lib/api.ts` | HTTP client | Cliente Axios configurado com baseURL, interceptors de request/response, tratamento automático de tokens expirados |

## 8. Validação e Schemas

| Tipo | Arquivo | Schema Principal | Descrição |
| :--- | :------ | :--------------- | :-------- |
| Login | `backend/src/lib/validation.ts` | `loginSchema` | Valida email (formato válido) e password (obrigatório) |
| Registro | `backend/src/lib/validation.ts` | `registerSchema` | Valida name (string), email (formato) e password (mínimo 6 caracteres) |
| Reset Password | `backend/src/lib/validation.ts` | `forgotPasswordSchema` | Valida apenas email obrigatório |
| New Password | `backend/src/lib/validation.ts` | `resetPasswordSchema` | Valida token, password e confirmPassword (mínimo 8 caracteres) |
| User Update | `backend/src/lib/validation.ts` | `updateUserSchema` | Valida campos opcionais para atualização de perfil (name, avatarUrl) |

## 9. Medidas de Segurança Implementadas

### Proteção Contra Timing Attacks
- **Login**: Sempre executa bcrypt.compare mesmo com usuário inexistente, tempo mínimo de 150ms
- **Registro**: Hash dummy para usuário já existente, tempo consistente de resposta
- **Reset Password**: Operações de hash mesmo para emails inexistentes, 200ms mínimo

### Rate Limiting
- **Autenticação**: 5 tentativas por IP em 15 minutos
- **Password Reset**: 3 tentativas por IP em 15 minutos
- **Limpeza automática**: Rate limit removido após sucesso

### Segurança de Senhas
- **Hash**: bcrypt com 12 rounds (configurável via BCRYPT_ROUNDS)
- **Validação**: Mínimo 8 caracteres para reset, 6 para registro
- **Reset Tokens**: Crypto.randomBytes(32) com hash bcrypt, expiração 1 hora

### Logs de Segurança
- **Eventos monitorados**: Login, registro, reset de senha, falhas de autenticação
- **Dados registrados**: userId, email, IP, user agent, timestamps
- **Sanitização**: Remoção de dados sensíveis em produção

### JWT Security
- **Expiração**: 7 dias configurável
- **Payload mínimo**: Apenas userId e email
- **Validação**: Verificação de assinatura e usuário ativo no DB
- **Storage**: localStorage no frontend com limpeza em logout