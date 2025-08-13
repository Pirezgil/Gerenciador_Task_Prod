# Manifesto do Projeto: Gerenciador_Task

## 1. Visão Geral e Filosofia

* **Produto:** Sistema de gerenciamento de tarefas e hábitos com foco em neurodivergência, oferecendo diferentes modos de trabalho ("Bombeiro", "Arquiteto", "Caixa de Areia") e gamificação através de sistema de energia, recompensas e lembretes inteligentes.
* **Arquitetura Principal:** Arquitetura Full-Stack separada em Frontend (Next.js) e Backend (Express/Node.js) comunicando-se via API RESTful, com banco de dados PostgreSQL gerenciado pelo Prisma ORM.
* **Princípio Chave:** A lógica de negócio reside exclusivamente na camada de `services` do backend. Os controladores servem apenas como interface entre as rotas e os serviços, garantindo separação clara de responsabilidades.

## 2. Stack Tecnológica

* **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Zustand (gerenciamento de estado), React Query/TanStack Query (cache e sincronização), Framer Motion (animações), Radix UI (componentes)
* **Backend:** Node.js, Express, TypeScript, Prisma ORM, Zod (validação), JWT (autenticação), Helmet (segurança), CORS, Morgan (logging)
* **Banco de Dados:** PostgreSQL com schema complexo gerenciando usuários, tarefas, hábitos, projetos, lembretes, conquistas e notificações push
* **Autenticação:** JWT com suporte a OAuth2 (Google), sistema de reset de senha por email, e autenticação específica para "Caixa de Areia"

## 3. Mapeamento de Diretórios Críticos

* `backend/prisma/schema.prisma`: Schema central do banco de dados definindo todos os modelos (User, Task, Habit, Project, Reminder, etc.) com relacionamentos complexos e índices para performance
* `backend/src/routes/`: Definição das rotas da API REST organizadas por domínio (tasks, habits, projects, auth, reminders, etc.) com middleware de autenticação e validação
* `backend/src/controllers/`: Camada de interface que recebe requisições HTTP, extrai dados, chama serviços apropriados e padroniza respostas da API
* `backend/src/services/`: Lógica de negócio pura incluindo regras complexas como cálculo de lembretes, tarefas recorrentes, sistema de conquistas e agendamento de notificações
* `src/app/(main)/`: Páginas principais do sistema organizadas por contexto (bombeiro, arquiteto, caixa-de-areia, tarefas, hábitos, lembretes, recompensas, etc.)
* `src/components/`: Componentes React organizados por domínio e reutilização (shared, bombeiro, arquiteto, auth, habits, reminders, rewards, protocols)
* `src/hooks/api/`: Custom hooks para integração com React Query, cada um responsável por um domínio específico (useTasks, useHabits, useReminders, etc.)
* `src/stores/`: Stores Zustand para gerenciamento de estado global (authStore, tasksStore, habitsStore, remindersStore, themeStore, etc.)

## 4. Fluxos de Trabalho Comuns (Como Fazer as Coisas)

* **Para Adicionar um Novo Endpoint de API:**
    1. Criar/atualizar a função no `service` correspondente (ex: `taskService.ts`) implementando a lógica de negócio
    2. Criar/atualizar função no `controller` (ex: `tasksController.ts`) para processar requisição e chamar o service
    3. Adicionar rota no arquivo de `routes` (ex: `tasks.ts`) com middleware de autenticação e validação apropriados
    4. Definir schema de validação com Zod no arquivo `validation.ts` se necessário

* **Para Alterar o Banco de Dados:**
    1. Modificar o arquivo `backend/prisma/schema.prisma` adicionando/alterando modelos e campos
    2. Executar `npx prisma migrate dev --name "nome_da_migration"` para gerar e aplicar a migração
    3. Executar `npx prisma generate` para atualizar o cliente Prisma com os novos tipos

* **Para Adicionar uma Nova Página no Frontend:**
    1. Criar pasta e arquivo `page.tsx` em `src/app/(main)/[nome-da-pagina]/`
    2. Implementar o componente da página com Server Component ou Client Component conforme necessário
    3. Adicionar navegação no componente `Navigation.tsx` se for uma página principal do sistema

## 5. Exemplo Prático de Fluxo: Criação de Tarefa

Fluxo completo desde a interface até o banco de dados para criação de uma nova tarefa:

1. **UI (Frontend):** Usuário clica no botão "Nova Tarefa" em `BombeiroPage.tsx` ou `TasksPageClient.tsx`, abrindo o modal `NewTaskModal.tsx`

2. **Hook/Estado (Frontend):** O modal utiliza o hook `useCreateTask()` do arquivo `useTasks.ts` que gerencia o estado da mutação com React Query

3. **API Call (Frontend):** Hook chama `tasksApi.createTask()` definido em `lib/api.ts` fazendo POST para `/api/tasks` com os dados da tarefa

4. **Rota (Backend):** Request é recebida em `routes/tasks.ts` na rota `router.post('/', validate(createTaskSchema), tasksController.createTask)` aplicando validação e autenticação

5. **Controller (Backend):** `tasksController.createTask()` extrai dados da requisição, valida userId da autenticação, e chama `taskService.createTask()`

6. **Serviço (Backend):** `taskService.createTask()` implementa a lógica de negócio: valida dados, calcula energia, cria tarefa no Prisma, dispara serviços de conquistas e lembretes se configurados

7. **Resposta e Atualização da UI:** Backend retorna tarefa criada, React Query invalida cache de tarefas, modal fecha automaticamente, e lista de tarefas é atualizada em tempo real com a nova tarefa visível