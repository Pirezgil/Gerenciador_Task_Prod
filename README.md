# Sistema Gerenciador de Tarefas

Sistema completo de gerenciamento de tarefas desenvolvido com Next.js e Node.js.

## 🚀 Tecnologias

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Node.js, Express, TypeScript
- **Banco de Dados**: PostgreSQL com Prisma ORM
- **Autenticação**: JWT + OAuth Google
- **Notificações**: Push Notifications (Web Push)
- **Deploy**: Docker, Railway

## 📦 Instalação e Execução

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd backend
npm install
npm run dev
```

### Banco de Dados
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
npx prisma db seed
```

## 🌐 URLs

- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001
- **Banco**: PostgreSQL (configurar DATABASE_URL)

## 📱 Funcionalidades

✅ Gerenciamento de tarefas com energia  
✅ Sistema de projetos  
✅ Lembretes inteligentes  
✅ Notificações push  
✅ Autenticação segura  
✅ Tema escuro/claro  
✅ Sistema de recompensas  
✅ Hábitos e streaks  

## 🔧 Configuração

Copie os arquivos `.env.example` e configure as variáveis de ambiente necessárias.

---
Sistema preparado para produção ✨