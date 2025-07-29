#!/usr/bin/env python3
"""
Script CORRIGIDO para configurar e testar o MCP Server
"""

import sys
import subprocess
import os
import json
from pathlib import Path

def check_dependencies():
    """Verifica se as dependências estão instaladas"""
    print("📦 Verificando dependências...")
    
    missing_deps = []
    
    # Verifica dependências básicas
    basic_deps = ['asyncio', 'json', 're', 'shutil', 'pathlib', 'datetime']
    for dep in basic_deps:
        try:
            __import__(dep)
        except ImportError:
            missing_deps.append(dep)
    
    # Verifica dependências MCP
    try:
        import mcp
        from mcp.server import Server
        from mcp.server.stdio import stdio_server
        from mcp.types import Resource, Tool, TextContent
        print("✅ MCP library encontrada")
    except ImportError as e:
        print(f"❌ MCP library não encontrada: {e}")
        missing_deps.append('mcp')
    
    if missing_deps:
        print(f"❌ Dependências em falta: {missing_deps}")
        return False
    else:
        print("✅ Todas as dependências encontradas")
        return True

def install_dependencies():
    """Instala as dependências necessárias"""
    print("📦 Instalando dependências MCP...")
    try:
        # Instala o MCP
        subprocess.check_call([
            sys.executable, "-m", "pip", "install", "mcp", "--quiet"
        ])
        print("✅ Dependências instaladas com sucesso")
        
        # Verifica se a instalação funcionou
        try:
            import mcp
            print("✅ Instalação verificada")
            return True
        except ImportError:
            print("❌ Instalação falhou - MCP ainda não pode ser importado")
            return False
            
    except subprocess.CalledProcessError as e:
        print(f"❌ Erro ao instalar dependências: {e}")
        return False
    except Exception as e:
        print(f"❌ Erro inesperado: {e}")
        return False

def test_project_structure():
    """Testa se a estrutura do projeto está correta"""
    print("\n📁 Analisando estrutura do projeto...")
    
    current_dir = Path(__file__).parent
    print(f"   📂 Diretório atual: {current_dir}")
    
    # Verifica se é um diretório válido
    if not current_dir.exists():
        print("   ❌ Diretório não existe!")
        return False
    
    # Lista arquivos no diretório
    try:
        files = list(current_dir.glob("*"))
        print(f"   📄 Total de itens: {len(files)}")
        
        # Categoriza itens
        py_files = []
        directories = []
        other_files = []
        
        for item in files:
            if item.is_dir():
                directories.append(item.name)
            elif item.suffix == '.py':
                py_files.append(item.name)
            else:
                other_files.append(item.name)
        
        print(f"   🐍 Arquivos Python: {len(py_files)}")
        for py_file in py_files:
            print(f"      • {py_file}")
        
        print(f"   📁 Diretórios: {len(directories)}")
        for directory in directories[:5]:  # Mostra primeiros 5
            print(f"      • {directory}/")
        if len(directories) > 5:
            print(f"      ... e mais {len(directories) - 5}")
        
        print(f"   📄 Outros arquivos: {len(other_files)}")
        
        # Verifica arquivos importantes
        important_files = ['mcp_server.py', 'setup_mcp.py', 'test_mcp.py']
        print(f"\n   🔍 Verificando arquivos importantes:")
        
        all_present = True
        for file_name in important_files:
            file_path = current_dir / file_name
            if file_path.exists():
                size = file_path.stat().st_size
                print(f"      ✅ {file_name} ({size:,} bytes)")
            else:
                print(f"      ❌ {file_name} (não encontrado)")
                if file_name == 'mcp_server.py':
                    all_present = False
        
        return all_present
        
    except Exception as e:
        print(f"   ❌ Erro ao analisar estrutura: {e}")
        return False

def test_server_import():
    """Testa se o servidor pode ser importado"""
    print("\n🧪 Testando importação do servidor...")
    
    server_path = Path(__file__).parent / "mcp_server.py"
    
    if not server_path.exists():
        print("   ❌ Arquivo mcp_server.py não encontrado")
        return False, None
    
    try:
        # Adiciona o diretório atual ao path
        sys.path.insert(0, str(Path(__file__).parent))
        
        # Tenta importar o servidor
        import importlib.util
        
        spec = importlib.util.spec_from_file_location("mcp_server", server_path)
        if spec is None:
            print("   ❌ Não foi possível criar spec para o módulo")
            return False, None
            
        module = importlib.util.module_from_spec(spec)
        if module is None:
            print("   ❌ Não foi possível criar módulo")
            return False, None
        
        # Executa o módulo
        spec.loader.exec_module(module)
        
        print("   ✅ Servidor importado com sucesso")
        print(f"   📁 Projeto root configurado: {module.PROJECT_ROOT}")
        print(f"   📁 Projeto existe: {module.PROJECT_ROOT.exists()}")
        
        # Testa algumas funções básicas
        try:
            text_files = module.get_all_text_files()
            print(f"   📄 Arquivos de texto encontrados: {len(text_files)}")
            
            structure = module.analyze_project_structure(max_depth=1)
            print(f"   📊 Análise de estrutura: {structure['total_files']} arquivos")
            
        except Exception as e:
            print(f"   ⚠️  Funções básicas com problema: {e}")
        
        return True, module
        
    except ImportError as e:
        print(f"   ❌ Erro de importação: {e}")
        print("   💡 Possíveis causas:")
        print("      - Dependências MCP não instaladas")
        print("      - Erro de sintaxe no mcp_server.py")
        return False, None
        
    except Exception as e:
        print(f"   ❌ Erro inesperado: {e}")
        return False, None

