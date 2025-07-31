import React from 'react';

export default function SentinelaTest() {
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold text-text-primary">Teste Sistema Sentinela</h1>
      
      {/* Energia Colors */}
      <div className="flex space-x-4">
        <div className="w-20 h-20 bg-energia-baixa rounded-2xl flex items-center justify-center text-white font-bold">
          🔋
        </div>
        <div className="w-20 h-20 bg-energia-normal rounded-2xl flex items-center justify-center text-white font-bold">
          🧠
        </div>
        <div className="w-20 h-20 bg-energia-alta rounded-2xl flex items-center justify-center text-white font-bold">
          ⚡
        </div>
      </div>
      
      {/* Semantic Colors */}
      <div className="flex space-x-4">
        <div className="px-4 py-2 bg-semantic-warning/20 text-semantic-warning border border-semantic-warning/30 rounded-xl">
          Warning
        </div>
        <div className="px-4 py-2 bg-semantic-alert/20 text-semantic-alert border border-semantic-alert/30 rounded-xl">
          Alert
        </div>
        <div className="px-4 py-2 bg-semantic-success/20 text-semantic-success border border-semantic-success/30 rounded-xl">
          Success
        </div>
      </div>
      
      {/* Text Colors */}
      <div className="space-y-2">
        <p className="text-energia-baixa">Texto Energia Baixa</p>
        <p className="text-energia-normal">Texto Energia Normal</p>
        <p className="text-energia-alta">Texto Energia Alta</p>
      </div>
    </div>
  );
}
