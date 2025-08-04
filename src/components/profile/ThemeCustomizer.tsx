'use client';

// ============================================================================
// THEME CUSTOMIZER - Personalização completa do tema
// ============================================================================

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Palette, Sun, Moon, Monitor, Eye, Download, Upload, RotateCcw, Save, Circle, Maximize, Type } from 'lucide-react';
import { useThemeStore } from '../../stores/themeStore';

import { ThemePreset } from '@/types';

export function ThemeCustomizer() {
  const {
    currentTheme,
    presets,
    colorPalettes,
    updateTheme,
    applyPreset,
    resetToDefault,
    exportTheme,
    importTheme,
    saveAsPreset,
    updatePrimaryColor,
    updateSecondaryColor,
    updateBorderRadius,
    updateIconSize,
    updateSpacing,
    updateFontFamily,
    updateFontSize,
    toggleAnimations,
    toggleGlassmorphism,
  } = useThemeStore();

  const [activeSection, setActiveSection] = useState('presets');
  const [showPreview, setShowPreview] = useState(false);
  
  // Aplicar tema automaticamente quando houver mudanças
  useEffect(() => {
    const timer = setTimeout(() => {
      // Force theme application on any change
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('themeChanged', { detail: currentTheme });
        window.dispatchEvent(event);
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, [currentTheme]);

  const sections = [
    { id: 'presets', label: 'Predefinidos', icon: Palette },
    { id: 'colors', label: 'Cores', icon: Circle },
    { id: 'layout', label: 'Layout', icon: Maximize },
    { id: 'typography', label: 'Tipografia', icon: Type },
    { id: 'effects', label: 'Efeitos', icon: Monitor },
  ];

  const handleImportTheme = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          const success = importTheme(content);
          if (success) {
            alert('Tema importado com sucesso!');
          } else {
            alert('Erro ao importar tema. Verifique o arquivo.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const handleExportTheme = () => {
    const themeJson = exportTheme();
    const blob = new Blob([themeJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `theme-${currentTheme.name}-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSavePreset = () => {
    const name = prompt('Nome do preset:');
    const description = prompt('Descrição do preset:');
    if (name && description) {
      saveAsPreset(name, description);
      alert('Preset salvo com sucesso!');
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 p-8">
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-2xl font-bold theme-text">Personalizar Aparência</h2>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>{showPreview ? 'Ocultar' : 'Visualizar'}</span>
          </button>
          <button
            onClick={handleExportTheme}
            className="flex items-center space-x-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exportar</span>
          </button>
          <button
            onClick={handleImportTheme}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Importar</span>
          </button>
          <button
            onClick={resetToDefault}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 theme-text-secondary rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Resetar</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Navegação lateral */}
        <div className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeSection === section.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 theme-button-text shadow-lg'
                    : 'theme-text-secondary hover:bg-blue-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{section.label}</span>
              </button>
            );
          })}
        </div>

        {/* Conteúdo principal */}
        <div className="lg:col-span-3">
          {/* Seção Predefinidos */}
          {activeSection === 'presets' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold theme-text">Temas Predefinidos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {presets.map((preset: ThemePreset) => (
                  <motion.button
                    key={preset.id}
                    onClick={() => applyPreset(preset.id)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      currentTheme.name === preset.config.name
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div
                      className="w-full h-12 rounded-lg mb-3"
                      style={{ background: preset.preview }}
                    />
                    <h4 className="font-semibold theme-text">{preset.name}</h4>
                    <p className="text-sm theme-text-secondary">{preset.description}</p>
                  </motion.button>
                ))}
              </div>
              
              <button
                onClick={handleSavePreset}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 theme-text-on-primary rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Salvar Tema Atual</span>
              </button>
            </motion.div>
          )}

          {/* Seção Cores */}
          {activeSection === 'colors' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold theme-text">Personalizar Cores</h3>
              
              {/* Paletas de cores */}
              <div>
                <h4 className="font-medium theme-text-secondary mb-3">Paletas Sugeridas</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {colorPalettes.map((palette, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        updatePrimaryColor(palette.colors.primary);
                        updateSecondaryColor(palette.colors.secondary);
                      }}
                      className="p-4 border border-gray-200 rounded-xl hover:border-gray-300 transition-colors text-left"
                    >
                      <div className="flex space-x-2 mb-2">
                        {Object.values(palette.colors).slice(0, 4).map((color, colorIndex) => (
                          <div
                            key={colorIndex}
                            className="w-6 h-6 rounded-full"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <h5 className="font-medium theme-text">{palette.name}</h5>
                    </button>
                  ))}
                </div>
              </div>

              {/* Cores individuais */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Cor Primária
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={currentTheme.primaryColor}
                      onChange={(e) => updatePrimaryColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border border-gray-200"
                    />
                    <input
                      type="text"
                      value={currentTheme.primaryColor}
                      onChange={(e) => updatePrimaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-2">
                    Cor Secundária
                  </label>
                  <div className="flex items-center space-x-3">
                    <input
                      type="color"
                      value={currentTheme.secondaryColor}
                      onChange={(e) => updateSecondaryColor(e.target.value)}
                      className="w-12 h-12 rounded-lg border border-gray-200"
                    />
                    <input
                      type="text"
                      value={currentTheme.secondaryColor}
                      onChange={(e) => updateSecondaryColor(e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Seção Layout */}
          {activeSection === 'layout' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold theme-text">Layout e Estrutura</h3>
              
              <div className="space-y-6">
                {/* Bordas arredondadas */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-3">
                    Bordas Arredondadas
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {(['none', 'small', 'medium', 'large'] as const).map((radius) => (
                      <button
                        key={radius}
                        onClick={() => updateBorderRadius(radius)}
                        className={`p-3 border-2 transition-all text-center ${
                          currentTheme.borderRadius === radius
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          borderRadius: radius === 'none' ? '0' : radius === 'small' ? '4px' : radius === 'medium' ? '8px' : '16px'
                        }}
                      >
                        <div className="w-6 h-6 bg-gray-300 mx-auto mb-1" style={{
                          borderRadius: radius === 'none' ? '0' : radius === 'small' ? '2px' : radius === 'medium' ? '4px' : '8px'
                        }} />
                        <span className="text-xs capitalize">{radius}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tamanho dos ícones */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-3">
                    Tamanho dos Ícones
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateIconSize(size)}
                        className={`p-3 border-2 transition-all text-center ${
                          currentTheme.iconSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Circle className={`mx-auto mb-1 ${
                          size === 'small' ? 'w-4 h-4' : size === 'medium' ? 'w-5 h-5' : 'w-6 h-6'
                        }`} />
                        <span className="text-xs capitalize">{size}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Espaçamento */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-3">
                    Espaçamento
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['compact', 'normal', 'comfortable'] as const).map((spacing) => (
                      <button
                        key={spacing}
                        onClick={() => updateSpacing(spacing)}
                        className={`p-3 border-2 transition-all text-center ${
                          currentTheme.spacing === spacing
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="space-y-1 mb-2">
                          <div className={`bg-gray-300 mx-auto ${
                            spacing === 'compact' ? 'w-8 h-1' : spacing === 'normal' ? 'w-10 h-1.5' : 'w-12 h-2'
                          }`} />
                          <div className={`bg-gray-300 mx-auto ${
                            spacing === 'compact' ? 'w-6 h-1' : spacing === 'normal' ? 'w-8 h-1.5' : 'w-10 h-2'
                          }`} />
                        </div>
                        <span className="text-xs capitalize">{spacing}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Seção Tipografia */}
          {activeSection === 'typography' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold theme-text">Tipografia</h3>
              
              <div className="space-y-6">
                {/* Família da fonte */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-3">
                    Família da Fonte
                  </label>
                  <div className="space-y-3">
                    {(['system', 'inter', 'lora'] as const).map((font) => (
                      <button
                        key={font}
                        onClick={() => updateFontFamily(font)}
                        className={`w-full p-4 border-2 transition-all text-left ${
                          currentTheme.fontFamily === font
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        style={{
                          fontFamily: font === 'system' ? 'system-ui' : font === 'inter' ? 'Inter' : 'Lora'
                        }}
                      >
                        <div className="font-semibold mb-1 capitalize">{font}</div>
                        <div className="text-sm theme-text-secondary">
                          O que está passando pela sua mente hoje? Escreva livremente.
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tamanho da fonte */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-3">
                    Tamanho da Fonte
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['small', 'medium', 'large'] as const).map((size) => (
                      <button
                        key={size}
                        onClick={() => updateFontSize(size)}
                        className={`p-3 border-2 transition-all text-center ${
                          currentTheme.fontSize === size
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className={`font-medium mb-1 ${
                          size === 'small' ? 'text-sm' : size === 'medium' ? 'text-base' : 'text-lg'
                        }`}>
                          Aa
                        </div>
                        <span className="text-xs capitalize">{size}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Seção Efeitos */}
          {activeSection === 'effects' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <h3 className="text-lg font-semibold theme-text">Efeitos Visuais</h3>
              
              <div className="space-y-4">
                {/* Animações */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h4 className="font-medium theme-text">Animações</h4>
                    <p className="text-sm theme-text-secondary">Transições suaves e animações</p>
                  </div>
                  <button
                    onClick={toggleAnimations}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      currentTheme.animations ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentTheme.animations ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Glassmorphism */}
                <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
                  <div>
                    <h4 className="font-medium theme-text">Efeito Vidro</h4>
                    <p className="text-sm theme-text-secondary">Blur e transparência nos cards</p>
                  </div>
                  <button
                    onClick={toggleGlassmorphism}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      currentTheme.glassmorphism ? 'bg-blue-600' : 'bg-gray-200'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        currentTheme.glassmorphism ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Modo escuro/claro */}
                <div>
                  <label className="block text-sm font-medium theme-text-secondary mb-3">
                    Modo de Cor
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {(['light', 'dark'] as const).map((mode) => (
                      <button
                        key={mode}
                        onClick={() => updateTheme({ mode })}
                        className={`p-3 border-2 transition-all text-center ${
                          currentTheme.mode === mode
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {mode === 'light' && <Sun className="w-5 h-5 mx-auto mb-1" />}
                        {mode === 'dark' && <Moon className="w-5 h-5 mx-auto mb-1" />}
                        
                        <span className="text-xs capitalize">
                          {mode === 'light' ? 'Claro' : 'Escuro'}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* Preview */}
      {showPreview && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-8 p-6 border border-gray-200 rounded-xl bg-gray-50"
        >
          <h3 className="text-lg font-semibold theme-text mb-4">Visualização</h3>
          <div className="space-y-4">
            <div 
              className="p-4 rounded-lg shadow-sm"
              style={{
                backgroundColor: currentTheme.surfaceColor,
                borderRadius: currentTheme.borderRadius === 'none' ? '0' : 
                             currentTheme.borderRadius === 'small' ? '4px' :
                             currentTheme.borderRadius === 'medium' ? '8px' : '16px',
                color: currentTheme.textColor,
                fontFamily: currentTheme.fontFamily === 'system' ? 'system-ui' :
                           currentTheme.fontFamily === 'inter' ? 'Inter' : 'Lora',
                fontSize: currentTheme.fontSize === 'small' ? '14px' :
                         currentTheme.fontSize === 'medium' ? '16px' : '18px',
              }}
            >
              <div className="flex items-center space-x-3 mb-3">
                <div 
                  className="w-8 h-8 rounded flex items-center justify-center"
                  style={{ backgroundColor: currentTheme.primaryColor }}
                >
                  <span className="theme-text-on-primary text-sm">🧠</span>
                </div>
                <h4 className="font-semibold">Exemplo de Tarefa</h4>
              </div>
              <p className="text-sm opacity-75">
                Esta é uma visualização de como seu tema personalizado aparecerá na interface.
              </p>
              <button 
                className="mt-3 px-4 py-2 rounded theme-text-on-primary text-sm"
                style={{ backgroundColor: currentTheme.secondaryColor }}
              >
                Botão de Exemplo
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