def create_config_file(server_module=None):
    """Cria arquivo de configuração para o MCP"""
    print("\n📝 Criando arquivo de configuração...")
    
    project_path = Path(__file__).parent
    server_path = project_path / "mcp_server.py"
    
    # Cria configuração básica
    config = {
        "mcpServers": {
            "gerenciador-task": {
                "command": "python",
                "args": [str(server_path.absolute())],
                "env": {
                    "GERENCIADOR_TASK_PATH": str(project_path.absolute())
                }
            }
        }
    }
    
    # Adiciona informações extras se tiver o módulo
    if server_module:
        config["_metadata"] = {
            "created": "Auto-generated by setup_mcp.py",
            "project_root": str(server_module.PROJECT_ROOT),
            "server_path": str(server_path)
        }
    
    config_path = project_path / "mcp_config.json"
    
    try:
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, indent=2, ensure_ascii=False)
        
        print(f"   ✅ Arquivo de configuração criado: {config_path}")
        print(f"   📄 Tamanho: {config_path.stat().st_size} bytes")
        
        return config_path
        
    except Exception as e:
        print(f"   ❌ Erro ao criar configuração: {e}")
        return None

def create_claude_desktop_instructions(config_path):
    """Cria instruções para configurar no Claude Desktop"""
    print("\n💻 Gerando instruções para Claude Desktop...")
    
    project_path = Path(__file__).parent
    server_path = project_path / "mcp_server.py"
    
    # Instruções específicas por sistema operacional
    if os.name == 'nt':  # Windows
        config_location = "%APPDATA%\\Claude\\claude_desktop_config.json"
        example_path = str(server_path).replace('\\', '\\\\')
    else:  # macOS/Linux
        config_location = "~/Library/Application Support/Claude/claude_desktop_config.json"
        example_path = str(server_path)
    
    instructions = f"""
📋 INSTRUÇÕES PARA CLAUDE DESKTOP
{'='*50}

1. 📁 Localize o arquivo de configuração do Claude Desktop:
   {config_location}

2. 📝 Adicione esta configuração ao arquivo:
   {{
     "mcpServers": {{
       "gerenciador-task": {{
         "command": "python",
         "args": ["{example_path}"]
       }}
     }}
   }}

3. 🔄 Reinicie o Claude Desktop

4. ✅ Verifique se o servidor aparece nas configurações

💡 DICAS:
- Se o arquivo de config não existir, crie-o
- Certifique-se de que o Python está no PATH
- Use caminhos absolutos para evitar problemas

📄 Configuração completa salva em: {config_path}
"""
    
    print(instructions)
    
    # Salva instruções em arquivo
    instructions_path = project_path / "claude_desktop_setup.txt"
    try:
        with open(instructions_path, 'w', encoding='utf-8') as f:
            f.write(instructions)
        print(f"📄 Instruções salvas em: {instructions_path}")
        return instructions_path
    except Exception as e:
        print(f"⚠️  Não foi possível salvar instruções: {e}")
        return None

def main():
    """Função principal de configuração"""
    print("🚀 CONFIGURAÇÃO DO MCP SERVER - GERENCIADOR TASK")
    print("=" * 60)
    
    steps_completed = 0
    total_steps = 5
    
    # 1. Verificar/instalar dependências
    print(f"\n[{steps_completed+1}/{total_steps}] VERIFICANDO DEPENDÊNCIAS")
    if not check_dependencies():
        print("🔧 Tentando instalar dependências...")
        if not install_dependencies():
            print("❌ Falha na instalação. Tente manualmente:")
            print("   pip install mcp")
            return False
    steps_completed += 1
    
    # 2. Testar estrutura do projeto
    print(f"\n[{steps_completed+1}/{total_steps}] VERIFICANDO ESTRUTURA")
    if not test_project_structure():
        print("❌ Estrutura do projeto com problemas")
        return False
    steps_completed += 1
    
    # 3. Testar importação do servidor
    print(f"\n[{steps_completed+1}/{total_steps}] TESTANDO SERVIDOR")
    success, server_module = test_server_import()
    if not success:
        print("❌ Servidor não pode ser importado")
        return False
    steps_completed += 1
    
    # 4. Criar arquivo de configuração
    print(f"\n[{steps_completed+1}/{total_steps}] CRIANDO CONFIGURAÇÃO")
    config_path = create_config_file(server_module)
    if not config_path:
        print("❌ Falha ao criar configuração")
        return False
    steps_completed += 1
    
    # 5. Criar instruções
    print(f"\n[{steps_completed+1}/{total_steps}] GERANDO INSTRUÇÕES")
    instructions_path = create_claude_desktop_instructions(config_path)
    steps_completed += 1
    
    # Resultado final
    print(f"\n{'='*60}")
    print("🎉 CONFIGURAÇÃO CONCLUÍDA COM SUCESSO!")
    print(f"✅ {steps_completed}/{total_steps} etapas completadas")
    
    print("\n📋 ARQUIVOS CRIADOS:")
    print(f"   📄 {config_path}")
    if instructions_path:
        print(f"   📄 {instructions_path}")
    
    print("\n📋 PRÓXIMOS PASSOS:")
    print("1. 🧪 Execute: python test_mcp.py")
    print("2. 💻 Configure no Claude Desktop (veja instruções acima)")
    print("3. 🔄 Reinicie o Claude Desktop")
    print("4. ✅ Teste a conexão")
    
    print(f"\n📊 Status: PRONTO PARA USO! 🚀")
    return True

if __name__ == "__main__":
    main()