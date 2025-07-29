#!/usr/bin/env python3
"""
Script para fazer o primeiro upload do Gerenciador de Tarefas para o GitHub
Baseado no repositório: gerenciador_task_v2
"""

import subprocess
import os
import sys

def run_command(command, description=""):
    """Executa um comando e mostra o resultado"""
    print(f"\n🔄 {description}")
    print(f"💻 Executando: {command}")
    
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        
        if result.stdout:
            print("✅ Saída:")
            print(result.stdout)
        
        if result.stderr and result.returncode != 0:
            print("⚠️ Erro:")
            print(result.stderr)
            return False
            
        return True
    except Exception as e:
        print(f"❌ Erro ao executar comando: {e}")
        return False

def check_git_status():
    """Verifica o status atual do Git"""
    print("📋 Verificando status atual do Git...")
    return run_command("git status", "Verificando arquivos para commit")

def upload_to_github():
    """Executa todos os comandos para subir o projeto para o GitHub"""
    
    print("🚀 INICIANDO UPLOAD DO PROJETO PARA GITHUB")
    print("=" * 50)
    
    # Verificar se estamos no diretório certo
    if not os.path.exists('.git'):
        print("❌ Erro: Não encontrei a pasta .git")
        print("💡 Certifique-se de estar no diretório raiz do projeto")
        return False
    
    # 1. Verificar status inicial
    print("\n📋 PASSO 1: Status inicial")
    if not check_git_status():
        print("⚠️ Problemas no status inicial, mas continuando...")
    
    # 2. Adicionar todos os arquivos
    print("\n📁 PASSO 2: Adicionando arquivos")
    if not run_command("git add .", "Adicionando todos os arquivos ao staging"):
        print("❌ Falha ao adicionar arquivos")
        return False
    
    # 3. Verificar o que será commitado
    print("\n👀 PASSO 3: Verificando arquivos para commit")
    run_command("git status --short", "Listando arquivos que serão commitados")
    
    # 4. Fazer o primeiro commit
    print("\n💾 PASSO 4: Fazendo primeiro commit")
    commit_message = "feat: primeiro commit - Gerenciador de Tarefas completo\\n\\n- Sistema completo de gerenciamento de tarefas\\n- Interface Next.js com TypeScript\\n- Scripts de automação e documentação\\n- Servidor MCP integrado"
    
    if not run_command(f'git commit -m "{commit_message}"', "Criando primeiro commit"):
        print("❌ Falha no commit")
        return False
    
    # 5. Configurar branch main
    print("\n🌿 PASSO 5: Configurando branch main")
    run_command("git branch -M main", "Definindo branch principal como main")
    
    # 6. Adicionar repositório remoto
    print("\n🔗 PASSO 6: Configurando repositório remoto")
    remote_url = "https://github.com/Piregil/gerenciador_task_v2.git"
    
    # Remover origin existente se houver
    run_command("git remote remove origin", "Removendo origin anterior (se existir)")
    
    if not run_command(f"git remote add origin {remote_url}", "Adicionando repositório remoto"):
        print("❌ Falha ao configurar repositório remoto")
        return False
    
    # 7. Fazer o push inicial
    print("\n⬆️ PASSO 7: Enviando para GitHub")
    if not run_command("git push -u origin main", "Fazendo primeiro push para GitHub"):
        print("❌ Falha no push")
        print("💡 Possíveis soluções:")
        print("   • Verifique se o repositório existe no GitHub")
        print("   • Confirme suas credenciais do Git")
        print("   • Tente: git push -u origin main --force (cuidado!)")
        return False
    
    # 8. Verificar resultado final
    print("\n✅ PASSO 8: Verificação final")
    run_command("git remote -v", "Verificando repositórios remotos configurados")
    run_command("git log --oneline -3", "Mostrando últimos commits")
    
    print("\n🎉 UPLOAD CONCLUÍDO COM SUCESSO!")
    print(f"🌐 Seu projeto está disponível em: {remote_url}")
    print("\n📝 Próximos passos:")
    print("   • Acesse o repositório no GitHub")
    print("   • Configure GitHub Pages se necessário") 
    print("   • Adicione colaboradores")
    print("   • Configure Actions/CI se desejar")
    
    return True

def main():
    """Função principal"""
    try:
        success = upload_to_github()
        
        if success:
            print("\n✨ Processo concluído com sucesso!")
            sys.exit(0)
        else:
            print("\n❌ Processo finalizado com erros")
            print("💡 Revise as mensagens acima para identificar problemas")
            sys.exit(1)
            
    except KeyboardInterrupt:
        print("\n⚠️ Processo interrompido pelo usuário")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Erro inesperado: {e}")
        sys.exit(1)

if __name__ == "__main__":
    # Verificar se estamos no diretório correto
    if not os.path.exists('package.json') or not os.path.exists('src'):
        print("❌ Erro: Execute este script no diretório raiz do projeto")
        print("💡 O script deve estar na mesma pasta que package.json e src/")
        sys.exit(1)
    
    main()