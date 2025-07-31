#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
CORREÇÃO CRÍTICA - Gerenciador_Task
Resolve os 4 problemas críticos identificados na análise arquitetural

PROBLEMAS ABORDADOS:
1. Store tasksStore.ts sobregregado (40KB → stores especializados)
2. TaskItem.tsx com falhas recorrentes (simplificação)
3. Conflitos de hidratação Next.js (implementação adequada)
4. Componentes de energia conflitantes (unificação)
"""

import yaml
import json
import os
import shutil
import re
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, List

class CriticalFixRunner:
    def __init__(self, manifest_path: str, dry_run: bool = False):
        self.manifest_path = manifest_path
        self.dry_run = dry_run
        self.project_root = Path.cwd()
        self.backup_dir = self.project_root / ".backup_critical_fix"
        self.execution_log = []
        
        # Criar diretório de backup
        if not self.dry_run:
            self.backup_dir.mkdir(exist_ok=True)
    
    def log(self, message: str, level: str = "INFO"):
        """Log de operações com timestamp"""
        timestamp = datetime.now().strftime("%H:%M:%S")
        log_entry = f"[{timestamp}] [{level}] {message}"
        print(log_entry)
        self.execution_log.append(log_entry)
    
    def backup_file(self, file_path: Path) -> bool:
        """Criar backup de arquivo antes de modificar"""
        if not file_path.exists():
            return True
            
        try:
            if not self.dry_run:
                backup_path = self.backup_dir / file_path.name
                counter = 1
                while backup_path.exists():
                    name_parts = file_path.name.split('.')
                    if len(name_parts) > 1:
                        backup_name = f"{'.'.join(name_parts[:-1])}_{counter}.{name_parts[-1]}"
                    else:
                        backup_name = f"{file_path.name}_{counter}"
                    backup_path = self.backup_dir / backup_name
                    counter += 1
                
                shutil.copy2(file_path, backup_path)
                self.log(f"Backup criado: {backup_path.name}")
            else:
                self.log(f"[DRY-RUN] Backup: {file_path.name}")
            return True
        except Exception as e:
            self.log(f"ERRO ao criar backup de {file_path}: {e}", "ERROR")
            return False
    
    def create_file(self, path: str, content: str) -> bool:
        """Criar novo arquivo"""
        file_path = self.project_root / path
        
        try:
            if not self.dry_run:
                file_path.parent.mkdir(parents=True, exist_ok=True)
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.log(f"Arquivo criado: {path}")
            else:
                self.log(f"[DRY-RUN] Criar: {path}")
            return True
        except Exception as e:
            self.log(f"ERRO ao criar {path}: {e}", "ERROR")
            return False
    
    def update_file(self, path: str, content: str) -> bool:
        """Atualizar arquivo existente"""
        file_path = self.project_root / path
        
        if not file_path.exists():
            self.log(f"AVISO: Arquivo não existe, criando: {path}", "WARN")
            return self.create_file(path, content)
        
        # Backup primeiro
        if not self.backup_file(file_path):
            return False
        
        try:
            if not self.dry_run:
                with open(file_path, 'w', encoding='utf-8') as f:
                    f.write(content)
                self.log(f"Arquivo atualizado: {path}")
            else:
                self.log(f"[DRY-RUN] Atualizar: {path}")
            return True
        except Exception as e:
            self.log(f"ERRO ao atualizar {path}: {e}", "ERROR")
            return False
    
    def apply_regex_replacement(self, path: str, operations: List[Dict]) -> bool:
        """Aplicar substituições via regex"""
        file_path = self.project_root / path
        
        if not file_path.exists():
            self.log(f"ERRO: Arquivo não encontrado: {path}", "ERROR")
            return False
        
        # Backup primeiro
        if not self.backup_file(file_path):
            return False
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            original_content = content
            
            for op in operations:
                pattern = op['pattern']
                replacement = op['replacement']
                flags = 0
                
                if op.get('multiline', False):
                    flags |= re.MULTILINE
                if op.get('dotall', False):
                    flags |= re.DOTALL
                if op.get('ignorecase', False):
                    flags |= re.IGNORECASE
                
                content = re.sub(pattern, replacement, content, flags=flags)
                self.log(f"Regex aplicado: {pattern[:50]}...")
            
            if content != original_content:
                if not self.dry_run:
                    with open(file_path, 'w', encoding='utf-8') as f:
                        f.write(content)
                    self.log(f"Arquivo modificado via regex: {path}")
                else:
                    self.log(f"[DRY-RUN] Modificar via regex: {path}")
                return True
            else:
                self.log(f"Nenhuma alteração necessária: {path}")
                return True
                
        except Exception as e:
            self.log(f"ERRO ao aplicar regex em {path}: {e}", "ERROR")
            return False
    
    def validate_typescript_syntax(self, path: str) -> bool:
        """Validar sintaxe TypeScript básica"""
        file_path = self.project_root / path
        
        if not file_path.exists():
            return False
        
        try:
            with open(file_path, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Validações básicas
            checks = [
                ('Parênteses balanceados', self._check_balanced_parens(content)),
                ('Chaves balanceadas', self._check_balanced_braces(content)),
                ('Imports válidos', self._check_imports(content)),
                ('Exports válidos', self._check_exports(content))
            ]
            
            all_valid = True
            for check_name, is_valid in checks:
                if not is_valid:
                    self.log(f"VALIDAÇÃO FALHOU: {check_name} em {path}", "ERROR")
                    all_valid = False
                else:
                    self.log(f"✓ {check_name}")
            
            return all_valid
            
        except Exception as e:
            self.log(f"ERRO na validação de {path}: {e}", "ERROR")
            return False
    
    def _check_balanced_parens(self, content: str) -> bool:
        """Verificar parênteses balanceados"""
        count = 0
        for char in content:
            if char == '(':
                count += 1
            elif char == ')':
                count -= 1
                if count < 0:
                    return False
        return count == 0
    
    def _check_balanced_braces(self, content: str) -> bool:
        """Verificar chaves balanceadas"""
        count = 0
        for char in content:
            if char == '{':
                count += 1
            elif char == '}':
                count -= 1
                if count < 0:
                    return False
        return count == 0
    
    def _check_imports(self, content: str) -> bool:
        """Verificar imports básicos"""
        import_lines = [line for line in content.split('\n') if line.strip().startswith('import')]
        for line in import_lines:
            if not (';' in line or line.endswith("'")):
                return False
        return True
    
    def _check_exports(self, content: str) -> bool:
        """Verificar exports básicos"""
        # Verificação simples - exports devem ter estrutura válida
        return 'export' in content
    
    def process_manifest(self) -> Dict[str, Any]:
        """Processar manifesto principal"""
        try:
            with open(self.manifest_path, 'r', encoding='utf-8') as f:
                manifest = yaml.safe_load(f)
            
            self.log("Manifesto carregado com sucesso")
            
            # Validar estrutura
            required_sections = ['version', 'metadata', 'critical_fixes']
            for section in required_sections:
                if section not in manifest:
                    raise ValueError(f"Seção obrigatória ausente: {section}")
            
            # Processar correções críticas
            success_count = 0
            total_fixes = len(manifest['critical_fixes'])
            
            self.log(f"Iniciando {total_fixes} correções críticas...")
            
            for i, fix in enumerate(manifest['critical_fixes'], 1):
                self.log(f"\n--- CORREÇÃO {i}/{total_fixes}: {fix['name']} ---")
                
                if self._process_fix(fix):
                    success_count += 1
                    self.log(f"✓ Correção {i} concluída com sucesso")
                else:
                    self.log(f"✗ Correção {i} falhou", "ERROR")
            
            # Validações pós-correção
            self.log("\n--- VALIDAÇÕES PÓS-CORREÇÃO ---")
            self._run_post_validations(manifest.get('validations', []))
            
            # Relatório final
            success_rate = (success_count / total_fixes) * 100
            self.log(f"\n=== RELATÓRIO FINAL ===")
            self.log(f"Correções aplicadas: {success_count}/{total_fixes} ({success_rate:.1f}%)")
            self.log(f"Backup localizado em: {self.backup_dir}")
            
            return {
                'success': success_count == total_fixes,
                'applied_fixes': success_count,
                'total_fixes': total_fixes,
                'success_rate': success_rate,
                'backup_dir': str(self.backup_dir),
                'execution_log': self.execution_log
            }
            
        except Exception as e:
            self.log(f"ERRO CRÍTICO: {e}", "ERROR")
            return {
                'success': False,
                'error': str(e),
                'execution_log': self.execution_log
            }
    
    def _process_fix(self, fix: Dict[str, Any]) -> bool:
        """Processar uma correção individual"""
        fix_type = fix['type']
        
        try:
            if fix_type == 'create_file':
                return self.create_file(fix['path'], fix['content'])
            
            elif fix_type == 'update_file':
                return self.update_file(fix['path'], fix['content'])
            
            elif fix_type == 'regex_replacement':
                return self.apply_regex_replacement(fix['path'], fix['operations'])
            
            elif fix_type == 'validation':
                if fix['validator'] == 'typescript_syntax':
                    return self.validate_typescript_syntax(fix['path'])
                else:
                    self.log(f"Validador desconhecido: {fix['validator']}", "WARN")
                    return True
            
            else:
                self.log(f"Tipo de correção desconhecido: {fix_type}", "ERROR")
                return False
                
        except Exception as e:
            self.log(f"ERRO ao processar correção {fix_type}: {e}", "ERROR")
            return False
    
    def _run_post_validations(self, validations: List[Dict]) -> None:
        """Executar validações pós-correção"""
        for validation in validations:
            self.log(f"Validando: {validation['name']}")
            
            if validation['type'] == 'file_exists':
                file_path = self.project_root / validation['path']
                if file_path.exists():
                    self.log(f"✓ {validation['name']}")
                else:
                    self.log(f"✗ {validation['name']}", "ERROR")
            
            elif validation['type'] == 'typescript_syntax':
                if self.validate_typescript_syntax(validation['path']):
                    self.log(f"✓ {validation['name']}")
                else:
                    self.log(f"✗ {validation['name']}", "ERROR")


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Correção Crítica - Gerenciador_Task')
    parser.add_argument('manifest', help='Caminho para o manifesto YAML')
    parser.add_argument('--dry-run', action='store_true', help='Simular execução sem fazer alterações')
    parser.add_argument('--verbose', action='store_true', help='Saída detalhada')
    
    args = parser.parse_args()
    
    print("🔧 CORREÇÃO CRÍTICA - Gerenciador_Task")
    print("=" * 50)
    
    if args.dry_run:
        print("⚠️  MODO DRY-RUN: Nenhuma alteração será feita")
        print()
    
    runner = CriticalFixRunner(args.manifest, args.dry_run)
    result = runner.process_manifest()
    
    if result['success']:
        print("\n✅ CORREÇÃO CONCLUÍDA COM SUCESSO!")
        if not args.dry_run:
            print(f"📁 Backups salvos em: {result['backup_dir']}")
        print(f"📊 Taxa de sucesso: {result['success_rate']:.1f}%")
    else:
        print("\n❌ CORREÇÃO FALHOU!")
        if 'error' in result:
            print(f"💥 Erro: {result['error']}")
        print("🔄 Verifique os logs acima e tente novamente")
    
    # Salvar log detalhado
    if not args.dry_run:
        log_file = Path('critical_fix_log.txt')
        with open(log_file, 'w', encoding='utf-8') as f:
            f.write('\n'.join(result['execution_log']))
        print(f"📝 Log detalhado salvo em: {log_file}")


if __name__ == '__main__':
    main()