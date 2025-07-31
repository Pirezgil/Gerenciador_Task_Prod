import React from 'react';

export default function ColorDebug() {
  return (
    <div className="p-8 space-y-6 bg-background">
      <h1 className="text-3xl font-bold text-text-primary">🎨 Debug Cores Sistema Sentinela</h1>
      
      {/* Cores de Energia */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Cores de Energia</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-energia-baixa text-white text-center">
            <div className="text-2xl">🔋</div>
            <div className="font-bold">Energia Baixa</div>
            <div className="text-sm opacity-80">#6DD58C</div>
          </div>
          <div className="p-4 rounded-2xl bg-energia-normal text-white text-center">
            <div className="text-2xl">🧠</div>
            <div className="font-bold">Energia Normal</div>
            <div className="text-sm opacity-80">#5B86E5</div>
          </div>
          <div className="p-4 rounded-2xl bg-energia-alta text-white text-center">
            <div className="text-2xl">⚡</div>
            <div className="font-bold">Energia Alta</div>
            <div className="text-sm opacity-80">#FFB36B</div>
          </div>
        </div>
      </section>
      
      {/* Cores Semânticas */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Cores Semânticas</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-semantic-warning text-white text-center">
            <div className="text-2xl">⚠️</div>
            <div className="font-bold">Warning</div>
            <div className="text-sm opacity-80">#FFB36B</div>
          </div>
          <div className="p-4 rounded-2xl bg-semantic-alert text-white text-center">
            <div className="text-2xl">🚨</div>
            <div className="font-bold">Alert</div>
            <div className="text-sm opacity-80">#FFD76B</div>
          </div>
          <div className="p-4 rounded-2xl bg-semantic-success text-white text-center">
            <div className="text-2xl">✅</div>
            <div className="font-bold">Success</div>
            <div className="text-sm opacity-80">#6DD58C</div>
          </div>
        </div>
      </section>
      
      {/* Transparências */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Transparências</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 rounded-2xl bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30">
            Warning com transparência
          </div>
          <div className="p-4 rounded-2xl bg-semantic-success/20 text-semantic-success border border-semantic-success/30">
            Success com transparência
          </div>
        </div>
      </section>
      
      {/* Teste de Texto */}
      <section>
        <h2 className="text-xl font-semibold text-text-primary mb-4">Cores de Texto</h2>
        <div className="space-y-2">
          <p className="text-energia-baixa font-bold">Texto Energia Baixa</p>
          <p className="text-energia-normal font-bold">Texto Energia Normal</p>
          <p className="text-energia-alta font-bold">Texto Energia Alta</p>
          <p className="text-text-primary">Texto Primary</p>
          <p className="text-text-secondary">Texto Secondary</p>
        </div>
      </section>
      
      {/* Status das Classes */}
      <section className="bg-surface p-6 rounded-2xl border border-border shadow-soft">
        <h2 className="text-xl font-semibold text-text-primary mb-4">Status da Migração</h2>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-semantic-success rounded-full"></div>
            <span>Se você vê todas as cores acima, a migração foi 100% bem-sucedida!</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-semantic-warning rounded-full"></div>
            <span>Se algumas cores estão cinza, há problema no Tailwind CSS</span>
          </div>
        </div>
      </section>
    </div>
  );
}
