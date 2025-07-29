import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirecionar para a página do Bombeiro para usar o novo sistema de sidebar
  redirect('/bombeiro');
}