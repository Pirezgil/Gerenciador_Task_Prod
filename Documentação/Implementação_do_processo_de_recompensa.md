● Sistema de Recompensas Motivacional para TDAH

  Projetado pela Dra. Elara Vance - Psicóloga Clínica & Desenvolvedora Full-Stack

  ---
  Parte 1: Design Conceitual do Sistema de Medalhas

  1. Conclusão de Tarefa Individual: "Faísca de Conquista"

  a) Nome da Medalha: "Faísca de Conquista" ⚡

  b) Design Visual:
  - Forma: Círculo com bordas douradas e um centro que emite pequenas partículas brilhantes
  - Cor: Gradiente do amarelo-ouro ao laranja vibrante
  - Elemento Central: Um raio estilizado que pulsa suavemente
  - Tamanhos: 3 variações baseadas nos energyPoints (1, 3, 5):
    - 1 ponto: Faísca Bronze (tons mais terrosos, partículas menores)
    - 3 pontos: Faísca Prata (brilho metálico, partículas médias)
    - 5 pontos: Faísca Ouro (brilho intenso, partículas abundantes)

  c) Justificativa Psicológica:
  O nome "Faísca" evoca instantaneidade e energia, crucial para o cérebro TDAH que precisa de gratificação imediata. As partículas
  visuais criam movimento constante, mantendo o interesse visual. A diferenciação por energyPoints oferece progressão clara,
  combatendo a "cegueira do tempo" ao mostrar visualmente que diferentes tarefas têm diferentes valores.

  2. Conclusão de Projeto: "Arquiteto de Sonhos"

  a) Nome da Medalha: "Arquiteto de Sonhos" 🏗️

  b) Design Visual:
  - Forma: Hexágono cristalino com camadas translúcidas sobrepostas
  - Cor: Gradiente do azul-safira ao violeta profundo
  - Elemento Central: Uma estrutura arquitetônica abstrata que se "constrói" em animação
  - Detalhes: Reflexos prismáticos que se movem quando visualizada
  - Bordas: Linhas de circuito dourado que se iluminam em sequência

  c) Justificativa Psicológica:
  "Arquiteto de Sonhos" conecta o usuário ao conceito de construção e realização de algo maior, fundamental para manter motivação em
  projetos longos. O formato hexagonal representa estrutura e organização, ajudando o cérebro TDAH a visualizar ordem no caos. A
  animação de "construção" oferece feedback visual contínuo do progresso.

  3. Mestre do Dia: "Imperador da Jornada"

  a) Nome da Medalha: "Imperador da Jornada" 👑

  b) Design Visual:
  - Forma: Coroa imperial estilizada com cristais flutuantes ao redor
  - Cor: Gradiente do dourado imperial ao vermelho rubi
  - Elemento Central: Um sol radiante que pulsa com luz dourada
  - Detalhes: 24 pequenos cristais orbitando (representando as horas do dia)
  - Animação: A coroa "materializa-se" com partículas douradas convergindo

  c) Justificativa Psicológica:
  O título "Imperador" evoca poder e controle, especialmente importante para quem sente frequentemente que perdeu o controle do tempo
   e das tarefas. A representação das 24 horas como cristais oferece uma visualização tangível do tempo dominado, combatendo a
  percepção distorcida de tempo típica do TDAH.

  4. Lenda da Semana: "Guardião do Tempo"

  a) Nome da Medalha: "Guardião do Tempo" ⏳

  b) Design Visual:
  - Forma: Ampulheta cósmica envolta em nebulosas estelares
  - Cor: Gradiente do violeta cósmico ao dourado celestial
  - Elemento Central: Partículas estelares fluindo entre as duas metades da ampulheta
  - Detalhes: Constelação de 7 estrelas ao redor (representando os dias da semana)
  - Animação: As partículas fluem em loop infinito, com as estrelas pulsando em sequência

  c) Justificativa Psicológica:
  "Guardião do Tempo" transforma a relação problemática com o tempo em uma conquista épica. A ampulheta representa o domínio sobre o
  tempo, enquanto o tema cósmico eleva a conquista a um nível épico. As 7 estrelas fornecem uma representação visual clara da semana
  completa, ajudando a consolidar a sensação de conquista temporal.

  ---
  Parte 2: Design da "Página de Recompensas"

  a) Layout e Estrutura da Página

  Estrutura Principal:
  ┌─────────────────────────────────────────────────┐
  │                  HEADER                         │
  │  "Sua Jornada de Conquistas" + Stats Resumidas │
  ├─────────────────────────────────────────────────┤
  │               PAINEL PRINCIPAL                  │
  │ ┌─────────────────┐  ┌───────────────────────┐ │
  │ │   MEDALHAS      │  │    SEQUÊNCIAS DE      │ │
  │ │   RECENTES      │  │     HÁBITOS           │ │
  │ │   (Timeline)    │  │   (Streaks Visuais)   │ │
  │ └─────────────────┘  └───────────────────────┘ │
  ├─────────────────────────────────────────────────┤
  │               GALERIA DE MEDALHAS               │
  │  [Filtros: Todas | Tarefas | Projetos | Daily] │
  │   ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐ ┌───┐   │
  │   │ ⚡│ │🏗️│ │👑│ │⏳│ │ ⚡│ │🏗️│ │...│   │
  │   └───┘ └───┘ └───┘ └───┘ └───┘ └───┘ └───┘   │
  └─────────────────────────────────────────────────┘

  b) Componentes Interativos e de UX

  1. Sistema de Animações:
  - Conquista Nova: Explosão de partículas douradas + som de "ding" suave
  - Hover em Medalhas: Rotação 3D sutil + tooltip com detalhes
  - Loading States: Shimmer effect nas medalhas sendo carregadas

  2. Elementos Interativos:
  - Timeline Infinita: Scroll infinito mostrando conquistas recentes
  - Filtros Visuais: Ícones grandes e coloridos para fácil identificação
  - Modo Fullscreen: Para medalhas individuais (zoom com detalhes)
  - Compartilhamento: Botão para gerar imagem da conquista

  3. Microinterações:
  - Contadores Animados: Numbers que "contam" até o valor final
  - Progress Rings: Para mostrar progresso em direção a próximas conquistas
  - Sound Toggle: Opção para ativar/desativar sons de conquista

  c) Texto e Narrativa

  Texto de Introdução:

  "Sua Jornada de Conquistas Épicas"

  Cada tarefa concluída é uma vitória, cada projeto finalizado é uma épica conquistada. Aqui você celebra não apenas o que fez, mas
  quem você se tornou no processo.

  🌟 Suas conquistas são prova do seu poder de transformar intenção em ação.

  Estatísticas Heroicas:
  - ⚡ {taskCount} Faíscas de Conquista coletadas
  - 🏗️ {projectCount} Sonhos Arquitetados
  - 👑 {dailyMasterCount} dias como Imperador(a) da Jornada
  - ⏳ {weeklyLegendCount} semanas como Guardião(ã) do Tempo

  d) Justificativa Técnica e de Usabilidade

  Estrutura de Banco de Dados (Extensão do Schema Atual):
  model Achievement {
    id            String   @id @default(cuid())
    userId        String   @map("user_id")
    type          String   // 'task_completion', 'project_completion', 'daily_master', 'weekly_legend'
    subtype       String?  // Para tarefas: 'bronze', 'silver', 'gold' baseado em energyPoints
    relatedId     String?  @map("related_id") // ID da tarefa/projeto relacionado
    earnedAt      DateTime @default(now()) @map("earned_at")
    metadata      Json?    // Dados extras (ex: quantas tarefas completadas no dia)

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)
    @@map("achievements")
  }

  model DailyProgress {
    id                String   @id @default(cuid())
    userId            String   @map("user_id")
    date              DateTime @db.Date
    plannedTasks      Int      @default(0) @map("planned_tasks")
    completedTasks    Int      @default(0) @map("completed_tasks")
    achievedMastery   Boolean  @default(false) @map("achieved_mastery")

    user User @relation(fields: [userId], references: [id], onDelete: Cascade)
    @@unique([userId, date])
    @@map("daily_progress")
  }

  Vantagens da Estrutura:
  1. Performance: Índices otimizados para consultas por usuário e data
  2. Flexibilidade: Campo metadata em JSON para dados específicos
  3. Escalabilidade: Separação clara entre conquistas e progresso diário
  4. Simplicidade: Integra-se naturalmente com o sistema existente

  UX para TDAH - Princípios Aplicados:
  - Cognitive Load Reduzido: Máximo 3-4 elementos por linha visual
  - Feedback Imediato: Animações aparecem instantaneamente (<100ms)
  - Navegação Clara: Breadcrumbs visuais e botão "voltar" sempre visível
  - Customização: Toggle para reduzir animações (para usuários sensíveis)
  - Mobile-First: Interface otimizada para uso rápido no celular

  Implementação Técnica Recomendada:
  - Frontend: React com Framer Motion para animações fluidas
  - Estado: Zustand store dedicado para achievements (integrado com o tasksStore existente)
  - Cache: React Query para cache inteligente das medalhas
  - Imagens: SVG animado para medalhas (leve e escalável)

  O QUE JÁ FOI FEITO E O QUE FALTA

   Perfeito! A Fase 1 - Infraestrutura foi concluída com sucesso! 🎉

  Resumo do que foi implementado:

  ✅ Schema do Banco de Dados

  - Criadas tabelas Achievement e DailyProgress no Prisma
  - Relacionamentos adequados com o modelo User existente
  - Índices otimizados para consultas por usuário e data
  - Migração aplicada ao banco PostgreSQL

  ✅ Tipos TypeScript

  - Backend: /backend/src/types/achievement.ts - Tipos para APIs e serviços
  - Frontend: /src/types/achievement.ts - Tipos para componentes e estado, incluindo configurações visuais das medalhas

  ✅ Serviço de Conquistas

  - AchievementService: Sistema completo para:
    - Criar conquistas automáticas (tarefas, projetos, dias, semanas)
    - Gerenciar progresso diário
    - Calcular streaks e estatísticas
    - Verificar condições para medalhas especiais

  ✅ Integração Automática

  - taskService.ts: Conquistas criadas automaticamente ao completar tarefas
  - projectService.ts: Conquistas criadas automaticamente ao finalizar projetos
  - Sistema de progresso diário atualizado em tempo real

  ✅ APIs REST

  - /api/achievements - CRUD completo de conquistas
  - /api/achievements/rewards-page - Dados para página de recompensas
  - /api/achievements/daily-progress - Gestão do progresso diário
  - /api/achievements/stats - Estatísticas resumidas
  - Endpoints de teste para verificar condições especiais

  ---
  Sistema de Medalhas Implementado:

  ⚡ Faísca de Conquista

  - Bronze (1 ponto de energia)
  - Prata (3 pontos de energia)
  - Ouro (5 pontos de energia)

  🏗️ Arquiteto de Sonhos

  - Medalha épica por completar projetos

  👑 Imperador da Jornada

  - Medalha épica por dominar um dia completo

  ⏳ Guardião do Tempo

  - Medalha lendária por dominar uma semana inteira

  ---
  Próximos Passos (Fase 2):

  1. Testar as APIs com alguns dados
  2. Criar componentes React para exibir medalhas
  3. Implementar a página de recompensas
  4. Adicionar animações e notificações