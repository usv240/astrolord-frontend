import AIChat from './AIChat';

interface DailyCosmicChatProps {
  chartId?: string;
}

export function DailyCosmicChat({ chartId }: DailyCosmicChatProps) {
  return <AIChat chartId={chartId} mode="daily" />;
}
