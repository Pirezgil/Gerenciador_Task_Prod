import { HabitDetailClient } from './HabitDetailClient';

interface HabitDetailPageProps {
  params: Promise<{
    habitId: string;
  }>;
}

export default async function HabitDetailPage({ params }: HabitDetailPageProps) {
  const { habitId } = await params;
  return <HabitDetailClient habitId={habitId} />;
}