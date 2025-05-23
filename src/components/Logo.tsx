
import { PiggyBank, type LucideProps } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LogoProps extends LucideProps {
  showText?: boolean;
}

export function Logo({ showText = true, className, ...props }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <PiggyBank className={cn("h-7 w-7 text-primary", className)} {...props} />
      {showText && (
        <h1 className="text-xl sm:text-2xl font-bold text-primary">
          CashFlow Tracker
        </h1>
      )}
    </div>
  );
}
