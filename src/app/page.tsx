import { redirect } from 'next/navigation';

export default function HomePage() {
  // Redirecionar para a página de autenticação
  redirect('/auth');
}