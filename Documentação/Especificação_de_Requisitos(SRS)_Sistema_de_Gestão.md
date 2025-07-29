### **Documento de Especificação de Requisitos (SRS): Sistema de Gestão "Cérebro-Compatível"**

**Versão: 1.2 (Revisado e Alinhado)** **Data:** 26 de julho de 2025  
**Proprietário do Produto:** \[Seu Nome\]  
**Arquiteto Conceitual:** Dra. Helena

### **1\. Visão Geral e Filosofia do Produto**

#### **1.1. Propósito**

Este documento descreve os requisitos funcionais e não-funcionais para um sistema de gerenciamento de tarefas (SMT) projetado sob medida para um usuário com perfil neurodivergente (TDAH e ansiedade). O objetivo é criar uma ferramenta que funcione como uma "prótese cognitiva" e um assistente compassivo, em vez de um sistema de produtividade tradicional que pode gerar sobrecarga e culpa.

#### **1.2. Filosofia Central**

A ferramenta não deve ser um "chefe" que exige e pune, mas sim um **"assistente gentil e inteligente"**. Seu sucesso não é medido pela produtividade máxima, mas pela **consistência de uso, redução de estresse e aumento da autocompaixão do usuário**.

#### **1.3. Glossário de Conceitos Chave**

* **Tijolo:** Uma tarefa única, concreta e acionável. A menor unidade de trabalho.
* **Montanha:** Um projeto grande e complexo, composto por múltiplos "tijolos".
* **Modo Bombeiro:** O estado mental de execução focada em tarefas diárias e urgentes. A tela principal da ferramenta.
* **Modo Arquiteto:** O estado mental de planejamento, visão de longo prazo e organização de projetos. Uma seção separada da ferramenta.
* **O Pátio (Caixa de Areia):** Um espaço seguro para externalizar pensamentos, emoções e ideias brutas sem a pressão de agir.
* **RSD (Disforia Sensível à Rejeição):** A dor emocional aguda percebida diante de falhas, críticas ou rejeição. A ferramenta deve ser projetada para minimizar os gatilhos de RSD.

### **2\. Requisitos Não-Funcionais (UI/UX e Princípios de Design)**

#### **2.1. Estética Visual**

* **Paleta de Cores:** Suave e calma. O ambiente principal pode usar um off-white ou cinza claro. "O Pátio" deve ter um tema distinto e ainda mais relaxante (ex: bege, verde-sálvia). Cores de alerta (amarelo, laranja) devem ser usadas com moderação e nunca de forma agressiva. **Evitar vermelho punitivo.**
* **Tipografia:** Primariamente uma fonte sans-serif limpa e de alta legibilidade (ex: Inter, Lato). No "Pátio", pode-se usar uma fonte serifada confortável (ex: Lora, Merriweather) para dar uma sensação de "diário pessoal".
* **Iconografia:** Ícones devem ser amigáveis, arredondados e intuitivos. O uso de emojis é incentivado para adicionar personalidade e apelo visual (ex: 🏗️ para projetos, 🧱 para tarefas).

#### **2.2. Experiência de Interação (UX)**

* **Animações:** Devem ser fluidas, rápidas e recompensadoras, nunca abruptas. A conclusão de uma tarefa é o ponto mais importante para uma animação satisfatória (o "hit de dopamina").
* **Feedback ao Usuário:** A linguagem da ferramenta deve ser sempre validante, gentil e encorajadora. Em vez de "Erro: Limite atingido", usar "Excelente planejamento! O limite para hoje foi alcançado."
* **Performance:** A aplicação deve ser extremamente rápida. Qualquer atraso ou lentidão no carregamento aumenta a fricção e o risco de abandono.

### **3\. Arquitetura da Informação e Módulos Funcionais**

#### **3.1. Visão Geral da Arquitetura**

O sistema é dividido em três áreas principais:

1.  **O Painel do Bombeiro (Dashboard Diário)**
2.  **A Aba do Arquiteto (Hub de Projetos e Planejamento Futuro)**
3.  **O Pátio (Caixa de Areia Mental)**

#### **3.2. Módulo de Tarefas e Projetos**

##### **3.2.1. Fluxo de Criação de Tarefa**

1.  **Gatilho:** Usuário clica no botão global "+".
2.  **Passo 1 (Captura):** Modal simples com um campo: "O que está na sua mente?".
3.  **Passo 2 (Triagem Padrão):** O texto é salvo automaticamente como uma nota livre em "O Pátio", removendo o atrito da decisão. O fluxo de captura se encerra aqui.
4.  **Passo 3 (Promoção Opcional):** A qualquer momento, o usuário pode abrir a nota no "Pátio" e clicar em ✨ **Transformar em Ação** para iniciar o fluxo de classificação.
5.  **Passo 4 (Classificação da Ação):** Se ✨ **Transformar em Ação** for selecionado:
    * **Pergunta:** "Isto é um 'Tijolo' ou uma 'Montanha'?"
        * 🧱 Tarefa Simples: Continua o fluxo.
        * 🏗️ Projeto Grande: Redireciona para o fluxo de criação de um novo "Contêiner de Projeto" na Aba do Arquiteto.
    * **Pergunta:** "Para quando é isso?"
        * 🔥 Para Hoje: Envia a tarefa para o "Painel do Bombeiro" do dia, se houver "orçamento de energia" disponível.
        * 📅 Agendar para o Futuro: Abre um calendário para o usuário selecionar uma data. A tarefa fica em "hibernação" até o dia selecionado, quando aparecerá automaticamente no "Painel do Bombeiro".

