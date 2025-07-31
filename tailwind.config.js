/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  
  theme: {
    extend: {
      // === CORES DO SISTEMA SENTINELA ===
      colors: {
        // Cores primárias
        primary: {
          50: "#F0F4FF",
          100: "#E8EFFF", 
          500: "#5B86E5",
          600: "#4A75D4",
          700: "#3A64C3"
        },
        
        // Sistema base
        background: "#F7F7F7",
        surface: "#FFFFFF",
        text: {
          primary: "#333740",
          secondary: "#64748B",
          muted: "#94A3B8"
        },
        border: "#EAEAEA",
        
        // === SISTEMA DE ENERGIA ===
        energia: {
          baixa: "#6DD58C",    // Verde Menta
          normal: "#5B86E5",   // Azul Sereno  
          alta: "#FFB36B"      // Laranja Suave
        },
        
        // === CORES SEMÂNTICAS ===
        semantic: {
          alert: "#FFD76B",    // Amarelo Âmbar
          success: "#6DD58C",  // Verde Menta
          warning: "#FFB36B",  // Laranja Suave
          info: "#5B86E5"      // Azul Sereno
        },
        
        // === O PÁTIO ===
        patio: {
          background: "#F5F0E6",  // Bege Papel
          text: "#5D4037"         // Marrom Escuro
        },
        
        // === MODOS DO SISTEMA ===
        modo: {
          bombeiro: "#5B86E5",   // Azul Sereno
          arquiteto: "#8B5CF6",  // Roxo
          patio: "#F59E0B",      // Âmbar
          floresta: "#6DD58C"    // Verde Menta
        },
        
        // === TEMAS ===
        theme: {
          text: "#333740",
          "text-secondary": "#64748B",
          "text-on-primary": "#FFFFFF"
        }
      },
      
      // === BORDAS ARREDONDADAS SENTINELA ===
      borderRadius: {
        "sentinela-sm": "8px",
        "sentinela": "16px", 
        "sentinela-lg": "24px",
        "xl": "12px",
        "2xl": "16px",
        "3xl": "24px"
      },
      
      // === TIPOGRAFIA SENTINELA ===
      fontFamily: {
        sans: ["Inter", "Poppins", "system-ui", "sans-serif"],
        serif: ["Lora", "Merriweather", "Georgia", "serif"],
        sentinela: ["Inter", "Poppins", "system-ui", "sans-serif"]
      },
      
      // === SOMBRAS ACOLHEDORAS ===
      boxShadow: {
        "soft": "0 2px 15px rgba(0, 0, 0, 0.08)",
        "medium": "0 4px 25px rgba(0, 0, 0, 0.12)", 
        "large": "0 8px 40px rgba(0, 0, 0, 0.16)",
        
        // Sombras por energia
        "energia-baixa": "0 4px 20px rgba(109, 213, 140, 0.3)",
        "energia-normal": "0 4px 20px rgba(91, 134, 229, 0.3)",
        "energia-alta": "0 4px 20px rgba(255, 179, 107, 0.3)",
        
        // Sombras por modo
        "modo-bombeiro": "0 4px 20px rgba(91, 134, 229, 0.3)",
        "modo-arquiteto": "0 4px 20px rgba(139, 92, 246, 0.3)",
        "modo-patio": "0 4px 20px rgba(245, 158, 11, 0.3)"
      },
      
      // === ANIMAÇÕES SENTINELA ===
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "slide-up": "slideUp 0.3s ease-out", 
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
        "hover-float": "hoverFloat 0.3s ease-out",
        "celebration": "celebration 1s ease-out"
      },
      
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" }
        },
        slideUp: {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" }
        },
        hoverFloat: {
          "0%": { transform: "translateY(0)" },
          "100%": { transform: "translateY(-2px)" }
        },
        celebration: {
          "0%": { transform: "scale(1)", opacity: "0" },
          "50%": { transform: "scale(1.1)", opacity: "1" },
          "100%": { transform: "scale(1)", opacity: "1" }
        }
      },
      
      // === ESPAÇAMENTOS SENTINELA ===
      spacing: {
        "sentinela-sm": "0.75rem",
        "sentinela-md": "1rem", 
        "sentinela-lg": "1.5rem",
        "sentinela-xl": "2rem"
      }
    },
    
    // === BREAKPOINTS RESPONSIVOS CUSTOMIZADOS ===
    screens: {
      xs: "375px",
      sm: "640px", 
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px"
    }
  },
  
  // === SAFELIST EXPANDIDA ===
  safelist: [
    // Classes de Energia
    "bg-energia-baixa", "bg-energia-normal", "bg-energia-alta",
    "text-energia-baixa", "text-energia-normal", "text-energia-alta", 
    "border-energia-baixa", "border-energia-normal", "border-energia-alta",
    
    // Classes Semânticas
    "bg-semantic-warning", "bg-semantic-alert", "bg-semantic-success", "bg-semantic-info",
    "text-semantic-warning", "text-semantic-alert", "text-semantic-success", "text-semantic-info",
    "border-semantic-warning", "border-semantic-alert", "border-semantic-success", "border-semantic-info",
    
    // Transparências
    "bg-energia-baixa/10", "bg-energia-baixa/20", "bg-energia-baixa/30",
    "bg-energia-normal/10", "bg-energia-normal/20", "bg-energia-normal/30", 
    "bg-energia-alta/10", "bg-energia-alta/20", "bg-energia-alta/30",
    
    "bg-semantic-warning/10", "bg-semantic-warning/20", "bg-semantic-warning/30",
    "bg-semantic-alert/10", "bg-semantic-alert/20", "bg-semantic-alert/30",
    "bg-semantic-success/10", "bg-semantic-success/20", "bg-semantic-success/30",
    "bg-semantic-info/10", "bg-semantic-info/20", "bg-semantic-info/30",
    
    // Bordas com transparência
    "border-energia-baixa/20", "border-energia-normal/20", "border-energia-alta/20",
    "border-semantic-warning/30", "border-semantic-alert/30", "border-semantic-success/30",
    
    // Sistema Sentinela Base
    "bg-background", "bg-surface", "text-text-primary", "text-text-secondary", "text-text-muted",
    "border-border", "shadow-soft", "shadow-medium", "shadow-large",
    
    // Sombras especiais
    "shadow-energia-baixa", "shadow-energia-normal", "shadow-energia-alta",
    "shadow-modo-bombeiro", "shadow-modo-arquiteto", "shadow-modo-patio",
    
    // Animações
    "animate-fade-in", "animate-slide-up", "animate-pulse-soft", "animate-hover-float", "animate-celebration",
    
    // Classes do Pátio
    "bg-patio-background", "text-patio-text",
    
    // Classes de modo
    "bg-modo-bombeiro", "bg-modo-arquiteto", "bg-modo-patio", "bg-modo-floresta",
    "text-modo-bombeiro", "text-modo-arquiteto", "text-modo-patio", "text-modo-floresta",
    
    // Classes responsivas
    "responsive-card", "responsive-button", "responsive-container", "responsive-grid",
    "responsive-title", "responsive-subtitle", "responsive-text", "responsive-spacing",
    
    // Classes de tema
    "theme-text", "theme-text-secondary", "theme-text-on-primary", "theme-transition",
    "theme-dark"
  ],
  
  plugins: []
};