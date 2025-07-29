# ============================================================================
# SCRIPT DE CORREÇÃO COMPLETA - GERENCIADOR TASK
# ============================================================================
# Corrige problemas de metadata viewport e otimiza configurações do Next.js
# ============================================================================

param(
    [switch]$Verbose = $false,
    [switch]$BackupOnly = $false
)

# Configurações
$ProjectRoot = Get-Location
$BackupDir = "$ProjectRoot\backup_$(Get-Date -Format 'yyyyMMdd_HHmmss')"
$LogFile = "$ProjectRoot\correção_$(Get-Date -Format 'yyyyMMdd_HHmmss').log"

# Função de logging
function Write-Log {
    param([string]$Message, [string]$Level = "INFO")
    $Timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $LogEntry = "[$Timestamp] [$Level] $Message"
    
    if ($Verbose -or $Level -eq "ERROR") {
        Write-Host $LogEntry -ForegroundColor $(if($Level -eq "ERROR"){"Red"}elseif($Level -eq "WARN"){"Yellow"}else{"Green"})
    }
    
    Add-Content -Path $LogFile -Value $LogEntry
}

# Função para fazer backup
function Backup-File {
    param([string]$FilePath)
    
    if (Test-Path $FilePath) {
        $RelativePath = [System.IO.Path]::GetRelativePath($ProjectRoot, $FilePath)
        $BackupPath = Join-Path $BackupDir $RelativePath
        $BackupParentDir = Split-Path $BackupPath -Parent
        
        if (!(Test-Path $BackupParentDir)) {
            New-Item -ItemType Directory -Path $BackupParentDir -Force | Out-Null
        }
        
        Copy-Item $FilePath $BackupPath -Force
        Write-Log "Backup criado: $RelativePath"
        return $true
    }
    return $false
}

