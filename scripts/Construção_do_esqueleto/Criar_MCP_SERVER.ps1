# create-mcp-server.ps1
# Script para criar automaticamente um MCP server para qualquer projeto

param(
    [string]$ProjectName = "Meu Projeto",
    [string]$ProjectPath = (Get-Location).Path
)

Write-Host "🚀 Criando MCP Server para: $ProjectName" -ForegroundColor Green
Write-Host "📁 Localização: $ProjectPath" -ForegroundColor Yellow
Write-Host "=" * 60

# Verificar se Node.js está instalado
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Node.js não encontrado. Instale Node.js primeiro." -ForegroundColor Red
    Write-Host "   Download: https://nodejs.org/" -ForegroundColor Cyan
    exit 1
}

# Verificar versão do Node.js
$NodeVersion = node --version
Write-Host "✅ Node.js encontrado: $NodeVersion" -ForegroundColor Green

# Criar pasta do MCP server
$McpPath = Join-Path $ProjectPath "mcp-server"
if (Test-Path $McpPath) {
    Write-Host "⚠️  Pasta mcp-server já existe. Sobrescrever? (s/N)" -ForegroundColor Yellow
    $response = Read-Host
    if ($response -ne 's' -and $response -ne 'S') {
        Write-Host "❌ Operação cancelada." -ForegroundColor Red
        exit 1
    }
    Remove-Item $McpPath -Recurse -Force
}

New-Item -ItemType Directory -Path $McpPath | Out-Null
Write-Host "📁 Pasta mcp-server criada" -ForegroundColor Green

# Criar package.json
$PackageJson = @{
    name = "$(($ProjectName -replace '\s+', '-').ToLower())-mcp-server"
    version = "1.0.0"
    type = "module"
    description = "MCP Server para análise do projeto $ProjectName"
    main = "mcp-server.js"
    bin = @{
        "project-mcp" = "./mcp-server.js"
    }
    scripts = @{
        start = "node mcp-server.js"
        dev = "node --inspect mcp-server.js"
    }
    dependencies = @{
        "@modelcontextprotocol/sdk" = "^0.5.0"
    }
    engines = @{
        node = ">=18.0.0"
    }
    keywords = @("mcp", "project-analysis", $ProjectName.ToLower())
} | ConvertTo-Json -Depth 10

$PackageJsonPath = Join-Path $McpPath "package.json"
$PackageJson | Out-File -FilePath $PackageJsonPath -Encoding UTF8
Write-Host "📄 package.json criado" -ForegroundColor Green

# Criar arquivo principal do MCP server
$McpServerContent = @"
#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ListToolsRequestSchema,
  ReadResourceRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuração do projeto
const PROJECT_ROOT = process.env.PROJECT_PATH || path.join(__dirname, '..');
const PROJECT_NAME = process.env.PROJECT_NAME || '$ProjectName';

class ProjectMCPServer {
  constructor() {
    this.server = new Server(
      {
        name: 'project-analyzer',
        version: '1.0.0',
      },
      {
        capabilities: {
          resources: {},
          tools: {},
        },
      }
    );

    this.setupHandlers();
  }

