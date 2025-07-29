#!/usr/bin/env python3
"""
Listador de Arquivos do Projeto
Gera uma lista completa e organizada de todos os arquivos do projeto
"""

import os
import yaml
import logging
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Any

class ProjectFileLister:
    def __init__(self, manifest_path: str):
        self.manifest_path = manifest_path
        self.logger = self._setup_logging()
        self.execution_log = []
        
    def _setup_logging(self) -> logging.Logger:
        """Configura sistema de logging"""
        logger = logging.getLogger('file_lister')
        handler = logging.StreamHandler()
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        logger.setLevel(logging.INFO)
        return logger
        
    def run(self) -> Dict[str, Any]:
        """Executa a listagem de arquivos"""
        try:
            with open(self.manifest_path, 'r', encoding='utf-8') as f:
                manifest = yaml.safe_load(f) or {}
            self.logger.info("Iniciando listagem de arquivos do projeto...")
            self._create_file_listing(manifest)
            return {'success': True, 'execution_log': self.execution_log, 'summary': 'Listagem de arquivos criada com sucesso!'}
        except Exception as e:
            self.logger.error(f"Erro na execução: {str(e)}")
            return {'success': False, 'error': str(e), 'execution_log': self.execution_log}
    
    def _create_file_listing(self, manifest: Dict[str, Any]):
        """Cria a listagem completa de arquivos"""
        target_dir_str = manifest.get('target_directory', '.')
        project_dir = Path(target_dir_str).resolve()
        
        if not project_dir.is_dir():
            error_msg = f"Diretório alvo não encontrado: '{project_dir}'"
            self.logger.error(error_msg)
            raise FileNotFoundError(error_msg)
            
        self.logger.info(f"Diretório alvo da listagem: {project_dir}")

        output_file = Path.cwd() / "lista_arquivos_projeto.txt"
        ignore_patterns = {'node_modules', '.git', '.next', 'dist', 'build', '__pycache__', '.vscode', '.idea', 'coverage', '.nyc_output'}
        
        file_categories = {
            'codigo_fonte': [], 'configuracao': [], 'documentacao': [],
            'scripts_automacao': [], 'backups': [], 'reports': [], 'outros': []
        }
        total_files, total_size = 0, 0
        
        self.logger.info("Percorrendo diretórios...")
        
        for root, dirs, files in os.walk(project_dir):
            dirs[:] = [d for d in dirs if d not in ignore_patterns]
            root_path = Path(root)
            
            for file in files:
                file_path = root_path / file
                if file_path.resolve() == output_file.resolve():
                    continue
                
                try:
                    file_size = file_path.stat().st_size
                    total_size += file_size
                    total_files += 1
                    
                    category = self._categorize_file(file, str(root_path.relative_to(project_dir)))
                    file_info = {
                        'path': str(file_path.relative_to(project_dir)), 'size': file_size,
                        'size_mb': round(file_size / (1024 * 1024), 3)
                    }
                    file_categories[category].append(file_info)
                    
                except (OSError, PermissionError) as e:
                    self.logger.warning(f"Não foi possível acessar o arquivo: {file_path}. Erro: {e}")
                    continue
        
        for category in file_categories:
            file_categories[category].sort(key=lambda x: x['path'])
        
        self._write_report(output_file, project_dir, file_categories, total_files, total_size)
        self.logger.info(f"Listagem salva em: {output_file}")
    
    def _categorize_file(self, filename: str, folder: str) -> str:
        """Categoriza um arquivo baseado em sua extensão e localização"""
        filename_lower, folder_lower = filename.lower(), folder.lower()
        if any(filename_lower.endswith(ext) for ext in ['.tsx', '.ts', '.jsx', '.js', '.py', '.css', '.html', '.vue', '.php']): return 'codigo_fonte'
        if any(filename_lower.endswith(ext) for ext in ['.json', '.yaml', '.yml', '.toml', '.ini', '.config.js', '.env']) or filename_lower in ['package.json', 'tsconfig.json', 'next.config.js', 'tailwind.config.js', 'postcss.config.js', 'next-env.d.ts']: return 'configuracao'
        if any(filename_lower.endswith(ext) for ext in ['.md', '.txt', '.docx', '.pdf']) or 'documentação' in folder_lower or 'docs' in folder_lower: return 'documentacao'
        if any(filename_lower.endswith(ext) for ext in ['.ps1', '.py', '.sh', '.bat']) or 'script' in folder_lower or filename_lower.startswith('run'): return 'scripts_automacao'
        if 'backup' in folder_lower or 'backup' in filename_lower: return 'backups'
        if 'report' in filename_lower or filename_lower.endswith('_report.json'): return 'reports'
        return 'outros'
    
    def _write_report(self, output_file: Path, project_dir: Path, categories: Dict, total_files: int, total_size: int):
        """Escreve o relatório final"""
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write("=" * 80 + "\n" + "LISTAGEM COMPLETA DE ARQUIVOS DO PROJETO" + "\n" + "=" * 80 + "\n")
            f.write(f"Gerado em: {datetime.now().strftime('%d/%m/%Y às %H:%M:%S')}\n")
            f.write(f"Diretório: {project_dir}\n")
            f.write(f"Total de arquivos: {total_files}\n")
            f.write(f"Tamanho total: {round(total_size / (1024 * 1024), 2)} MB\n")
            f.write("=" * 80 + "\n\n")
            f.write("RESUMO POR CATEGORIA:\n" + "-" * 40 + "\n")
            for category, files in categories.items():
                if files:
                    category_size = sum(file['size'] for file in files)
                    f.write(f"{category.replace('_', ' ').title()}: {len(files)} arquivos ({round(category_size / (1024 * 1024), 2)} MB)\n")
            f.write("\n")
            
            category_names = {'codigo_fonte': 'CÓDIGO FONTE', 'configuracao': 'ARQUIVOS DE CONFIGURAÇÃO', 'documentacao': 'DOCUMENTAÇÃO', 'scripts_automacao': 'SCRIPTS DE AUTOMAÇÃO', 'backups': 'ARQUIVOS DE BACKUP', 'reports': 'RELATÓRIOS', 'outros': 'OUTROS ARQUIVOS'}
            
            for category, files in categories.items():
                if files:
                    f.write("=" * 80 + "\n" + f"{category_names[category]}" + "\n" + "=" * 80 + "\n")
                    for file_info in files:
                        size_str = f"{file_info['size_mb']:.3f} MB" if file_info['size_mb'] > 0.001 else f"{file_info['size']} bytes"
                        f.write(f"{file_info['path']} ({size_str})\n")
                    f.write(f"\nSubtotal: {len(files)} arquivos\n\n")
            
            f.write("=" * 80 + "\n" + "FIM DA LISTAGEM" + "\n" + "=" * 80 + "\n")

def main():
    import sys
    if len(sys.argv) != 2:
        print("Uso: python listar_arquivos.py manifest.yaml")
        sys.exit(1)
    
    manifest_path = sys.argv[1]
    if not Path(manifest_path).exists():
        print(f"[ERRO] Arquivo de manifesto não encontrado: {manifest_path}")
        sys.exit(1)
    
    lister = ProjectFileLister(manifest_path)
    result = lister.run()
    
    if result['success']:
        print(f"\n[SUCESSO] {result['summary']}")
        # A LINHA ABAIXO FOI CORRIGIDA
        print(f"--> Arquivo gerado: {Path('lista_arquivos_projeto.txt').name}")
    else:
        print(f"\n[ERRO] {result['error']}")
        sys.exit(1)

if __name__ == '__main__':
    main()