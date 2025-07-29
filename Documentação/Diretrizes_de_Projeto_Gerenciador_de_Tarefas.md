### **Documento de Diretrizes de Projeto: Gerenciador de Tarefas "Cérebro-Compatível"**

**Versão: 1.2 (Revisado e Alinhado)** **Data:** 26 de julho de 2025  
**Autor da Análise:** Dra. Helena, Psicóloga Comportamental  
**Destinatário:** Equipe de Desenvolvimento

### **1\. Introdução e Filosofia do Produto**

Este documento detalha as especificações para o desenvolvimento de uma ferramenta de gerenciamento de tarefas personalizada. O usuário final possui um perfil neurodivergente (TDAH e ansiedade), cujas características de funcionamento tornam as ferramentas de produtividade padrão ineficazes ou até prejudiciais a longo prazo.
**Filosofia Central:** A ferramenta não deve ser um "chefe" que exige e pune, mas sim um **"assistente gentil e inteligente"**. Seu objetivo primário é **reduzir a fricção cognitiva e a carga emocional** associadas ao início e à conclusão de tarefas. O sucesso da ferramenta será medido pela sua capacidade de gerar **consistência e autocompaixão**, e não pela produtividade máxima a qualquer custo.

### **2\. Princípios Fundamentais de UX/UI (Experiência do Usuário)**

* **Clareza Acima de Complexidade:** A interface deve ser minimalista, evitando sobrecarga visual. Menos opções é melhor.
* **Recompensa Acima de Punição:** A conclusão de tarefas deve ser celebrada. A falha em completar uma tarefa deve ser tratada com neutralidade e gentileza.
* **Ação Acima de Análise:** A ferramenta deve sempre guiar o usuário para a próxima ação possível, em vez de apresentar dados e gráficos que podem levar à paralisia.
* **Novidade e Engajamento:** A interface deve ter elementos sutis de novidade para manter o interesse e combater o tédio da rotina.

### **3\. Arquitetura Central: Os Dois Modos**

A ferramenta se baseia na separação de dois ambientes de trabalho distintos para respeitar os modos de funcionamento do usuário.

* **O Painel do Bombeiro (Modo de Execução):** A tela principal e diária. Focada na ação imediata, mostrando apenas as poucas tarefas críticas do dia.
* **A Aba do Arquiteto (Modo de Planejamento):** Uma seção separada para o planejamento de alto nível, onde ficam guardados os projetos de longo prazo e as tarefas futuras.

### **4\. Especificações Funcionais Detalhadas**

#### **4.1 Módulo Principal: O Painel do Bombeiro**

* **Objetivo:** Combater a **Paralisia por Sobrecarga**.
* **Funcionalidade:**
    * Exibe um número limitado de tarefas diárias, gerenciado por um **"Orçamento de Energia Diário"** (ver 4.3).
    * Interface limpa, focada apenas nas "Missões de Hoje".

#### **4.2 Fluxo de Criação de Tarefa: A Triagem Guiada**

* **Objetivo:** Capturar pensamentos sem atrito e separar "ruído mental" de "ações comprometidas".
* **Funcionalidade:**
    1.  Um botão "+" abre um campo único: "O que está na sua mente?".
    2.  Após digitar, o texto é salvo por padrão em "O Pátio", sem exigir uma decisão imediata.
    3.  Posteriormente, o usuário pode promover essa nota a uma tarefa, classificando-a como 🧱 **Tarefa Simples** vs. 🏗️ **Projeto Grande** e 🔥 **Para Hoje** vs. 📅 **Agendar para o Futuro**.

#### **4.3 Organização de Tarefas: O "Orçamento de Energia Diário"**

* **Objetivo:** Alinhar a carga de trabalho com a capacidade energética real do usuário.
* **Funcionalidade:**
    * Substitui o conceito de "prioridade" por "Níveis de Energia" com pontos:
        * 🔋 Bateria Fraca = **1 Ponto**
        * 🧠 Cérebro Normal = **3 Pontos**
        * ⚡️ Cérebro Ligado = **5 Pontos**
    * O usuário define um "orçamento" diário de pontos (ex: 12 pontos).
    * A ferramenta impede que o usuário planeje um dia que ultrapasse o orçamento, agindo como uma trava de segurança contra a auto-sobrecarga.

