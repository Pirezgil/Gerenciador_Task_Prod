#!/usr/bin/env python3
"""
Atualizador de .gitignore para Gerenciador de Tarefas
Adiciona regras específicas mantendo arquivos essenciais para colaboração
"""

import os
import shutil
from datetime import datetime

def update_gitignore():
    """Atualiza o .gitignore com regras específicas do projeto"""
    
    gitignore_path = '.gitignore'
    
    # Fazer backup do arquivo atual
    if os.path.exists(gitignore_path):
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        backup_path = f'.gitignore.backup_{timestamp}'
        shutil.copy(gitignore_path, backup_path)
        print(f"✅ Backup criado: {backup_path}")
    
    # Ler conteúdo atual (se existir)
    current_content = ""
    if os.path.exists(gitignore_path):
        with open(gitignore_path, 'r', encoding='utf-8') as f:
            current_content = f.read().strip()
    
    # Novas regras específicas do projeto
    new_rules = """
# =================================================================
# REGRAS ESPECÍFICAS DO PROJETO GERENCIADOR DE TAREFAS
# =================================================================

# Relatórios automáticos de limpeza (arquivos muito grandes)
cleanup_report_*.json
*_report_*.json

# Arquivos de backup temporários
*.backup
*.backup_*
.backup_*
.refactor_backups/
.critical_protocols_backup/

# Logs de navegação e configurações temporárias
navigation_*.json
*_log.json
execution_report.json

# Arquivos temporários de execução de scripts
*.temp.py
temp_*.py
test_*.py

# Outputs de ferramentas de análise
analysis_output/
debug_output/

# Cache de ferramentas Python
__pycache__/
*.pyc
*.pyo
*.pyd
.Python

# Arquivos de configuração local específicos
local_config.json
.env.development
.env.production

# =================================================================
# MANTÉM NO GIT (IMPORTANTES PARA COLABORAÇÃO):
# - Documentação/ (essencial para o projeto)
# - scripts/ (úteis para outros desenvolvedores) 
# - Ferramentas/ (scripts de automação)
# - src/ (código fonte)
# - Configurações do projeto (package.json, tsconfig.json, etc.)
# =================================================================
"""
    
    # Combinar conteúdo atual com novas regras
    if current_content:
        final_content = current_content + "\n" + new_rules
    else:
        final_content = new_rules.lstrip()
    
    # Escrever arquivo atualizado
    with open(gitignore_path, 'w', encoding='utf-8') as f:
        f.write(final_content)
    
    print("✅ .gitignore atualizado com sucesso!")
    
    # Mostrar resumo do que foi feito
    print("\n📋 Resumo das mudanças:")
    print("   ✅ Mantém: Documentação, scripts, código fonte")
    print("   ❌ Exclui: Relatórios de limpeza, backups, logs temporários")
    print("   ✅ Preserva: Regras antigas do .gitignore")
    
    # Mostrar arquivos que serão ignorados
    print("\n🚫 Principais arquivos que serão ignorados:")
    ignored_examples = [
        "cleanup_report_20250729_141606.json (3MB+)",
        "*.backup_* (arquivos de backup temporários)",
        "navigation_standardization_log.json",
        "lista_arquivos_projeto.txt",
        "Todos os arquivos temporários de cache"
    ]
    
    for example in ignored_examples:
        print(f"   • {example}")
    
    print("\n💡 Dica: Execute 'git status' para ver quais arquivos serão removidos do tracking")
    return True

if __name__ == "__main__":
    try:
        update_gitignore()
        print("\n🎉 Concluído! Seu .gitignore está otimizado para colaboração.")
    except Exception as e:
        print(f"❌ Erro: {e}")
        print("💡 Verifique se você está no diretório raiz do projeto")