##### **3.2.2. O Orçamento de Energia Diário**

* **Lógica:** O limite de tarefas diárias é baseado em pontos, não em quantidade.
* **Regras de Negócio:**
    * Cada tarefa possui uma etiqueta de "Nível de Energia" com um valor: 🔋 Bateria Fraca (1 pt), 🧠 Cérebro Normal (3 pts), ⚡️ Cérebro Ligado (5 pts).
    * O usuário define um "Orçamento de Pontos" diário (recomendação inicial: 10-12 pts).
    * O sistema soma os pontos das tarefas agendadas para um dia e impede o agendamento de novas tarefas se o orçamento for excedido.

##### **3.2.3. O Contêiner de Projeto**

* **Lógica:** Um hub central para cada projeto grande, localizado na "Aba do Arquiteto".
* **Regras de Negócio:**
    * Um projeto contém um "Backlog de Tijolos" (lista de micro-tarefas).
    * Um projeto contém uma **"Área de Anotações do Projeto"**, um espaço de texto livre para brainstorming e notas contextuais que não poluem "O Pátio" global.
    * Cada tijolo no backlog possui um botão 🧱 **Tornar o Próximo Tijolo** que o move para o "Painel do Bombeiro" de um dia específico.

#### **3.3. Módulo de Alívio: O Pátio (Caixa de Areia)**

* **Lógica:** Um espaço seguro para externalizar pensamentos não-estruturados.
* **Regras de Negócio:**
    * As notas não têm status, prazo ou notificação.
    * O usuário pode **Editar**, **Apagar Permanentemente** e **Arquivar** notas. Notas arquivadas vão para uma área de arquivo pesquisável.
    * O botão ✨ **Transformar em Ação** permite promover uma nota a uma tarefa estruturada (iniciando o fluxo 3.2.1, Passo 4).

### **4\. Protocolos de Exceção e Lógica Inteligente**

#### **4.1. Protocolo de Baixa Energia**

* **Gatilho:** Usuário clica em 🔋 **Não consigo começar hoje...** no "Painel do Bombeiro".
* **Lógica:** Abre um modal validante com três opções:
    1.  **Substituir:** Troca uma tarefa difícil por uma da lista pré-definida de "Bateria Fraca".
    2.  **Desabafar:** Leva o usuário diretamente para "O Pátio".
    3.  **Adiar o Dia:** Move todas as tarefas do dia para a **"Sala de Repanejamento"**.
* **Regra de Negócio:** A "Sala de Repanejamento" é um buffer. No dia seguinte, o usuário é convidado a "puxar" tarefas de lá para sua nova lista diária, misturando-as com tarefas novas se desejar.

#### **4.2. Protocolo de Decomposição**

* **Gatilho:** Uma tarefa é adiada na "Sala de Repanejamento" por 3 vezes.
* **Lógica:** A ferramenta força uma reavaliação da "tarefa-fantasma", guiando o usuário para quebrá-la em seu primeiro "tijolo" e transformando a tarefa original em um "Contêiner de Projeto".

#### **4.3. Protocolo de Incêndio**

* **Gatilho:** Tentativa de adicionar uma tarefa urgente a um dia com o orçamento de energia já cheio.
* **Lógica:** A ferramenta força o usuário a uma decisão estratégica, pedindo que ele escolha qual das tarefas planejadas será movida para a "Sala de Repanejamento" para abrir espaço para a urgência.

#### **4.4. Protocolo Sentinela (Follow-up)**

* **Gatilho:** Usuário completa uma tarefa que implica delegação (contém palavras-chave como "enviar para", "pedir a").
* **Lógica:** O sistema pergunta se ele está aguardando uma resposta. Se sim, permite configurar um prazo. No dia do prazo, se nenhuma ação foi tomada, cria automaticamente uma tarefa de "check-in" no "Painel do Bombeiro", já com um template de mensagem gentil.

#### **4.5. Protocolo de Prazos**

* **Gatilho:** Um projeto ou tarefa tem um "Prazo Final" definido.
* **Lógica:** O sistema agenda uma série de "toques" com intensidade progressiva (nota no Pátio, alerta visual, tarefa automática), transformando a urgência futura em ação planejada hoje.

#### **4.6. Protocolo de Revisão Semanal**

* **Gatilho:** Notificação gentil na sexta-feira à tarde.
* **Lógica:** Abre um template no "Pátio" com perguntas para avaliar o bem-estar e a carga de trabalho da semana, permitindo que o usuário faça ajustes experimentais no seu "Orçamento de Energia Diário".

### **5\. Arquitetura de Dados (Modelo Conceitual)**

* **Users**: userId, name, settings (ex: dailyEnergyBudget, theme).
* **Projects**: projectId, userId, name, icon, deadline, status (active, archived), projectNotesContent.
* **Tasks (Tijolos)**: taskId, userId, projectId (pode ser nulo), description, status (backlog, today, done, reprioritized), energyPoints, dueDate, delegatedTo, followUpDate, postponedCount.
* **Notes (Pátio)**: noteId, userId, content, creationDate, status (active, archived).