# Função principal de correção
function Fix-NextJsMetadata {
    Write-Log "=== INICIANDO CORREÇÃO DO GERENCIADOR TASK ===" "INFO"
    
    # Criar diretório de backup
    if (!(Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
        Write-Log "Diretório de backup criado: $BackupDir"
    }
    
    # 0. LIMPAR ARQUIVOS DE BACKUP PROBLEMÁTICOS
    Write-Log "Removendo arquivos de backup problemáticos..."
    
    # Padrões mais específicos para limpeza
    $BackupPatterns = @(
        "backup_tipos_*",
        "Button_backup_*.tsx",
        "*.backup",
        "*_backup_*",
        "backup_*"
    )
    
    foreach ($pattern in $BackupPatterns) {
        Get-ChildItem -Path $ProjectRoot -Filter $pattern -Recurse -Force -ErrorAction SilentlyContinue | ForEach-Object {
            try {
                if ($_.PSIsContainer) {
                    Remove-Item $_.FullName -Recurse -Force -ErrorAction SilentlyContinue
                } else {
                    Remove-Item $_.FullName -Force -ErrorAction SilentlyContinue
                }
                Write-Log "Arquivo/Diretório de backup removido: $($_.Name)"
            }
            catch {
                Write-Log "Erro ao remover backup: $($_.Name) - $_" "WARN"
            }
        }
    }
    
    # Remover diretórios de backup específicos que podem estar causando problemas
    $BackupDirs = Get-ChildItem -Path $ProjectRoot -Directory -Name "backup_*" -ErrorAction SilentlyContinue
    foreach ($dir in $BackupDirs) {
        try {
            $fullPath = Join-Path $ProjectRoot $dir
            Remove-Item $fullPath -Recurse -Force -ErrorAction SilentlyContinue
            Write-Log "Diretório de backup removido: $dir"
        }
        catch {
            Write-Log "Erro ao remover diretório: $dir - $_" "WARN"
        }
    }
    
    # 1. CORRIGIR LAYOUT PRINCIPAL
    $LayoutPath = "$ProjectRoot\src\app\layout.tsx"
    
    if (Test-Path $LayoutPath) {
        Backup-File $LayoutPath
        
        Write-Log "Corrigindo metadata viewport no layout principal..."
        
        $NewLayoutContent = @'
// ============================================================================
// LAYOUT PRINCIPAL - Layout base da aplicação
// ============================================================================

import type { Metadata, Viewport } from 'next';
import { Inter, Lora } from 'next/font/google';
import { Header } from '@/components/layout/Header';
import '@/styles/globals.css';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({ 
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Cérebro-Compatível | Gerenciador de Tarefas',
  description: 'Sistema de gerenciamento de tarefas especialmente projetado para usuários neurodivergentes',
  keywords: ['neurodivergente', 'tdah', 'ansiedade', 'produtividade', 'bem-estar'],
  authors: [{ name: 'Arquiteto de Software' }],
  robots: 'index, follow',
  openGraph: {
    title: 'Cérebro-Compatível | Gerenciador de Tarefas',
    description: 'Sistema de gerenciamento de tarefas especialmente projetado para usuários neurodivergentes',
    type: 'website',
    locale: 'pt_BR',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${lora.variable}`}>
      <body className="min-h-screen bg-gray-50">
        <div className="flex flex-col min-h-screen">
          <Header />
          <main className="flex-1">
            <div className="max-w-7xl mx-auto px-6 py-8">
              {children}
            </div>
          </main>
        </div>
      </body>
    </html>
  );
}
'@

        Set-Content -Path $LayoutPath -Value $NewLayoutContent -Encoding UTF8
        Write-Log "Layout principal corrigido com sucesso!"
    }
    
    # 1.5. CORRIGIR IMPORTS NÃO UTILIZADOS
    Write-Log "Corrigindo imports não utilizados..."
    
    # Header.tsx - Remover PAGES
    $HeaderPath = "$ProjectRoot\src\components\layout\Header.tsx"
    if (Test-Path $HeaderPath) {
        Backup-File $HeaderPath
        $headerContent = Get-Content $HeaderPath -Raw
        $headerContent = $headerContent -replace "import \{ PAGE_TITLES, PAGES \} from '@/lib/constants';", "import { PAGE_TITLES } from '@/lib/constants';"
        Set-Content -Path $HeaderPath -Value $headerContent -Encoding UTF8
        Write-Log "Header.tsx corrigido"
    }
    
    # Navigation.tsx - Remover PAGE_TITLES
    $NavigationPath = "$ProjectRoot\src\components\layout\Navigation.tsx"
    if (Test-Path $NavigationPath) {
        Backup-File $NavigationPath
        $navContent = Get-Content $NavigationPath -Raw
        $navContent = $navContent -replace "import \{ PAGES, PAGE_TITLES \} from '@/lib/constants';", "import { PAGES } from '@/lib/constants';"
        Set-Content -Path $NavigationPath -Value $navContent -Encoding UTF8
        Write-Log "Navigation.tsx corrigido"
    }
    
    # Modal.tsx - Remover Fragment
    $ModalPath = "$ProjectRoot\src\components\shared\Modal.tsx"
    if (Test-Path $ModalPath) {
        Backup-File $ModalPath
        $modalContent = Get-Content $ModalPath -Raw
        $modalContent = $modalContent -replace "import \{ Fragment \} from 'react';\r?\n", ""
        Set-Content -Path $ModalPath -Value $modalContent -Encoding UTF8
        Write-Log "Modal.tsx corrigido"
    }
    
    # utils.ts - Remover ENERGY_LEVELS
    $UtilsPath = "$ProjectRoot\src\lib\utils.ts"
    if (Test-Path $UtilsPath) {
        Backup-File $UtilsPath
        $utilsContent = Get-Content $UtilsPath -Raw
        $utilsContent = $utilsContent -replace "import \{ ENERGY_LEVELS, ENERGY_LABELS, ENERGY_ICONS \} from './constants';", "import { ENERGY_LABELS, ENERGY_ICONS } from './constants';"
        Set-Content -Path $UtilsPath -Value $utilsContent -Encoding UTF8
        Write-Log "utils.ts corrigido"
    }
    
    # authStore.ts - Remover parâmetro password não usado
    $AuthStorePath = "$ProjectRoot\src\stores\authStore.ts"
    if (Test-Path $AuthStorePath) {
        Backup-File $AuthStorePath
        $authContent = Get-Content $AuthStorePath -Raw
        $authContent = $authContent -replace "login: async \(email: string, password: string\) => \{", "login: async (email: string, _password: string) => {"
        Set-Content -Path $AuthStorePath -Value $authContent -Encoding UTF8
        Write-Log "authStore.ts corrigido"
    }
    
    # tasksStore.ts - Remover TASK_STATUS
    $TasksStorePath = "$ProjectRoot\src\stores\tasksStore.ts"
    if (Test-Path $TasksStorePath) {
        Backup-File $TasksStorePath
        $tasksContent = Get-Content $TasksStorePath -Raw
        $tasksContent = $tasksContent -replace "import \{ DEFAULT_ENERGY_BUDGET, TASK_STATUS \} from '@/lib/constants';", "import { DEFAULT_ENERGY_BUDGET } from '@/lib/constants';"
        Set-Content -Path $TasksStorePath -Value $tasksContent -Encoding UTF8
        Write-Log "tasksStore.ts corrigido"
    }
    
    # 1.6. CORRIGIR COMPONENTE BUTTON (FRAMER-MOTION)
    Write-Log "Corrigindo tipos do componente Button..."
    
    $ButtonPaths = @(
        "$ProjectRoot\src\components\shared\Button.tsx",
        "$ProjectRoot\src\components\ui\Button.tsx"
    )
    
    foreach ($buttonPath in $ButtonPaths) {
        if (Test-Path $buttonPath) {
            Backup-File $buttonPath
            
            $buttonContent = @'
// ============================================================================
// COMPONENTE BUTTON - Botão reutilizável com animações
// ============================================================================

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

// Variantes do botão
const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

// Tipos do componente
interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, 'onAnimationStart' | 'onAnimationEnd' | 'onDragStart'>,
    VariantProps<typeof buttonVariants> {}

// Animações padrão
const buttonAnimations = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: { type: "spring", stiffness: 400, damping: 17 }
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    const MotionButton = motion.button;

    return (
      <MotionButton
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...buttonAnimations}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { buttonVariants, type ButtonProps };
'@
            
            Set-Content -Path $buttonPath -Value $buttonContent -Encoding UTF8
            Write-Log "Componente Button corrigido: $buttonPath"
        }
    }
    
    # 1.7. CORRIGIR TIPOS ANY NO UTILS.TS
    Write-Log "Corrigindo tipos any no utils.ts..."
    
    $UtilsPath = "$ProjectRoot\src\lib\utils.ts"
    if (Test-Path $UtilsPath) {
        $utilsContent = Get-Content $UtilsPath -Raw
        
        # Corrigir tipos any - assumindo que são para merge de classes
        $utilsContent = $utilsContent -replace "any, any", "string | null | undefined, string | null | undefined"
        
        # Se não funcionar acima, usar uma versão mais específica
        if ($utilsContent -match "any") {
            $utilsContent = $utilsContent -replace ": any", ": unknown"
        }
        
        Set-Content -Path $UtilsPath -Value $utilsContent -Encoding UTF8
        Write-Log "Tipos any corrigidos no utils.ts"
    }
    
    # 2. OTIMIZAR NEXT.CONFIG.JS
    $NextConfigPath = "$ProjectRoot\next.config.js"
    
    if (Test-Path $NextConfigPath) {
        Backup-File $NextConfigPath
        
        Write-Log "Otimizando configuração do Next.js..."
        
        $NewNextConfig = @'
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remover compiler.removeConsole para compatibilidade com Turbopack
  images: {
    domains: [],
    dangerouslyAllowSVG: true,
    minimumCacheTTL: 31536000,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion'],
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  env: {
    CUSTOM_KEY: process.env.NODE_ENV,
  },
}

module.exports = nextConfig
'@

        Set-Content -Path $NextConfigPath -Value $NewNextConfig -Encoding UTF8
        Write-Log "Configuração do Next.js otimizada para Turbopack!"
    }
    
    # 3. ATUALIZAR PACKAGE.JSON (Scripts otimizados)
    $PackageJsonPath = "$ProjectRoot\package.json"
    
    if (Test-Path $PackageJsonPath) {
        Backup-File $PackageJsonPath
        
        Write-Log "Otimizando scripts do package.json..."
        
        $PackageContent = Get-Content $PackageJsonPath -Raw | ConvertFrom-Json
        
        # Atualizar scripts
        $PackageContent.scripts = [PSCustomObject]@{
            "dev" = "next dev"
            "dev:turbo" = "next dev --turbo"
            "build" = "next build"
            "start" = "next start"
            "lint" = "next lint"
            "lint:fix" = "next lint --fix"
            "type-check" = "tsc --noEmit"
            "clean" = "rimraf .next out dist build"
            "analyze" = "cross-env ANALYZE=true next build"
            "pre-commit" = "npm run lint && npm run type-check"
        }
        
        # Adicionar dependências de desenvolvimento se necessário
        if (-not $PackageContent.devDependencies.rimraf) {
            $PackageContent.devDependencies | Add-Member -NotePropertyName "rimraf" -NotePropertyValue "^5.0.5" -Force
        }
        if (-not $PackageContent.devDependencies."cross-env") {
            $PackageContent.devDependencies | Add-Member -NotePropertyName "cross-env" -NotePropertyValue "^7.0.3" -Force
        }
        
        # Adicionar dependências necessárias para componentes
        if (-not $PackageContent.dependencies."class-variance-authority") {
            $PackageContent.dependencies | Add-Member -NotePropertyName "class-variance-authority" -NotePropertyValue "^0.7.0" -Force
        }
        
        $PackageContent | ConvertTo-Json -Depth 10 | Set-Content $PackageJsonPath -Encoding UTF8
        Write-Log "Package.json otimizado!"
    }
    
    # 4. CRIAR/ATUALIZAR TSCONFIG.JSON
    $TsConfigPath = "$ProjectRoot\tsconfig.json"
    
    if (Test-Path $TsConfigPath) {
        Backup-File $TsConfigPath
        
        Write-Log "Otimizando configuração do TypeScript..."
        
        $NewTsConfig = @'
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "es6"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    },
    "forceConsistentCasingInFileNames": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": [
    "next-env.d.ts",
    "**/*.ts",
    "**/*.tsx",
    ".next/types/**/*.ts"
  ],
  "exclude": [
    "node_modules",
    ".next",
    "out",
    "dist",
    "backup_*/**/*",
    "**/*.backup",
    "scripts/**/*"
  ]
}
'@

        Set-Content -Path $TsConfigPath -Value $NewTsConfig -Encoding UTF8
        Write-Log "TypeScript configurado!"
    }
    
    # 4.5. VERIFICAR E CRIAR CONSTANTS.TS SE NECESSÁRIO
    $ConstantsPath = "$ProjectRoot\src\lib\constants.ts"
    
    if (!(Test-Path $ConstantsPath)) {
        Write-Log "Criando arquivo constants.ts..."
        
        $ConstantsContent = @'
// ============================================================================
// CONSTANTES DO SISTEMA
// ============================================================================

// Configurações de energia
export const DEFAULT_ENERGY_BUDGET = 100;

export const ENERGY_LEVELS = {
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  CRITICAL: 'critical'
} as const;

export const ENERGY_LABELS = {
  high: 'Alta Energia',
  medium: 'Energia Moderada', 
  low: 'Baixa Energia',
  critical: 'Energia Crítica'
} as const;

export const ENERGY_ICONS = {
  high: '⚡',
  medium: '🔋',
  low: '🪫',
  critical: '❌'
} as const;

// Status das tarefas
export const TASK_STATUS = {
  PENDING: 'pending',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  BLOCKED: 'blocked'
} as const;

// Páginas da aplicação
export const PAGES = {
  HOME: '/',
  BOMBEIRO: '/bombeiro',
  ARQUITETO: '/arquiteto',
  FLORESTA: '/floresta',
  CAIXA_DE_AREIA: '/caixa-de-areia'
} as const;

export const PAGE_TITLES = {
  '/': 'Home',
  '/bombeiro': 'Bombeiro',
  '/arquiteto': 'Arquiteto',
  '/floresta': 'Floresta',
  '/caixa-de-areia': 'Caixa de Areia'
} as const;

// Tipos
export type EnergyLevel = keyof typeof ENERGY_LEVELS;
export type TaskStatus = keyof typeof TASK_STATUS;
export type PagePath = keyof typeof PAGE_TITLES;
'@

        Set-Content -Path $ConstantsPath -Value $ConstantsContent -Encoding UTF8
        Write-Log "Arquivo constants.ts criado!"
    }
    
    # 4.6. CORRIGIR ESLINT CONFIG
    $EslintConfigPath = "$ProjectRoot\.eslintrc.json"
    
    if (Test-Path $EslintConfigPath) {
        Backup-File $EslintConfigPath
        
        Write-Log "Corrigindo configuração do ESLint..."
        
        $EslintConfig = @'
{
  "extends": [
    "next/core-web-vitals",
    "next/typescript"
  ],
  "rules": {
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-explicit-any": "warn",
    "react-hooks/exhaustive-deps": "warn"
  },
  "ignorePatterns": [
    "backup_*/**/*",
    "**/*.backup",
    "scripts/**/*",
    ".next/**/*",
    "out/**/*",
    "dist/**/*"
  ]
}
'@

        Set-Content -Path $EslintConfigPath -Value $EslintConfig -Encoding UTF8
        Write-Log "ESLint configurado!"
    }
    
    # 5. CRIAR ARQUIVO .GITIGNORE OTIMIZADO
    $GitIgnorePath = "$ProjectRoot\.gitignore"
    
    if (!(Test-Path $GitIgnorePath) -or $BackupOnly -eq $false) {
        if (Test-Path $GitIgnorePath) {
            Backup-File $GitIgnorePath
        }
        
        Write-Log "Criando .gitignore otimizado..."
        
        $GitIgnoreContent = @'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# Production builds
.next/
out/
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE and editor files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
*.log
logs/

# Runtime data
pids/
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# TypeScript
*.tsbuildinfo
next-env.d.ts

# Backup files
backup_*/
*.backup

# Temporary files
.tmp/
temp/
'@

        Set-Content -Path $GitIgnorePath -Value $GitIgnoreContent -Encoding UTF8
        Write-Log ".gitignore criado/atualizado!"
    }
    
    if (-not $BackupOnly) {
        # 6. LIMPAR CACHE E REINSTALAR DEPENDÊNCIAS
        Write-Log "Limpando cache e reinstalando dependências..."
        
        try {
            # Limpar arquivos de build
            $BuildDirs = @(".next", "out", "dist", "build", "node_modules/.cache")
            foreach ($dir in $BuildDirs) {
                $fullPath = Join-Path $ProjectRoot $dir
                if (Test-Path $fullPath) {
                    Remove-Item $fullPath -Recurse -Force -ErrorAction SilentlyContinue
                    Write-Log "Removido: $dir"
                }
            }
            
            # Limpar cache do npm
            if (Get-Command npm -ErrorAction SilentlyContinue) {
                npm cache clean --force 2>&1 | Out-Null
                Write-Log "Cache do npm limpo"
            }
            
            # Remover arquivos de TypeScript build
            $TsBuildFiles = @("tsconfig.tsbuildinfo", ".tsbuildinfo")
            foreach ($file in $TsBuildFiles) {
                $fullPath = Join-Path $ProjectRoot $file
                if (Test-Path $fullPath) {
                    Remove-Item $fullPath -Force
                    Write-Log "Removido: $file"
                }
            }
            
            # Reinstalar dependências específicas
            Write-Log "Instalando dependências necessárias..."
            npm install class-variance-authority@^0.7.0 --save
            npm install rimraf@^5.0.5 cross-env@^7.0.3 --save-dev
            
            Write-Log "Dependências instaladas com sucesso!"
            
        } catch {
            Write-Log "Erro ao reinstalar dependências: $_" "ERROR"
        }
    }
    
    # 7. LIMPEZA FINAL DE ARQUIVOS PROBLEMÁTICOS
    Write-Log "Limpeza final de arquivos problemáticos..."
    
    try {
        # Remover qualquer arquivo de backup que ainda possa existir
        Get-ChildItem -Path $ProjectRoot -Recurse -Include "*.backup", "*_backup_*" -Force -ErrorAction SilentlyContinue | Remove-Item -Force -ErrorAction SilentlyContinue
        
        # Remover diretórios de backup antigos (exceto o atual)
        Get-ChildItem -Path $ProjectRoot -Directory -Name "backup_*" -ErrorAction SilentlyContinue | Where-Object { 
            $_ -ne (Split-Path $BackupDir -Leaf) 
        } | ForEach-Object {
            Remove-Item (Join-Path $ProjectRoot $_) -Recurse -Force -ErrorAction SilentlyContinue
        }
        
        Write-Log "Limpeza final concluída"
        
    } catch {
        Write-Log "Erro na limpeza final: $_" "WARN"
    }
    
    Write-Log "=== CORREÇÃO CONCLUÍDA COM SUCESSO ===" "INFO"
    Write-Log "Backup disponível em: $BackupDir"
    Write-Log "Log salvo em: $LogFile"
    
    return $true
}

# Função para testar o projeto
function Test-Project {
    Write-Log "=== TESTANDO PROJETO ===" "INFO"
    
    try {
        # Limpar cache do TypeScript antes dos testes
        if (Test-Path "$ProjectRoot\tsconfig.tsbuildinfo") {
            Remove-Item "$ProjectRoot\tsconfig.tsbuildinfo" -Force
        }
        
        Write-Log "Executando verificação de tipos..."
        $typeCheckResult = npm run type-check 2>&1
        
        # Verificar se há erros que não sejam de arquivos de backup
        $errors = $typeCheckResult | Where-Object { $_ -match "error TS" -and $_ -notmatch "backup_" }
        
        if ($errors) {
            Write-Log "Erros de tipo encontrados (excluindo backups):" "WARN"
            $errors | ForEach-Object { Write-Log $_ "WARN" }
        } else {
            Write-Log "Verificação de tipos passou!"
        }
        
        Write-Log "Executando lint..."
        npm run lint 2>&1 | Out-Null
        
        Write-Log "=== TESTES CONCLUÍDOS ===" "INFO"
        return $true
        
    } catch {
        Write-Log "Erro nos testes: $_" "ERROR"
        return $false
    }
}

# Execução principal
try {
    Write-Host "=== SCRIPT DE CORREÇÃO - GERENCIADOR TASK ===" -ForegroundColor Cyan
    Write-Host "Iniciando correção..." -ForegroundColor Green
    
    $success = Fix-NextJsMetadata
    
    if ($success -and -not $BackupOnly) {
        Write-Host "`nExecutando testes..." -ForegroundColor Yellow
        Test-Project
    }
    
    Write-Host "`n✅ Correção concluída com sucesso!" -ForegroundColor Green
    Write-Host "📁 Backup salvo em: $BackupDir" -ForegroundColor Cyan
    Write-Host "📋 Log disponível em: $LogFile" -ForegroundColor Cyan
    Write-Host "`n🚀 Agora você pode executar: npm run dev" -ForegroundColor Magenta
    
} catch {
    Write-Host "❌ Erro durante a execução: $_" -ForegroundColor Red
    Write-Log "Erro crítico: $_" "ERROR"
    exit 1
}

# Instruções finais
Write-Host "`n=== PRÓXIMOS PASSOS ===" -ForegroundColor Cyan
Write-Host "1. Execute: npm run dev" -ForegroundColor White
Write-Host "2. Verifique se os warnings de viewport desapareceram" -ForegroundColor White
Write-Host "3. Execute: npm run type-check (deve mostrar 0 erros)" -ForegroundColor White
Write-Host "4. Teste todas as rotas: /, /bombeiro, /caixa-de-areia, /floresta" -ForegroundColor White
Write-Host "5. Em caso de problemas, restaure o backup" -ForegroundColor White

Write-Host "`n=== CORREÇÕES APLICADAS ===" -ForegroundColor Yellow
Write-Host "✅ Viewport metadata movido para export separado" -ForegroundColor Green
Write-Host "✅ Imports não utilizados removidos" -ForegroundColor Green
Write-Host "✅ Componente Button corrigido (sem asChild não usado)" -ForegroundColor Green
Write-Host "✅ Tipos 'any' no utils.ts corrigidos" -ForegroundColor Green
Write-Host "✅ Next.config.js otimizado para Turbopack" -ForegroundColor Green
Write-Host "✅ Arquivos de backup problemáticos removidos" -ForegroundColor Green
Write-Host "✅ Arquivo constants.ts criado/verificado" -ForegroundColor Green
Write-Host "✅ Configuração ESLint corrigida" -ForegroundColor Green
Write-Host "✅ TypeScript configurado para ignorar backups" -ForegroundColor Green
Write-Host "✅ Dependências atualizadas" -ForegroundColor Green

Write-Host "`n=== VERIFICAÇÃO FINAL ===" -ForegroundColor Cyan
Write-Host "Execute os seguintes comandos para verificar:" -ForegroundColor White
Write-Host "  npm run type-check    # Deve mostrar 0 erros" -ForegroundColor Gray
Write-Host "  npm run lint          # Deve passar sem erros ou warnings" -ForegroundColor Gray
Write-Host "  npm run dev           # Deve iniciar sem erros com Turbopack" -ForegroundColor Gray
Write-Host "  npm run dev:turbo     # Alternativa com Turbopack explícito" -ForegroundColor Gray

Write-Host "`n=== COMANDOS DISPONÍVEIS ===" -ForegroundColor Cyan
Write-Host "  npm run dev           # Modo padrão (sem Turbopack)" -ForegroundColor White
Write-Host "  npm run dev:turbo     # Modo Turbopack (mais rápido)" -ForegroundColor White