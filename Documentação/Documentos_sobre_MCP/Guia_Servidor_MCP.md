# Guia Completo: Servidor MCP para Claude Desktop

## 1. O que é MCP?

O Model Context Protocol (MCP) é um protocolo que permite ao Claude Desktop integrar-se com ferramentas e dados locais através de servidores personalizados.

## 2. Pré-requisitos

- Claude Desktop instalado
- Python 3.8+ ou Node.js 16+
- Editor de código

## 3. Instalação das Dependências

### Para Python:
```bash
pip install mcp
```

### Para Node.js:
```bash
npm install @modelcontextprotocol/sdk
```

## 4. Criando o Servidor MCP (Python)

Crie um arquivo `mcp_server.py`:

```python
#!/usr/bin/env python3
import asyncio
import os
import json
from pathlib import Path
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Resource, Tool, TextContent

# Configurar o diretório do projeto
PROJECT_ROOT = Path(__file__).parent

app = Server("file-server")

@app.list_resources()
async def list_resources() -> list[Resource]:
    """Lista todos os arquivos do projeto"""
    resources = []
    
    # Extensões de arquivo permitidas
    allowed_extensions = {'.py', '.js', '.ts', '.html', '.css', '.md', '.txt', '.json', '.yml', '.yaml'}
    
    for file_path in PROJECT_ROOT.rglob('*'):
        if (file_path.is_file() and 
            file_path.suffix.lower() in allowed_extensions and
            not any(part.startswith('.') for part in file_path.parts)):
            
            relative_path = file_path.relative_to(PROJECT_ROOT)
            resources.append(Resource(
                uri=f"file://{relative_path}",
                name=str(relative_path),
                mimeType="text/plain",
                description=f"Arquivo: {relative_path}"
            ))
    
    return resources

@app.read_resource()
async def read_resource(uri: str) -> str:
    """Lê o conteúdo de um arquivo"""
    if not uri.startswith("file://"):
        raise ValueError("URI deve começar com file://")
    
    file_path = PROJECT_ROOT / uri[7:]  # Remove "file://"
    
    if not file_path.exists():
        raise FileNotFoundError(f"Arquivo não encontrado: {file_path}")
    
    if not file_path.is_relative_to(PROJECT_ROOT):
        raise ValueError("Acesso negado: arquivo fora do projeto")
    
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return content
    except UnicodeDecodeError:
        return f"[Arquivo binário: {file_path.name}]"

@app.list_tools()
async def list_tools() -> list[Tool]:
    """Lista as ferramentas disponíveis"""
    return [
        Tool(
            name="create_file",
            description="Cria um novo arquivo no projeto",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Caminho relativo do arquivo"
                    },
                    "content": {
                        "type": "string", 
                        "description": "Conteúdo do arquivo"
                    }
                },
                "required": ["path", "content"]
            }
        ),
        Tool(
            name="update_file",
            description="Atualiza um arquivo existente",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Caminho relativo do arquivo"
                    },
                    "content": {
                        "type": "string",
                        "description": "Novo conteúdo do arquivo"
                    }
                },
                "required": ["path", "content"]
            }
        ),
        Tool(
            name="list_directory",
            description="Lista arquivos e pastas em um diretório",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {
                        "type": "string",
                        "description": "Caminho do diretório (opcional, padrão: raiz)"
                    }
                }
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Executa uma ferramenta"""
    
    if name == "create_file":
        path = arguments["path"]
        content = arguments["content"]
        
        file_path = PROJECT_ROOT / path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return [TextContent(
            type="text",
            text=f"Arquivo criado: {path}"
        )]
    
    elif name == "update_file":
        path = arguments["path"]
        content = arguments["content"]
        
        file_path = PROJECT_ROOT / path
        
        if not file_path.exists():
            raise FileNotFoundError(f"Arquivo não encontrado: {path}")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return [TextContent(
            type="text",
            text=f"Arquivo atualizado: {path}"
        )]
    
    elif name == "list_directory":
        path = arguments.get("path", "")
        dir_path = PROJECT_ROOT / path
        
        if not dir_path.exists():
            raise FileNotFoundError(f"Diretório não encontrado: {path}")
        
        items = []
        for item in sorted(dir_path.iterdir()):
            if item.name.startswith('.'):
                continue
            
            item_type = "📁" if item.is_dir() else "📄"
            relative_path = item.relative_to(PROJECT_ROOT)
            items.append(f"{item_type} {relative_path}")
        
        return [TextContent(
            type="text",
            text=f"Conteúdo do diretório {path or 'raiz'}:\n" + "\n".join(items)
        )]
    
    else:
        raise ValueError(f"Ferramenta desconhecida: {name}")

async def main():
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())
```

