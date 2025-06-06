import { ArrowUpRight } from 'lucide-react';
import { DashcoinCard } from '@/components/ui/dashcoin-card';

interface Props {
  value: string;
  label: string;
  highlight?: boolean;
}

export function SimpleGrowthCard({ value, label, highlight=false }: Props) {
  return (
    <DashcoinCard className={`flex items-center gap-2 p-4 ${highlight ? 'border-green-500' : ''}`}> 
      <ArrowUpRight className={`h-5 w-5 ${highlight ? 'text-green-600' : 'text-gray-500'}`} />
      <div className="text-dashBlack">
        <p className="font-bold text-lg text-gray-50">{value}</p>
        <p className="text-sm opacity-70 text-gray-50">{label}</p>
      </div>
    </DashcoinCard>
  );
}
