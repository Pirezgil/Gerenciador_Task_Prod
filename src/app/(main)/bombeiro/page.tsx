// ============================================================================
// PÁGINA BOMBEIRO - Ponto de Entrada Principal
// ============================================================================
import React from 'react';
import { BombeiroPageClient } from '@/components/bombeiro/BombeiroPageClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Modo Bombeiro | Foco e Ação',
  description: 'Página dedicada à execução de tarefas com alta concentração e gerenciamento de energia.',
};

/**
 * Componente de Página do Modo Bombeiro.
 * 
 * Este componente atua como o ponto de entrada para a rota "/bombeiro".
 * Ele é um Server Component que renderiza o `BombeiroPageClient`, 
 * que por sua vez gerencia toda a interatividade e o estado da página.
 * 
 * @returns JSX.Element
 */
const BombeiroPage = () => {
  return <BombeiroPageClient />;
};

export default BombeiroPage;
