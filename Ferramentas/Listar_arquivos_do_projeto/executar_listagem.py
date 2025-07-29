#!/usr/bin/env python3
"""
Executor para Listagem de Arquivos do Projeto
Script simplificado que chama o listar_arquivos.py com o manifest correto
"""

import subprocess
import sys
from pathlib import Path

def main():
    """Executa o script de listagem de arquivos"""
    
    listar_script = Path("listar_arquivos.py")
    manifest_file = Path("manifest_listagem.yaml")
    
    if not listar_script.exists():
        print("[ERRO] Arquivo 'listar_arquivos.py' não encontrado!")
        print("   Certifique-se de que o script está no diretório atual.")
        sys.exit(1)
    
    if not manifest_file.exists():
        print("[ERRO] Arquivo 'manifest_listagem.yaml' não encontrado!")
        print("   Certifique-se de que o manifesto está no diretório atual.")
        sys.exit(1)
    
    print(">> Iniciando listagem de arquivos do projeto...")
    print(f"Diretório de execução: {Path.cwd()}")
    print("─" * 50)
    
    try:
        result = subprocess.run([
            sys.executable, 
            str(listar_script), 
            str(manifest_file)
        ], capture_output=True, text=True, check=False, encoding='utf-8', errors='replace')
        
        if result.stdout:
            print(result.stdout)
        
        if result.stderr:
            print("--- Log do Processo Interno ---")
            print(result.stderr)
            print("-------------------------------")
        
        if result.returncode == 0:
            print("\n[SUCESSO] Listagem concluída!")
            
            output_file = Path("lista_arquivos_projeto.txt")
            if output_file.exists():
                file_size = round(output_file.stat().st_size / 1024, 2)
                print(f"--> Arquivo gerado: {output_file.name}")
                print(f"Tamanho: {file_size} KB")
            else:
                print("[AVISO] Arquivo de saída não encontrado.")
        else:
            print(f"\n[ERRO] A execução do script de listagem falhou (código: {result.returncode})")
            sys.exit(1)
            
    except FileNotFoundError:
        print("[ERRO] Python não encontrado ou não está no PATH do sistema.")
        sys.exit(1)
    except Exception as e:
        print(f"[ERRO] Ocorreu um erro inesperado: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main()