import { PiggyBank } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils'; // Added this import

interface LogoProps extends LucideProps {
  showText?: boolean;
}

export function Logo({ showText = true, className, ...props }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <PiggyBank className={cn("h-8 w-8 text-primary", className)} {...props} />
      {showText && (
        <h1 className="text-2xl font-bold text-primary">
          CashFlow Tracker
        </h1>
      )}
    </div>
  );
}
