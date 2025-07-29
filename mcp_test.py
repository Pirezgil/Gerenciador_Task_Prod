#!/usr/bin/env python3
"""
Versão de TESTE do servidor MCP - Para executar diretamente no VS Code
ATENÇÃO: Esta é apenas para testar as funções, não para usar com Claude Desktop
"""

import asyncio
import json
from pathlib import Path

# Configurar o diretório do projeto
PROJECT_ROOT = Path(__file__).parent

class MCPServerTest:
    """Classe para testar as funcionalidades do MCP Server"""
    
    def __init__(self):
        self.allowed_extensions = {'.py', '.js', '.ts', '.html', '.css', '.md', '.txt', '.json', '.yml', '.yaml'}
    
    def list_resources(self):
        """Lista todos os arquivos do projeto"""
        resources = []
        
        for file_path in PROJECT_ROOT.rglob('*'):
            if (file_path.is_file() and 
                file_path.suffix.lower() in self.allowed_extensions and
                not any(part.startswith('.') for part in file_path.parts)):
                
                relative_path = file_path.relative_to(PROJECT_ROOT)
                resources.append({
                    "uri": f"file://{relative_path}",
                    "name": str(relative_path),
                    "mimeType": "text/plain",
                    "description": f"Arquivo: {relative_path}"
                })
        
        return resources
    
    def read_resource(self, uri: str) -> str:
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
    
    def create_file(self, path: str, content: str) -> str:
        """Cria um novo arquivo no projeto"""
        file_path = PROJECT_ROOT / path
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return f"Arquivo criado: {path}"
    
    def update_file(self, path: str, content: str) -> str:
        """Atualiza um arquivo existente"""
        file_path = PROJECT_ROOT / path
        
        if not file_path.exists():
            raise FileNotFoundError(f"Arquivo não encontrado: {path}")
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        return f"Arquivo atualizado: {path}"
    
    def list_directory(self, path: str = "") -> str:
        """Lista arquivos e pastas em um diretório"""
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
        
        return f"Conteúdo do diretório {path or 'raiz'}:\n" + "\n".join(items)

def test_all_functions():
    """Função para testar todas as funcionalidades"""
    server = MCPServerTest()
    
    print("🔍 TESTANDO SERVIDOR MCP")
    print("=" * 50)
    
    # Teste 1: Listar recursos
    print("\n📂 1. LISTANDO RECURSOS:")
    try:
        resources = server.list_resources()
        print(f"Encontrados {len(resources)} arquivos:")
        for resource in resources[:5]:  # Mostra apenas os primeiros 5
            print(f"  - {resource['name']}")
        if len(resources) > 5:
            print(f"  ... e mais {len(resources) - 5} arquivos")
    except Exception as e:
        print(f"Erro: {e}")
    
    # Teste 2: Listar diretório
    print("\n📁 2. LISTANDO DIRETÓRIO RAIZ:")
    try:
        dir_content = server.list_directory()
        print(dir_content)
    except Exception as e:
        print(f"Erro: {e}")
    
    # Teste 3: Criar arquivo de teste  
    print("\n✏️ 3. CRIANDO ARQUIVO DE TESTE:")
    try:
        result = server.create_file("teste_mcp.txt", "Este é um arquivo de teste do MCP!\nCriado em: " + str(Path(__file__).name))
        print(result)
    except Exception as e:
        print(f"Erro: {e}")
    
    # Teste 4: Ler arquivo criado
    print("\n📖 4. LENDO ARQUIVO CRIADO:")
    try:
        content = server.read_resource("file://teste_mcp.txt")
        print(f"Conteúdo:\n{content}")
    except Exception as e:
        print(f"Erro: {e}")
    
    # Teste 5: Atualizar arquivo
    print("\n🔄 5. ATUALIZANDO ARQUIVO:")
    try:
        new_content = "Arquivo atualizado!\nNova linha adicionada."
        result = server.update_file("teste_mcp.txt", new_content)
        print(result)
        
        # Ler novamente para confirmar
        updated_content = server.read_resource("file://teste_mcp.txt")
        print(f"Conteúdo atualizado:\n{updated_content}")
    except Exception as e:
        print(f"Erro: {e}")
    
    print("\n✅ TESTE CONCLUÍDO!")
    print("\n" + "=" * 50)
    print("🚀 PRÓXIMOS PASSOS:")
    print("1. Configure o arquivo no Claude Desktop")
    print("2. Use o arquivo original 'mcp_server.py' (não este)")
    print("3. Reinicie o Claude Desktop")
    print("4. Teste a integração com Claude")

if __name__ == "__main__":
    print(f"📍 Diretório do projeto: {PROJECT_ROOT}")
    test_all_functions()