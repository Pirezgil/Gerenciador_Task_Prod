## 🚀 AMBIENTE DE DESENVOLVIMENTO

**Frontend:** http://localhost:3000 (Next.js)  
**Backend:** http://localhost:3001 (Node.js/Express)  
**Database:** PostgreSQL (conexão via Prisma)

⚠️ **IMPORTANTE:** Ambos os serviços (frontend e backend) estão sempre rodando. **NÃO execute `npm run dev`** - o sistema já está ativo nas portas especificadas.

HIERARQUIA DE ECONOMIA DE TOKENS

Níveis de Prioridade , começe do nivel 1 e vai subindo se precisar.

NÍVEL 1 (Mínimo gasto):** Use Glob para encontrar arquivos por padrão específico se você souber exatamente o que procura

NÍVEL 2 (Gasto baixo):** Use Grep com padrões específicos em tipos de arquivo conhecidos (ex: glob="*.ts", pattern="função específica")

NÍVEL 3 (Gasto médio):** Use Read em arquivos específicos quando você já sabe qual arquivo contém o que precisa

NÍVEL 4 (Gasto alto - só quando necessário):** Use Task tool para buscas complexas que precisam de múltiplas tentativas ou exploração ampla do código

#### Processo de Commit Git

Se a solicitação for para realizar o processo de commit do projeto, os passos a se seguir serão os seguintes:

1. **git status** - Verificar status atual do repositório
2. **git add .** - Adicionar todas as mudanças ao staging
3. **git commit -m "Mensagem do commit"** - Criar commit com mensagem informada pelo usuário. Se o usuário não fornecer uma mensagem, peça para ele informar antes de prosseguir
4. **git push origin main** - Enviar mudanças para o repositório remoto