## 5. Configuração no Claude Desktop

### Windows:
Edite o arquivo: `%APPDATA%\Claude\claude_desktop_config.json`

### macOS:
Edite o arquivo: `~/Library/Application Support/Claude/claude_desktop_config.json`

### Linux:
Edite o arquivo: `~/.config/Claude/claude_desktop_config.json`

Adicione a configuração:

```json
{
  "mcpServers": {
    "file-server": {
      "command": "python",
      "args": ["caminho/para/seu/mcp_server.py"],
      "env": {}
    }
  }
}
```

## 6. Script de Inicialização (Opcional)

Crie um arquivo `start_mcp.bat` (Windows) ou `start_mcp.sh` (Linux/macOS):

### Windows (start_mcp.bat):
```batch
@echo off
cd /d "C:\caminho\para\seu\projeto"
python mcp_server.py
```

### Linux/macOS (start_mcp.sh):
```bash
#!/bin/bash
cd "/caminho/para/seu/projeto"
python3 mcp_server.py
```

Torne executável (Linux/macOS):
```bash
chmod +x start_mcp.sh
```

Atualize a configuração para usar o script:
```json
{
  "mcpServers": {
    "file-server": {
      "command": "./start_mcp.sh",
      "args": [],
      "env": {}
    }
  }
}
```

## 7. Versão Node.js (Alternativa)

Se preferir Node.js, crie `mcp_server.js`:

```javascript
#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import fs from 'fs/promises';
import path from 'path';

const PROJECT_ROOT = process.cwd();

class FileServer {
  constructor() {
    this.server = new Server({
      name: 'file-server',
      version: '1.0.0'
    }, {
      capabilities: {
        resources: {},
        tools: {}
      }
    });

    this.setupHandlers();
  }

  setupHandlers() {
    this.server.setRequestHandler('resources/list', async () => {
      // Implementar listagem de recursos
      return { resources: [] };
    });

    this.server.setRequestHandler('resources/read', async (request) => {
      // Implementar leitura de arquivo
      const uri = request.params.uri;
      // ... implementação
    });

    this.server.setRequestHandler('tools/list', async () => {
      // Implementar listagem de ferramentas
      return { tools: [] };
    });

    this.server.setRequestHandler('tools/call', async (request) => {
      // Implementar chamada de ferramenta
      // ... implementação
    });
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
  }
}

const server = new FileServer();
server.run().catch(console.error);
```

## 8. Teste da Integração

1. **Salve a configuração** e reinicie o Claude Desktop
2. **Verifique se o servidor aparece** na lista de integrações
3. **Teste comandos básicos**:
   - "Liste os arquivos do meu projeto"
   - "Mostre o conteúdo do arquivo main.py"
   - "Crie um arquivo README.md"

## 9. Solução de Problemas

### Servidor não aparece:
- Verifique o caminho do arquivo de configuração
- Confirme que o Python/Node.js está no PATH
- Verifique a sintaxe do JSON

### Erros de permissão:
- Certifique-se de que o script tem permissões de execução
- Verifique se o Claude Desktop pode acessar o diretório

### Logs de debug:
```python
import logging
logging.basicConfig(level=logging.DEBUG)
```

## 10. Próximos Passos

- **Personalizar extensões** de arquivo permitidas
- **Adicionar filtros** para ignorar arquivos específicos
- **Implementar busca** por conteúdo nos arquivos
- **Criar ferramentas** para executar comandos do sistema
- **Adicionar suporte** para diferentes tipos de projeto

## Dicas Importantes

⚠️ **Segurança**: O servidor MCP dá acesso completo aos arquivos do projeto ao Claude Desktop

✅ **Teste incremental**: Comece com funcionalidades básicas e vá expandindo

🔧 **Personalização**: Adapte as ferramentas às necessidades do seu projeto

📝 **Documentação**: Mantenha as descrições das ferramentas claras e precisas