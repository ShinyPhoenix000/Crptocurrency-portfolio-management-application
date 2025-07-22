import { AnimatedNumber } from './AnimatedNumber';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

export function ProfitLoss({ value, className = '', decimals = 2 }) {
  if (value > 0) {
    return (
      <span className={`text-success flex items-center gap-1 ${className}`}>
        <ArrowUpRight className="inline w-4 h-4" /> <AnimatedNumber value={value} decimals={decimals} />
      </span>
    );
  }
  if (value < 0) {
    return (
      <span className={`text-danger flex items-center gap-1 ${className}`}>
        <ArrowDownRight className="inline w-4 h-4" /> <AnimatedNumber value={value} decimals={decimals} />
      </span>
    );
  }
  return <span className={`text-muted-foreground ${className}`}><AnimatedNumber value={value} decimals={decimals} /></span>;
} 