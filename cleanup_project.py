#!/usr/bin/env python3
"""
🧹 LIMPEZA INTELIGENTE DO PROJETO GERENCIADOR_TASK
=================================================

Remove arquivos não-essenciais mantendo apenas:
✅ Código de produção (src/, public/)
✅ Sistema MCP completo 
✅ Documentação oficial
✅ Configurações essenciais

Uso: python cleanup_project.py [--dry-run] [--force]
"""

import os
import shutil
import json
from pathlib import Path
from datetime import datetime
from typing import List, Dict, Set

class ProjectCleaner:
    def __init__(self, dry_run: bool = True):
        self.dry_run = dry_run
        self.project_root = Path.cwd()
        self.removed_files = []
        self.preserved_files = []
        self.analysis_needed = []
        
        # 🟢 ARQUIVOS E PASTAS ESSENCIAIS (PRESERVAR)
        self.essential_files = {
            # Sistema MCP
            'mcp_server.py',
            'mcp_test.py', 
            'mcp_config.json',
            'setup_mcp.py',
            'analisar_mcp.py',
            'claude_desktop_setup.txt',
            
            # Configuração do projeto
            'package.json',
            'package-lock.json',
            'next.config.js',
            'postcss.config.js', 
            'tailwind.config.js',
            'tsconfig.json',
            '.eslintrc.json',
            'next-env.d.ts',
            '.gitignore',
            'README.md',
            
            # Dados essenciais
            'data/tasks.json'  # Dados reais da aplicação
        }
        
        self.essential_dirs = {
            'src',           # Código fonte principal
            'public',        # Assets públicos
            'Documentação',  # Documentação oficial
            'data'           # Dados da aplicação
        }
        
        # 🔴 PADRÕES DE ARQUIVOS/PASTAS PARA REMOÇÃO
        self.removal_patterns = {
            # Scripts temporários e de correção
            'prefixes': ['fix_', 'complete_', 'temp_', 'test_', 'debug_', 'analyze_', 'clean_', 'improve_', 'search_', 'scan_', 'read_', 'remove_', 'separate_', 'finalize_'],
            'suffixes': ['.backup', '.corrupted', '_report.json', '.backup_20', '.ps1'],
            'exact_files': ['run.py', 'manifest.yaml', 'sync_usage_example.ts', 'temp_mcp_test.js'],
            'directories': ['scripts', '.refactor_backups', '.critical_protocols_backup', 'Ferramentas']
        }

    def should_preserve_file(self, file_path: Path) -> bool:
        """Determina se um arquivo deve ser preservado"""
        relative_path = file_path.relative_to(self.project_root)
        file_name = file_path.name
        
        # Preservar arquivos essenciais específicos
        if str(relative_path) in self.essential_files or file_name in self.essential_files:
            return True
            
        # Preservar arquivos em diretórios essenciais (exceto backups)
        for essential_dir in self.essential_dirs:
            if str(relative_path).startswith(essential_dir):
                # Mas remover backups mesmo dentro do src/
                if any(pattern in file_name for pattern in ['.backup', '.corrupted']):
                    return False
                return True
        
        return False

    def should_remove_file(self, file_path: Path) -> bool:
        """Determina se um arquivo deve ser removido"""
        file_name = file_path.name
        
        # Verificar prefixos de remoção
        for prefix in self.removal_patterns['prefixes']:
            if file_name.startswith(prefix):
                return True
                
        # Verificar sufixos de remoção  
        for suffix in self.removal_patterns['suffixes']:
            if suffix in file_name:
                return True
                
        # Verificar arquivos específicos para remoção
        if file_name in self.removal_patterns['exact_files']:
            return True
            
        return False

    def analyze_file(self, file_path: Path) -> str:
        """Analisa um arquivo e determina a ação: PRESERVE, REMOVE, ANALYZE"""
        if self.should_preserve_file(file_path):
            return "PRESERVE"
        elif self.should_remove_file(file_path):
            return "REMOVE"
        else:
            return "ANALYZE"

    def scan_project(self) -> Dict[str, List[Path]]:
        """Escaneia todo o projeto e categoriza arquivos"""
        categorized = {
            "PRESERVE": [],
            "REMOVE": [],
            "ANALYZE": []
        }
        
        print("🔍 Escaneando projeto...")
        
        for root, dirs, files in os.walk(self.project_root):
            root_path = Path(root)
            
            # Pular diretórios de remoção completamente
            dirs[:] = [d for d in dirs if d not in self.removal_patterns['directories']]
            
            # Verificar se o diretório inteiro deve ser removido
            dir_name = root_path.name
            if dir_name in self.removal_patterns['directories']:
                categorized["REMOVE"].append(root_path)
                continue
                
            # Analisar arquivos individuais
            for file in files:
                file_path = root_path / file
                
                # Pular arquivos ocultos do sistema
                if file.startswith('.') and file not in ['.gitignore', '.eslintrc.json']:
                    continue
                    
                action = self.analyze_file(file_path)
                categorized[action].append(file_path)
        
        return categorized

    def remove_item(self, path: Path) -> bool:
        """Remove arquivo ou diretório"""
        try:
            if self.dry_run:
                print(f"   [DRY-RUN] Removeria: {path}")
                return True
                
            if path.is_file():
                path.unlink()
                print(f"   ✅ Arquivo removido: {path}")
            elif path.is_dir():
                shutil.rmtree(path)
                print(f"   ✅ Diretório removido: {path}")
            
            self.removed_files.append(str(path))
            return True
            
        except Exception as e:
            print(f"   ❌ Erro ao remover {path}: {e}")
            return False

    def clean_project(self):
        """Executa a limpeza completa do projeto"""
        print("🧹 INICIANDO LIMPEZA DO PROJETO")
        print("=" * 50)
        
        if self.dry_run:
            print("⚠️  MODO PREVIEW - Nenhum arquivo será removido")
        else:
            print("🔴 MODO REAL - Arquivos serão removidos permanentemente!")
            
        print()
        
        # Escanear projeto
        categorized = self.scan_project()
        
        # Mostrar resumo
        print("\n📊 RESUMO DA ANÁLISE:")
        print(f"   🟢 Preservar: {len(categorized['PRESERVE'])} itens")
        print(f"   🔴 Remover: {len(categorized['REMOVE'])} itens")  
        print(f"   ⚠️  Analisar: {len(categorized['ANALYZE'])} itens")
        
        # Mostrar itens para análise manual (se houver)
        if categorized['ANALYZE']:
            print("\n⚠️  ITENS PARA ANÁLISE MANUAL:")
            for item in categorized['ANALYZE'][:10]:  # Mostrar apenas 10
                print(f"   - {item}")
            if len(categorized['ANALYZE']) > 10:
                print(f"   ... e mais {len(categorized['ANALYZE']) - 10} itens")
            
            print("\n   ℹ️  Estes itens não serão removidos automaticamente.")
        
        # Confirmar antes de prosseguir
        if not self.dry_run:
            confirm = input(f"\n❓ Confirma a remoção de {len(categorized['REMOVE'])} itens? (Digite 'CONFIRMO'): ")
            if confirm != 'CONFIRMO':
                print("❌ Operação cancelada pelo usuário.")
                return
        
        # Executar remoções
        print(f"\n🗑️  REMOVENDO {len(categorized['REMOVE'])} ITENS:")
        
        success_count = 0
        for item in categorized['REMOVE']:
            if self.remove_item(item):
                success_count += 1
        
        # Preservar arquivos essenciais (apenas log)
        print(f"\n🟢 PRESERVADOS {len(categorized['PRESERVE'])} ITENS ESSENCIAIS:")
        for item in categorized['PRESERVE'][:5]:  # Mostrar apenas alguns
            print(f"   ✅ {item}")
        if len(categorized['PRESERVE']) > 5:
            print(f"   ... e mais {len(categorized['PRESERVE']) - 5} itens")
        
        self.preserved_files = [str(p) for p in categorized['PRESERVE']]
        self.analysis_needed = [str(p) for p in categorized['ANALYZE']]
        
        # Estatísticas finais
        print(f"\n✨ LIMPEZA CONCLUÍDA!")
        print(f"   🗑️  Removidos: {success_count} itens")
        print(f"   🟢 Preservados: {len(categorized['PRESERVE'])} itens")
        print(f"   ⚠️  Para análise: {len(categorized['ANALYZE'])} itens")

    def generate_report(self):
        """Gera relatório detalhado da limpeza"""
        report = {
            "timestamp": datetime.now().isoformat(),
            "mode": "DRY_RUN" if self.dry_run else "REAL",
            "summary": {
                "removed_count": len(self.removed_files),
                "preserved_count": len(self.preserved_files), 
                "analysis_needed_count": len(self.analysis_needed)
            },
            "removed_files": self.removed_files,
            "preserved_files": self.preserved_files,
            "analysis_needed": self.analysis_needed,
            "essential_preserved": {
                "mcp_system": [f for f in self.preserved_files if any(mcp in f for mcp in ['mcp_', 'claude_desktop'])],
                "production_code": [f for f in self.preserved_files if 'src/' in f],
                "documentation": [f for f in self.preserved_files if 'Documentação' in f],
                "configs": [f for f in self.preserved_files if f.endswith(('.json', '.js', '.ts'))]
            }
        }
        
        report_file = f"cleanup_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
            
        print(f"\n📄 Relatório detalhado salvo em: {report_file}")
        
        return report_file


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Limpeza inteligente do projeto')
    parser.add_argument('--dry-run', action='store_true', default=True,
                       help='Modo preview (padrão - não remove arquivos)')
    parser.add_argument('--force', action='store_true',
                       help='Modo real (remove arquivos permanentemente)')
    
    args = parser.parse_args()
    
    # Se --force foi usado, desabilita dry-run
    dry_run = not args.force
    
    if not dry_run:
        print("⚠️  ATENÇÃO: Modo --force ativado!")
        print("   Arquivos serão removidos PERMANENTEMENTE!")
        print("   Recomenda-se fazer backup antes de prosseguir.")
        input("\n   Pressione ENTER para continuar ou Ctrl+C para cancelar...")
    
    # Executar limpeza
    cleaner = ProjectCleaner(dry_run=dry_run)
    cleaner.clean_project()
    cleaner.generate_report()
    
    if dry_run:
        print("\n💡 PRÓXIMOS PASSOS:")
        print("   1. Revise o relatório gerado")
        print("   2. Execute novamente com --force para remover os arquivos")
        print("   3. Comando: python cleanup_project.py --force")


if __name__ == "__main__":
    main()