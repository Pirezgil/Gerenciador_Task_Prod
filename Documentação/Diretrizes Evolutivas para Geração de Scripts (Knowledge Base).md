Diretrizes Evolutivas para Geração de Scripts (Knowledge Base)

Introdução

Este documento serve como um repositório de boas práticas e padrões aprendidos, derivados de erros ou sucessos em interações passadas. Ele complementa o Diretrizes_scripts.md e deve ser consultado antes de toda e qualquer geração de script para garantir a aplicação das lições mais recentes e evitar a repetição de erros conhecidos.

Padrões e Boas Práticas

1. Princípio da Artefatualização: Tudo é um Artefato

    Regra: Todo código executável gerado deve ser entregue como um "artefato" formal. Nunca forneça trechos de código soltos ou instruções de modificação manuais. O usuário irá salvar este artefato em seu projeto local (via VSCode) e executá-lo.

    Definição de Artefato: Existem dois tipos de artefatos válidos:

        Artefato Padrão: O par de arquivos run.py + manifest.yaml, utilizado para tarefas complexas, versionáveis e de scaffolding.

        Artefato Simples: Um único script .py Simples (ex: fix_script.py), utilizado para correções rápidas, cirúrgicas e urgentes.

    Justificativa:

        Estrutura e Clareza: Garante que todo o trabalho seja autocontido, bem definido e fácil de gerenciar pelo usuário.

        Segurança e Repetibilidade: Scripts formais podem incluir validações e são executados de maneira consistente, ao contrário de trechos de código que dependem de interpretação manual.

    Diretriz para a LLM: Sua resposta final deve sempre ser a geração de um ou mais arquivos que compõem um artefato completo.

2. Padrão de Gerenciamento de Artefatos: Priorizar a Atualização Condicional

    Regra: Sempre que possível, favoreça a atualização de artefatos existentes em vez da criação de novos artefatos do zero para tarefas relacionadas.

    Condição de Aplicabilidade: Consciência do Histórico

        Esta regra se aplica somente se o artefato original foi criado por você neste mesmo histórico de conversa. A sua memória é a plataforma Claude Desktop; você não tem acesso direto aos arquivos no ambiente do usuário (VSCode).

        Se você não tem o contexto ou a lembrança de ter criado o artefato original, o procedimento correto e seguro é criar um novo artefato de edição.

    Justificativa:

        Redução de Redundância: Evita a proliferação de múltiplos manifestos para a mesma funcionalidade.

        Consistência e Histórico: Mantém a evolução de uma funcionalidade centralizada em um único artefato, o que facilita o rastreamento e a manutenção.

    Aplicação Prática:

        Cenário: O usuário solicita a "adição da validação do campo de e-mail" em um formulário de cadastro.

        Processo Correto ✅:

            Verificar Histórico: Sua primeira ação é verificar: "Eu criei o artefato original do formulário de cadastro nesta conversa?"

            Caso 1 (Contexto EXISTE): Se a resposta for sim, você deve dizer: "Entendido. Vou atualizar o artefato que criamos para o formulário de cadastro para incluir a nova validação." Em seguida, gere um manifest.yaml que utilize a seção edits para modificar a lógica existente.

            Caso 2 (Contexto NÃO EXISTE): Se você não criou o artefato original na conversa atual, você deve dizer: "Entendido. Como não possuo o contexto do script original, vou criar um novo artefato focado apenas em adicionar essa validação." Em seguida, gere um novo artefato (seja Simples ou Padrão) que aplique a edição necessária.

    Diretriz para a LLM: A atualização é preferível, mas a segurança e a certeza vêm em primeiro lugar. Na ausência de contexto histórico claro, opte sempre por criar um novo artefato de edição.

3. Template Obrigatório: Diagnóstico e Plano de Ação

    Regra: Para toda e qualquer nova solicitação ou correção de erro, sua primeira resposta DEVE seguir estritamente este formato. Preencha cada seção antes de pedir a aprovação do usuário.

    Justificativa: Este template força a execução das regras fundamentais, garantindo que a investigação, o diagnóstico e a escolha da abordagem correta ocorram antes da geração do código, prevenindo os erros mais comuns.

    TEMPLATE DE RESPOSTA

    Assunto: Análise da Solicitação - [Breve Título da Tarefa]

    1. Investigação (MCP - Model Context Protocol)

        Comandos Executados: [Liste aqui os comandos de investigação que você usou, ex: read_file('...'), search_files('...')]

        Principais Descobertas: [Descreva em 1-2 frases o que você aprendeu, ex: "O arquivo de configuração X existe.", "Não há scripts de backup existentes.", "A estrutura do projeto é Y."]

    2. Análise e Decisão da Abordagem

        Diagnóstico: [Descreva o problema técnico em uma frase, ex: "A tarefa é uma correção de sintaxe simples e urgente."]

        Abordagem Escolhida: [Indique a abordagem, ex: ".py Simples" ou ".py + YAML"]

        Justificativa (conforme py_simples_vs_py+yaml.md): [Justifique a escolha, ex: "Maior economia de tokens e execução direta, ideal para problemas urgentes."]

    3. Plano de Ação (Resumo para o Usuário)

        [Ponto 1 da ação em linguagem simples, ex: "Vou criar um script que corrige o erro de sintaxe no arquivo X."]

        [Ponto 2 da ação em linguagem simples, se houver.]

    4. Aprovação

        Isso atende ao que você precisa? Se sim, me dê um 'ok' para eu gerar o artefato.