  setupHandlers() {
    // Lista de ferramentas disponíveis
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'search_files',
            description: 'Buscar arquivos no projeto por nome ou extensão',
            inputSchema: {
              type: 'object',
              properties: {
                pattern: {
                  type: 'string',
                  description: 'Padrão de busca (ex: "*.js", "*.py", "package.json")',
                },
                directory: {
                  type: 'string',
                  description: 'Diretório específico para buscar (opcional)',
                },
              },
              required: ['pattern'],
            },
          },
          {
            name: 'read_file',
            description: 'Ler conteúdo de um arquivo específico',
            inputSchema: {
              type: 'object',
              properties: {
                file_path: {
                  type: 'string',
                  description: 'Caminho relativo do arquivo a ser lido',
                },
              },
              required: ['file_path'],
            },
          },
          {
            name: 'analyze_structure',
            description: 'Analisar estrutura de diretórios do projeto',
            inputSchema: {
              type: 'object',
              properties: {
                depth: {
                  type: 'number',
                  description: 'Profundidade máxima de análise (padrão: 3)',
                  default: 3,
                },
              },
            },
          },
          {
            name: 'list_recent_files',
            description: 'Listar arquivos modificados recentemente',
            inputSchema: {
              type: 'object',
              properties: {
                days: {
                  type: 'number',
                  description: 'Número de dias para buscar (padrão: 7)',
                  default: 7,
                },
              },
            },
          },
          {
            name: 'get_project_info',
            description: 'Obter informações gerais do projeto',
            inputSchema: {
              type: 'object',
              properties: {},
            },
          },
        ],
      };
    });

    // Lista de recursos disponíveis
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => {
      const resources = [];
      
      try {
        const configFiles = await this.findImportantFiles();
        for (const file of configFiles) {
          resources.push({
            uri: `file://`+file,
            name: path.basename(file),
            mimeType: this.getMimeType(file),
            description: `Arquivo importante: `+path.basename(file),
          });
        }
      } catch (error) {
        console.error('Erro ao listar recursos:', error);
      }

      return { resources };
    });

    // Ler recursos
    this.server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
      const url = new URL(request.params.uri);
      const filePath = url.pathname;
      
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        return {
          contents: [
            {
              uri: request.params.uri,
              mimeType: this.getMimeType(filePath),
              text: content,
            },
          ],
        };
      } catch (error) {
        throw new Error(`Erro ao ler arquivo `+filePath+`: `+error.message);
      }
    });

    // Executar ferramentas
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      switch (name) {
        case 'search_files':
          return await this.searchFiles(args.pattern, args.directory);
        
        case 'read_file':
          return await this.readFile(args.file_path);
        
        case 'analyze_structure':
          return await this.analyzeStructure(args.depth || 3);
        
        case 'list_recent_files':
          return await this.listRecentFiles(args.days || 7);
        
        case 'get_project_info':
          return await this.getProjectInfo();
        
        default:
          throw new Error(`Ferramenta não encontrada: `+name);
      }
    });
  }

  // Implementação das ferramentas
  async searchFiles(pattern, directory = '') {
    try {
      const searchPath = path.join(PROJECT_ROOT, directory);
      const files = await this.walkDirectory(searchPath, pattern);
      
      return {
        content: [
          {
            type: 'text',
            text: `Arquivos encontrados para padrão "`+pattern+`":\n\n`+files.map(f => `- `+path.relative(PROJECT_ROOT, f)).join('\n'),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Erro na busca: `+error.message);
    }
  }

  async readFile(filePath) {
    try {
      const fullPath = path.resolve(PROJECT_ROOT, filePath);
      
      // Verificar se o arquivo está dentro do projeto (segurança)
      if (!fullPath.startsWith(PROJECT_ROOT)) {
        throw new Error('Acesso negado: arquivo fora do projeto');
      }
      
      const content = await fs.readFile(fullPath, 'utf-8');
      
      return {
        content: [
          {
            type: 'text',
            text: `Conteúdo do arquivo: `+filePath+`\n\n`+content,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Erro ao ler arquivo: `+error.message);
    }
  }

  async analyzeStructure(depth) {
    try {
      const structure = await this.getDirectoryStructure(PROJECT_ROOT, depth);
      
      return {
        content: [
          {
            type: 'text',
            text: `Estrutura do projeto `+PROJECT_NAME+`:\n\n`+structure,
          },
        ],
      };
    } catch (error) {
      throw new Error(`Erro ao analisar estrutura: `+error.message);
    }
  }

  async listRecentFiles(days) {
    try {
      const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
      const recentFiles = [];
      
      const files = await this.walkDirectory(PROJECT_ROOT, '*');
      
      for (const file of files) {
        const stats = await fs.stat(file);
        if (stats.mtime > cutoffDate) {
          recentFiles.push({
            file: path.relative(PROJECT_ROOT, file),
            modified: stats.mtime.toISOString(),
          });
        }
      }
      
      // Ordenar por data de modificação (mais recente primeiro)
      recentFiles.sort((a, b) => new Date(b.modified) - new Date(a.modified));
      
      return {
        content: [
          {
            type: 'text',
            text: `Arquivos modificados nos últimos `+days+` dias:\n\n`+recentFiles.map(f => `- `+f.file+` (`+f.modified+`)`).join('\n'),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Erro ao listar arquivos recentes: `+error.message);
    }
  }

  async getProjectInfo() {
    try {
      const info = {
        name: PROJECT_NAME,
        path: PROJECT_ROOT,
        structure: await this.getDirectoryStructure(PROJECT_ROOT, 2),
        configFiles: await this.findImportantFiles(),
        recentActivity: await this.listRecentFiles(7),
      };
      
      return {
        content: [
          {
            type: 'text',
            text: `Informações do projeto `+PROJECT_NAME+`:\n\nLocalização: `+PROJECT_ROOT+`\n\nEstrutura:\n`+info.structure+`\n\nArquivos importantes encontrados:\n`+info.configFiles.map(f => `- `+path.relative(PROJECT_ROOT, f)).join('\n'),
          },
        ],
      };
    } catch (error) {
      throw new Error(`Erro ao obter informações do projeto: `+error.message);
    }
  }

  // Métodos auxiliares
  async walkDirectory(dir, pattern) {
    const files = [];
    const regex = this.createRegexFromPattern(pattern);
    
    async function walk(currentPath) {
      try {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });
        
        for (const entry of entries) {
          // Ignorar pastas e arquivos comuns que não são relevantes
          if (entry.name.startsWith('.') || 
              entry.name === 'node_modules' || 
              entry.name === '__pycache__' ||
              entry.name === 'venv' ||
              entry.name === '.git' ||
              entry.name === 'vendor' ||
              entry.name === 'target' ||
              entry.name === 'build' ||
              entry.name === 'dist') {
            continue;
          }
          
          const fullPath = path.join(currentPath, entry.name);
          
          if (entry.isDirectory()) {
            await walk(fullPath);
          } else if (entry.isFile() && regex.test(entry.name)) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Ignorar diretórios sem permissão
        console.error(`Erro ao acessar diretório `+currentPath+`: `+error.message);
      }
    }
    
    await walk(dir);
    return files;
  }

  async getDirectoryStructure(dir, maxDepth, currentDepth = 0) {
    if (currentDepth >= maxDepth) return '';
    
    let structure = '';
    try {
      const entries = await fs.readdir(dir, { withFileTypes: true });
      const indent = '  '.repeat(currentDepth);
      
      for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
        if (entry.name.startsWith('.') || 
            entry.name === 'node_modules' || 
            entry.name === '__pycache__' ||
            entry.name === 'venv' ||
            entry.name === '.git' ||
            entry.name === 'vendor' ||
            entry.name === 'target' ||
            entry.name === 'build' ||
            entry.name === 'dist') continue;
        
        structure += `+indent+(entry.isDirectory() ? '📁' : '📄')+` `+entry.name+`\n`;
        
        if (entry.isDirectory() && currentDepth < maxDepth - 1) {
          const subStructure = await this.getDirectoryStructure(
            path.join(dir, entry.name),
            maxDepth,
            currentDepth + 1
          );
          structure += subStructure;
        }
      }
    } catch (error) {
      console.error(`Erro ao ler diretório `+dir+`: `+error.message);
    }
    
    return structure;
  }

  async findImportantFiles() {
    const importantPatterns = [
      'package.json',
      'requirements.txt',
      'Dockerfile',
      'docker-compose.yml',
      'README.md',
      '.env.example',
      'tsconfig.json',
      'next.config.*',
      'vite.config.*',
      'webpack.config.*',
      'tailwind.config.*',
      'pyproject.toml',
      'setup.py',
      'Cargo.toml',
      'go.mod',
      'pom.xml',
      'build.gradle',
      'composer.json',
      'Gemfile',
      'Pipfile',
    ];
    
    const files = [];
    for (const pattern of importantPatterns) {
      try {
        const found = await this.walkDirectory(PROJECT_ROOT, pattern);
        files.push(...found);
      } catch (error) {
        // Ignorar erros de busca
      }
    }
    
    return files;
  }

  createRegexFromPattern(pattern) {
    if (pattern === '*') {
      return /.*/;
    }
    
    const escaped = pattern
      .replace(/\./g, '\\.')
      .replace(/\*/g, '.*')
      .replace(/\?/g, '.')
      .replace(/\{([^}]+)\}/g, '(`$1)');
    
    return new RegExp(`^`+escaped+`$`, 'i');
  }

  getMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.js': 'application/javascript',
      '.ts': 'application/typescript',
      '.py': 'text/x-python',
      '.java': 'text/x-java-source',
      '.php': 'text/x-php',
      '.rb': 'text/x-ruby',
      '.go': 'text/x-go',
      '.rs': 'text/x-rust',
      '.cpp': 'text/x-c++src',
      '.c': 'text/x-csrc',
      '.json': 'application/json',
      '.yml': 'application/x-yaml',
      '.yaml': 'application/x-yaml',
      '.md': 'text/markdown',
      '.txt': 'text/plain',
      '.env': 'text/plain',
      '.html': 'text/html',
      '.css': 'text/css',
      '.sql': 'text/x-sql',
    };
    
    return mimeTypes[ext] || 'text/plain';
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error(`+PROJECT_NAME+` MCP Server rodando...`);
  }
}

// Inicializar servidor
const server = new ProjectMCPServer();
server.run().catch(console.error);
"@

$McpServerPath = Join-Path $McpPath "mcp-server.js"
$McpServerContent | Out-File -FilePath $McpServerPath -Encoding UTF8
Write-Host "📄 mcp-server.js criado" -ForegroundColor Green

# Instalar dependências
Write-Host "📦 Instalando dependências..." -ForegroundColor Blue
Set-Location $McpPath

if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    pnpm install
} else {
    npm install
}

Write-Host "✅ Dependências instaladas" -ForegroundColor Green

# Testar o servidor
Write-Host "🧪 Testando o MCP server..." -ForegroundColor Blue
$TestProcess = Start-Process -FilePath "node" -ArgumentList "mcp-server.js" -PassThru -WindowStyle Hidden

Start-Sleep -Seconds 3

if ($TestProcess.HasExited -and $TestProcess.ExitCode -ne 0) {
    Write-Host "❌ Erro ao testar o MCP server" -ForegroundColor Red
} else {
    $TestProcess.Kill()
    Write-Host "✅ MCP server testado com sucesso" -ForegroundColor Green
}

Set-Location $ProjectPath

# Gerar configuração para o Claude Desktop
$ClaudeConfig = @{
    mcpServers = @{
        "meu-projeto" = @{
            command = "node"
            args = @($McpServerPath)
            env = @{
                PROJECT_PATH = $ProjectPath
                PROJECT_NAME = $ProjectName
            }
        }
    }
} | ConvertTo-Json -Depth 10

$ConfigFile = Join-Path $ProjectPath "claude_desktop_config.json"
$ClaudeConfig | Out-File -FilePath $ConfigFile -Encoding UTF8

Write-Host "`n🎉 MCP Server criado com sucesso!" -ForegroundColor Green
Write-Host "=" * 60

Write-Host "`n📋 Configuração gerada em: $ConfigFile" -ForegroundColor Yellow
Write-Host "`n🔧 Próximos passos:" -ForegroundColor Cyan
Write-Host "1. Copie o conteúdo do arquivo: $ConfigFile"
Write-Host "2. Cole no arquivo de configuração do Claude Desktop:"

$ClaudeConfigPath = ""
if ($env:OS -eq "Windows_NT") {
    $ClaudeConfigPath = "$env:APPDATA\Claude\claude_desktop_config.json"
} else {
    Write-Host "   Linux/macOS: ~/.config/Claude/claude_desktop_config.json"
    Write-Host "   macOS: ~/Library/Application Support/Claude/claude_desktop_config.json"
}

if ($ClaudeConfigPath) {
    Write-Host "   $ClaudeConfigPath" -ForegroundColor White
}

Write-Host "3. Reinicie o Claude Desktop" -ForegroundColor White
Write-Host "4. Teste com: 'Analise a estrutura do meu projeto'" -ForegroundColor White

Write-Host "`n🚀 Comandos de teste sugeridos:" -ForegroundColor Green
Write-Host "- Analise a estrutura do projeto $ProjectName"
Write-Host "- Busque por arquivos de configuração"
Write-Host "- Liste arquivos modificados nos últimos 3 dias"
Write-Host "- Mostre-me informações gerais do projeto"

Write-Host "`n✨ Seu MCP server está pronto para uso!" -ForegroundColor Magenta