#### **4.4 Projetos: O "Contêiner de Projeto"**

* **Objetivo:** Gerenciar projetos de longo prazo sem poluir a visão diária.
* **Funcionalidade:**
    * Projetos grandes vivem na "Aba do Arquiteto" como **"Contêineres de Projeto"**.
    * Cada contêiner possui uma **"Área de Anotações do Projeto"** e um **"Backlog de Tijolos"**, onde as micro-tarefas do projeto são listadas.
    * Cada "tijolo" no backlog tem um botão **"🧱 Tornar o Próximo Tijolo"**, que envia aquela única tarefa para o Painel do Bombeiro de um dia específico.

#### **4.5 Prazos: O "Protocolo de Prazos"**

* **Objetivo:** Combater a **Cegueira Temporal**.
* **Funcionalidade:**
    * Tarefas ou projetos podem ter um "Prazo Final".
    * O sistema cria automaticamente um cronograma de "toques" com intensidade progressiva à medida que o prazo se aproxima (ex: uma nota no "Pátio" com 90 dias, um alerta visual no projeto com 30 dias, uma tarefa automática no Modo Bombeiro com 7 dias).

#### **4.6 Alívio Mental: O Pátio (Caixa de Areia)**

* **Objetivo:** Fornecer uma "válvula de escape" para o ruído mental.
* **Funcionalidade:**
    * Um editor de texto livre, visualmente calmo e separado das tarefas.
    * A Captura Rápida envia o texto diretamente para "O Pátio" como uma nota, removendo o atrito da decisão.
    * Notas aqui não têm prazo ou status. O usuário pode **editar**, **apagar** ou **arquivar**.
    * Notas podem ser promovidas a tarefas através do botão **"✨ Transformar em Ação"**.

### **5\. Protocolos de Exceção (A Inteligência do Assistente)**

#### **5.1 Protocolo de Baixa Energia**

* **Gatilho:** O usuário se sente incapaz de iniciar as tarefas do dia e clica no botão 🔋 **Não consigo começar hoje...**.
* **Ação:** A ferramenta valida o sentimento e oferece opções de baixo atrito: "**Substituir**" (trocar uma tarefa difícil por uma da lista pré-definida de 'Bateria Fraca'), "**Desabafar no Pátio**" ou "**Adiar o Dia**".
* As tarefas adiadas vão para a **"Sala de Repanejamento"**, um limbo temporário, para não sobrecarregar o dia seguinte.

#### **5.2 Protocolo de Decomposição**

* **Gatilho:** Uma tarefa é adiada na "Sala de Repanejamento" por 3 vezes.
* **Ação:** A ferramenta intervém e guia o usuário para quebrar a "tarefa-fantasma" em seu menor "primeiro tijolo", transformando a tarefa original em um "Contêiner de Projeto".

#### **5.3 Protocolo de Incêndio**

* **Gatilho:** O usuário tenta adicionar uma tarefa urgente a um dia que já está com o "orçamento de energia" cheio.
* **Ação:** A ferramenta o força a uma decisão estratégica, pedindo que ele escolha qual das tarefas planejadas será adiada para a "Sala de Repanejamento" para abrir espaço para a urgência.

#### **5.4 Protocolo Sentinela (Follow-up)**

* **Gatilho:** O usuário completa uma tarefa que envolve delegar ou aguardar uma resposta.
* **Ação:** A ferramenta o convida a configurar uma "sentinela", definindo de quem está aguardando e até quando. Se a resposta não chegar, a ferramenta cria automaticamente uma tarefa de "check-in" no dia do prazo, já com um template de mensagem gentil.

#### **5.5 Protocolo de Revisão Semanal**

* **Gatilho:** Notificação gentil na sexta-feira à tarde.
* **Ação:** A ferramenta abre um template em "O Pátio" com perguntas para avaliar o bem-estar e a carga de trabalho da semana, permitindo que o usuário faça ajustes experimentais no seu "Orçamento de Energia Diário".

### **6\. Resumo e Critério de Sucesso**

O sucesso desta ferramenta não será medido pelo número de funcionalidades, mas pela sua **taxa de adesão consistente do usuário a longo prazo**. Se o usuário sentir vontade de abrir a ferramenta mesmo em dias de baixa energia, sabendo que encontrará um parceiro compreensivo e não um crítico, o projeto terá sido um sucesso absoluto.