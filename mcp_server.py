#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
MCP Server Completo para Gerenciador_Task
Acesso total com todas as funções necessárias para LLM
"""

import asyncio
import os
import json
import re
import shutil
from pathlib import Path
from datetime import datetime
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Resource, Tool, TextContent

# Caminho do projeto - construido de forma segura
USER_HOME = Path.home()
PROJECT_ROOT = USER_HOME / "Desktop" / "Projetos" / "Gerenciador_Task"

# Fallback para caminho relativo se absoluto nao funcionar
if not PROJECT_ROOT.exists():
    PROJECT_ROOT = Path(__file__).parent

app = Server("Gerenciador_task")

def is_binary_file(file_path):
    """Verifica se um arquivo e binario"""
    binary_extensions = {
        '.exe', '.dll', '.bin', '.dat', '.db', '.sqlite', '.sqlite3',
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.webp',
        '.mp3', '.mp4', '.avi', '.mov', '.wav', '.pdf', '.zip',
        '.rar', '.7z', '.tar', '.gz'
    }
    return file_path.suffix.lower() in binary_extensions

def should_ignore_path(file_path):
    """Verifica se um caminho deve ser ignorado"""
    ignore_dirs = {'node_modules', '.git', '.next', 'dist', 'build', '__pycache__', '.pytest_cache', 'coverage'}
    return any(ignored in file_path.parts for ignored in ignore_dirs)

def safe_read_file(file_path, max_size=10*1024*1024):
    """Le arquivo com multiplos encodings e limite de tamanho"""
    if file_path.stat().st_size > max_size:
        return f"[ARQUIVO MUITO GRANDE] {file_path.name} ({file_path.stat().st_size} bytes) - Use read_file_partial"
    
    encodings = ['utf-8', 'utf-8-sig', 'latin1', 'cp1252']
    for encoding in encodings:
        try:
            with open(file_path, 'r', encoding=encoding) as f:
                return f.read()
        except UnicodeDecodeError:
            continue
        except Exception as e:
            return f"[ERRO DE LEITURA] {e}"
    
    return f"[ERRO] Impossivel ler arquivo com encodings: {encodings}"

def search_in_file(file_path, pattern, case_sensitive=False):
    """Busca padrao em arquivo"""
    try:
        content = safe_read_file(file_path)
        if content.startswith('[ARQUIVO') or content.startswith('[ERRO'):
            return []
        
        flags = 0 if case_sensitive else re.IGNORECASE
        matches = []
        
        for line_num, line in enumerate(content.split('\n'), 1):
            if re.search(pattern, line, flags):
                matches.append({
                    'line': line_num,
                    'content': line.strip(),
                    'file': str(file_path.relative_to(PROJECT_ROOT))
                })
        
        return matches
    except Exception as e:
        return [{'error': str(e), 'file': str(file_path)}]

def get_all_text_files():
    """Lista TODOS os arquivos de texto do projeto"""
    text_files = []
    
    for file_path in PROJECT_ROOT.rglob('*'):
        if should_ignore_path(file_path):
            continue
        if not file_path.is_file():
            continue
        if is_binary_file(file_path):
            continue
        text_files.append(file_path)
    return text_files

def analyze_project_structure(max_depth=3):
    """Analisa estrutura do projeto"""
    structure = {
        'directories': {},
        'files_by_type': {},
        'total_files': 0,
        'total_size': 0
    }
    
    def analyze_dir(dir_path, current_depth=0):
        if current_depth > max_depth:
            return
        
        try:
            for item in dir_path.iterdir():
                if should_ignore_path(item):
                    continue
                
                if item.is_dir():
                    rel_path = str(item.relative_to(PROJECT_ROOT))
                    structure['directories'][rel_path] = {
                        'files': 0,
                        'subdirs': 0
                    }
                    analyze_dir(item, current_depth + 1)
                
                elif item.is_file():
                    ext = item.suffix.lower() or 'no_extension'
                    if ext not in structure['files_by_type']:
                        structure['files_by_type'][ext] = []
                    
                    try:
                        size = item.stat().st_size
                        structure['files_by_type'][ext].append({
                            'path': str(item.relative_to(PROJECT_ROOT)),
                            'size': size
                        })
                        structure['total_files'] += 1
                        structure['total_size'] += size
                    except:
                        pass
        except Exception as e:
            print(f"Erro ao analisar {dir_path}: {e}")
    
    analyze_dir(PROJECT_ROOT)
    return structure

@app.list_resources()
async def list_resources() -> list[Resource]:
    """Lista TODOS os arquivos de texto do projeto"""
    resources = []
    try:
        text_files = get_all_text_files()
        for file_path in text_files:
            try:
                relative_path = file_path.relative_to(PROJECT_ROOT)
                uri_path = str(relative_path).replace(chr(92), '/')
                resources.append(Resource(
                    uri=f"file://{uri_path}",
                    name=str(relative_path),
                    mimeType="text/plain",
                    description=f"Arquivo: {relative_path} ({file_path.stat().st_size} bytes)"
                ))
            except Exception as e:
                print(f"[WARNING] Erro ao processar {file_path}: {e}")
                continue
    except Exception as e:
        print(f"[ERROR] Erro ao listar recursos: {e}")
    return resources

@app.read_resource()
async def read_resource(uri: str) -> str:
    """Le qualquer arquivo de texto do projeto"""
    if not uri.startswith("file://"):
        raise ValueError("URI deve comecar com file://")
    
    uri_path = uri[7:]
    file_path = PROJECT_ROOT / uri_path.replace('/', os.sep)
    
    if not file_path.exists():
        alt_path = PROJECT_ROOT / uri_path
        if alt_path.exists():
            file_path = alt_path
        else:
            raise FileNotFoundError(f"Arquivo nao encontrado: {file_path}")
    
    try:
        file_path.resolve().relative_to(PROJECT_ROOT.resolve())
    except ValueError:
        raise ValueError("Acesso negado: arquivo fora do projeto")
    
    return safe_read_file(file_path)

@app.list_tools()
async def list_tools() -> list[Tool]:
    """Ferramentas disponiveis - TODAS as funcoes necessarias"""
    return [
        Tool(
            name="read_file",
            description="Le o conteudo completo de um arquivo",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Caminho relativo do arquivo"}
                },
                "required": ["path"]
            }
        ),
        Tool(
            name="read_file_partial",
            description="Le parte de um arquivo (para arquivos grandes)",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Caminho relativo do arquivo"},
                    "start_line": {"type": "integer", "description": "Linha inicial (opcional)", "default": 1},
                    "end_line": {"type": "integer", "description": "Linha final (opcional)"},
                    "max_lines": {"type": "integer", "description": "Max linhas a ler (opcional)", "default": 100}
                },
                "required": ["path"]
            }
        ),
        Tool(
            name="search_files",
            description="Busca padrao/texto em arquivos do projeto",
            inputSchema={
                "type": "object",
                "properties": {
                    "pattern": {"type": "string", "description": "Padrao regex ou texto a buscar"},
                    "file_pattern": {"type": "string", "description": "Padrao para filtrar arquivos (ex: *.ts)", "default": "*"},
                    "case_sensitive": {"type": "boolean", "description": "Busca case-sensitive", "default": False},
                    "max_results": {"type": "integer", "description": "Maximo de resultados", "default": 50}
                },
                "required": ["pattern"]
            }
        ),
        Tool(
            name="find_files",
            description="Encontra arquivos por nome/padrao",
            inputSchema={
                "type": "object",
                "properties": {
                    "name_pattern": {"type": "string", "description": "Padrao do nome (ex: *Store.ts)"},
                    "extension": {"type": "string", "description": "Extensao especifica (ex: .ts)"},
                    "directory": {"type": "string", "description": "Diretorio para buscar (opcional)"}
                }
            }
        ),
        Tool(
            name="analyze_structure",
            description="Analisa estrutura completa do projeto",
            inputSchema={
                "type": "object",
                "properties": {
                    "max_depth": {"type": "integer", "description": "Profundidade maxima", "default": 3},
                    "include_stats": {"type": "boolean", "description": "Incluir estatisticas", "default": True}
                }
            }
        ),
        Tool(
            name="create_file",
            description="Cria um novo arquivo no projeto",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Caminho relativo do arquivo"},
                    "content": {"type": "string", "description": "Conteudo do arquivo"},
                    "backup_existing": {"type": "boolean", "description": "Fazer backup se existir", "default": True}
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
                    "path": {"type": "string", "description": "Caminho relativo do arquivo"},
                    "content": {"type": "string", "description": "Novo conteudo do arquivo"},
                    "create_backup": {"type": "boolean", "description": "Criar backup", "default": True}
                },
                "required": ["path", "content"]
            }
        ),
        Tool(
            name="backup_file",
            description="Cria backup de um arquivo",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Caminho relativo do arquivo"}
                },
                "required": ["path"]
            }
        ),
        Tool(
            name="list_directory",
            description="Lista arquivos e pastas em um diretorio",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Caminho do diretorio (opcional)"},
                    "show_hidden": {"type": "boolean", "description": "Mostrar arquivos ocultos", "default": False},
                    "recursive": {"type": "boolean", "description": "Listagem recursiva", "default": False}
                }
            }
        ),
        Tool(
            name="debug_file_access",
            description="Debug completo de acesso a arquivo",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Caminho do arquivo para debug"}
                },
                "required": ["path"]
            }
        ),
        Tool(
            name="get_file_info",
            description="Obtem informacoes detalhadas de um arquivo",
            inputSchema={
                "type": "object",
                "properties": {
                    "path": {"type": "string", "description": "Caminho relativo do arquivo"}
                },
                "required": ["path"]
            }
        )
    ]

@app.call_tool()
async def call_tool(name: str, arguments: dict) -> list[TextContent]:
    """Executa ferramentas - IMPLEMENTACAO COMPLETA"""
    
    if name == "read_file":
        path = arguments["path"]
        file_path = PROJECT_ROOT / path
        
        if not file_path.exists():
            return [TextContent(type="text", text=f"ERRO: Arquivo nao encontrado: {path}")]
        
        try:
            file_path.resolve().relative_to(PROJECT_ROOT.resolve())
        except ValueError:
            return [TextContent(type="text", text=f"ERRO: Acesso negado: arquivo fora do projeto")]
        
        content = safe_read_file(file_path)
        return [TextContent(type="text", text=content)]
    
    elif name == "read_file_partial":
        path = arguments["path"]
        start_line = arguments.get("start_line", 1)
        end_line = arguments.get("end_line")
        max_lines = arguments.get("max_lines", 100)
        
        file_path = PROJECT_ROOT / path
        if not file_path.exists():
            return [TextContent(type="text", text=f"ERRO: Arquivo nao encontrado: {path}")]
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                lines = f.readlines()
            
            if end_line:
                selected_lines = lines[start_line-1:end_line]
            else:
                selected_lines = lines[start_line-1:start_line-1+max_lines]
            
            result = f"ARQUIVO: {path} (linhas {start_line}-{start_line+len(selected_lines)-1})\n"
            result += "=" * 50 + "\n"
            
            for i, line in enumerate(selected_lines, start_line):
                result += f"{i:4d}: {line.rstrip()}\n"
            
            return [TextContent(type="text", text=result)]
        except Exception as e:
            return [TextContent(type="text", text=f"ERRO: Erro ao ler arquivo: {e}")]
    
    elif name == "search_files":
        pattern = arguments["pattern"]
        file_pattern = arguments.get("file_pattern", "*")
        case_sensitive = arguments.get("case_sensitive", False)
        max_results = arguments.get("max_results", 50)
        
        results = []
        result_count = 0
        
        for file_path in PROJECT_ROOT.rglob(file_pattern):
            if should_ignore_path(file_path):
                continue
            if not file_path.is_file():
                continue
            if is_binary_file(file_path):
                continue
            
            matches = search_in_file(file_path, pattern, case_sensitive)
            if matches and result_count < max_results:
                for match in matches:
                    if result_count >= max_results:
                        break
                    results.append(match)
                    result_count += 1
        
        if not results:
            return [TextContent(type="text", text=f"BUSCA: Nenhum resultado encontrado para: '{pattern}'")]
        
        result_text = f"BUSCA: Encontrados {len(results)} resultados para '{pattern}':\n\n"
        for match in results:
            if 'error' in match:
                result_text += f"ERRO: {match['file']}: {match['error']}\n"
            else:
                result_text += f"ARQUIVO: {match['file']}:{match['line']}\n"
                result_text += f"   {match['content']}\n\n"
        
        return [TextContent(type="text", text=result_text)]
    
    elif name == "find_files":
        name_pattern = arguments.get("name_pattern", "*")
        extension = arguments.get("extension", "")
        directory = arguments.get("directory", "")
        
        search_path = PROJECT_ROOT / directory if directory else PROJECT_ROOT
        
        if not search_path.exists():
            return [TextContent(type="text", text=f"ERRO: Diretorio nao encontrado: {directory}")]
        
        files_found = []
        
        # Combinar padroes
        if extension and not name_pattern.endswith(extension):
            if name_pattern == "*":
                search_pattern = f"*{extension}"
            else:
                search_pattern = f"{name_pattern}{extension}"
        else:
            search_pattern = name_pattern
        
        for file_path in search_path.rglob(search_pattern):
            if should_ignore_path(file_path):
                continue
            if file_path.is_file():
                try:
                    relative_path = file_path.relative_to(PROJECT_ROOT)
                    size = file_path.stat().st_size
                    files_found.append(f"ARQUIVO: {relative_path} ({size} bytes)")
                except:
                    pass
        
        if not files_found:
            return [TextContent(type="text", text=f"BUSCA: Nenhum arquivo encontrado com padrao: {search_pattern}")]
        
        result = f"BUSCA: Encontrados {len(files_found)} arquivos:\n\n"
        result += "\n".join(files_found)
        
        return [TextContent(type="text", text=result)]
    
    elif name == "analyze_structure":
        max_depth = arguments.get("max_depth", 3)
        include_stats = arguments.get("include_stats", True)
        
        structure = analyze_project_structure(max_depth)
        
        result = "ANALISE DA ESTRUTURA DO PROJETO\n"
        result += "=" * 50 + "\n\n"
        
        if include_stats:
            result += f"ESTATISTICAS GERAIS:\n"
            result += f"   Total de arquivos: {structure['total_files']}\n"
            result += f"   Tamanho total: {structure['total_size']:,} bytes\n"
            result += f"   Diretorios: {len(structure['directories'])}\n\n"
        
        result += "DIRETORIOS:\n"
        for dir_path in sorted(structure['directories'].keys()):
            result += f"   DIR: {dir_path}/\n"
        
        result += "\nARQUIVOS POR TIPO:\n"
        for ext, files in sorted(structure['files_by_type'].items()):
            result += f"   {ext}: {len(files)} arquivos\n"
            if len(files) <= 10:  # Mostrar arquivos se poucos
                for file_info in files:
                    result += f"      ARQUIVO: {file_info['path']}\n"
            elif len(files) > 10:
                result += f"      (primeiros 5):\n"
                for file_info in files[:5]:
                    result += f"         ARQUIVO: {file_info['path']}\n"
                result += f"      ... e mais {len(files)-5}\n"
        
        return [TextContent(type="text", text=result)]
    
    elif name == "create_file":
        path = arguments["path"]
        content = arguments["content"]
        backup_existing = arguments.get("backup_existing", True)
        
        file_path = PROJECT_ROOT / path
        
        # Backup se arquivo existir
        if file_path.exists() and backup_existing:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = file_path.parent / f"{file_path.name}.backup_{timestamp}"
            shutil.copy2(file_path, backup_path)
        
        file_path.parent.mkdir(parents=True, exist_ok=True)
        
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return [TextContent(type="text", text=f"SUCESSO: Arquivo criado: {path}")]
        except Exception as e:
            return [TextContent(type="text", text=f"ERRO: Erro ao criar arquivo: {e}")]
    
    elif name == "update_file":
        path = arguments["path"]
        content = arguments["content"]
        create_backup = arguments.get("create_backup", True)
        
        file_path = PROJECT_ROOT / path
        
        if not file_path.exists():
            return [TextContent(type="text", text=f"ERRO: Arquivo nao encontrado: {path}")]
        
        # Backup antes de atualizar
        if create_backup:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = file_path.parent / f"{file_path.name}.backup_{timestamp}"
            shutil.copy2(file_path, backup_path)
        
        try:
            with open(file_path, 'w', encoding='utf-8') as f:
                f.write(content)
            return [TextContent(type="text", text=f"SUCESSO: Arquivo atualizado: {path}")]
        except Exception as e:
            return [TextContent(type="text", text=f"ERRO: Erro ao atualizar arquivo: {e}")]
    
    elif name == "backup_file":
        path = arguments["path"]
        file_path = PROJECT_ROOT / path
        
        if not file_path.exists():
            return [TextContent(type="text", text=f"ERRO: Arquivo nao encontrado: {path}")]
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        backup_path = file_path.parent / f"{file_path.name}.backup_{timestamp}"
        
        try:
            shutil.copy2(file_path, backup_path)
            return [TextContent(type="text", text=f"SUCESSO: Backup criado: {backup_path.name}")]
        except Exception as e:
            return [TextContent(type="text", text=f"ERRO: Erro ao criar backup: {e}")]
    
    elif name == "list_directory":
        path = arguments.get("path", "")
        show_hidden = arguments.get("show_hidden", False)
        recursive = arguments.get("recursive", False)
        
        dir_path = PROJECT_ROOT / path if path else PROJECT_ROOT
        
        if not dir_path.exists():
            return [TextContent(type="text", text=f"ERRO: Diretorio nao encontrado: {path}")]
        
        items = []
        
        try:
            if recursive:
                for item in sorted(dir_path.rglob('*')):
                    if should_ignore_path(item):
                        continue
                    if not show_hidden and item.name.startswith('.'):
                        continue
                    
                    item_type = "DIR" if item.is_dir() else "FILE"
                    relative_path = item.relative_to(PROJECT_ROOT)
                    
                    if item.is_file():
                        try:
                            size = item.stat().st_size
                            size_str = f" ({size//1024}KB)" if size > 1024 else f" ({size}B)"
                            items.append(f"{item_type}: {relative_path}{size_str}")
                        except:
                            items.append(f"{item_type}: {relative_path}")
                    else:
                        items.append(f"{item_type}: {relative_path}/")
            else:
                for item in sorted(dir_path.iterdir()):
                    if not show_hidden and item.name.startswith('.'):
                        continue
                    
                    item_type = "DIR" if item.is_dir() else "FILE"
                    relative_path = item.relative_to(PROJECT_ROOT)
                    
                    if item.is_file():
                        try:
                            size = item.stat().st_size
                            size_str = f" ({size//1024}KB)" if size > 1024 else f" ({size}B)"
                            items.append(f"{item_type}: {relative_path}{size_str}")
                        except:
                            items.append(f"{item_type}: {relative_path}")
                    else:
                        items.append(f"{item_type}: {relative_path}/")
        
        except Exception as e:
            return [TextContent(type="text", text=f"ERRO: Erro ao listar diretorio: {e}")]
        
        return [TextContent(type="text", text=f"CONTEUDO de {path or 'raiz'} ({len(items)} itens):\n\n" + "\n".join(items))]
    
    elif name == "debug_file_access":
        path = arguments["path"]
        possible_paths = [
            PROJECT_ROOT / path,
            PROJECT_ROOT / path.replace('/', os.sep),
            PROJECT_ROOT / path.replace(chr(92), os.sep),
        ]
        
        debug_info = [f"DEBUG COMPLETO para: {path}"]
        debug_info.append(f"Projeto root: {PROJECT_ROOT}")
        debug_info.append(f"Projeto exists: {PROJECT_ROOT.exists()}")
        
        for i, file_path in enumerate(possible_paths):
            debug_info.append(f"Tentativa {i+1}: {file_path}")
            debug_info.append(f"   Existe: {file_path.exists()}")
            
            if file_path.exists():
                try:
                    stat = file_path.stat()
                    debug_info.append(f"   E arquivo: {file_path.is_file()}")
                    debug_info.append(f"   Tamanho: {stat.st_size} bytes")
                    debug_info.append(f"   Extensao: '{file_path.suffix}'")
                    
                    if file_path.is_file():
                        try:
                            with open(file_path, 'r', encoding='utf-8') as f:
                                sample = f.read(100)
                            debug_info.append(f"   Leitura OK: {repr(sample)}")
                        except Exception as e:
                            debug_info.append(f"   Erro leitura: {e}")
                    break
                except Exception as e:
                    debug_info.append(f"   Erro stat: {e}")
        
        return [TextContent(type="text", text="\n".join(debug_info))]
    
    elif name == "get_file_info":
        path = arguments["path"]
        file_path = PROJECT_ROOT / path
        
        if not file_path.exists():
            return [TextContent(type="text", text=f"ERRO: Arquivo nao encontrado: {path}")]
        
        try:
            stat = file_path.stat()
            info = [
                f"INFORMACOES DO ARQUIVO: {path}",
                "=" * 50,
                f"Tamanho: {stat.st_size:,} bytes",
                f"Criado: {datetime.fromtimestamp(stat.st_ctime)}",
                f"Modificado: {datetime.fromtimestamp(stat.st_mtime)}",
                f"Extensao: {file_path.suffix}",
                f"Diretorio: {file_path.parent.relative_to(PROJECT_ROOT)}",
                f"E binario: {'Sim' if is_binary_file(file_path) else 'Nao'}",
            ]
            
            if not is_binary_file(file_path) and stat.st_size < 1024*1024:  # < 1MB
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                    info.append(f"Linhas: {len(lines)}")
                    
                    # Primeira e última linha como preview
                    if lines:
                        info.append(f"Primeira linha: {lines[0].strip()[:100]}")
                        if len(lines) > 1:
                            info.append(f"Ultima linha: {lines[-1].strip()[:100]}")
                except:
                    pass
            
            return [TextContent(type="text", text="\n".join(info))]
        
        except Exception as e:
            return [TextContent(type="text", text=f"ERRO: Erro ao obter informacoes: {e}")]
    
    else:
        return [TextContent(type="text", text=f"ERRO: Ferramenta desconhecida: {name}")]

async def main():
    print("[INFO] Iniciando MCP Server COMPLETO para:", PROJECT_ROOT)
    print("[INFO] Projeto existe:", PROJECT_ROOT.exists())
    print("[INFO]", len((await list_tools())), "ferramentas disponíveis")
    async with stdio_server() as (read_stream, write_stream):
        await app.run(read_stream, write_stream, app.create_initialization_options())

if __name__ == "__main__":
    asyncio.run(main())