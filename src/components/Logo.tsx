
import type { SVGProps } from 'react';
import { cn } from '@/lib/utils';

interface LogoProps extends SVGProps<SVGSVGElement> { // Changed from LucideProps to SVGProps
  showText?: boolean;
}

// Custom SVG for a sick piggy bank
const SickPiggyBankIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    {/* Body */}
    <path d="M15.5 6.5C15.5 5.5 14.5 4.5 13.5 4.5C12.5 4.5 11.5 5.5 11.5 6.5C11.5 9 13.5 11.5 16 11.5H18C19.1046 11.5 20 10.6046 20 9.5V8.5C20 7.39543 19.1046 6.5 18 6.5H15.5Z" />
    <path d="M10.5 14.5H5.5C4.39543 14.5 3.5 13.6046 3.5 12.5V10.5C3.5 8.567 5.067 7 7 7H9" />
    {/* Snout */}
    <path d="M9 7L9.5 5.5M9 7L8.5 5.5" />
    {/* Legs */}
    <path d="M6.5 14.5V16.5" />
    <path d="M9.5 14.5V16.5" />
    {/* Ear */}
    <path d="M12.5 6.5C12.5 5.5 13 4.5 14 4C15 4.5 15.5 5.5 15.5 6.5" />
    {/* Slot - a bit wider for thermometer */}
    <path d="M13.5 4.5H14.5" />
    {/* Thermometer */}
    <rect x="12" y="1" width="2" height="5" rx="0.5" fill="currentColor" stroke="none" />
    <rect x="11.5" y="5" width="3" height="1.5" rx="0.5" fill="currentColor" stroke="none"/>
    {/* Sick eyes (X X) */}
    <path d="M7 9.5L8 10.5M8 9.5L7 10.5" />
    <path d="M17 8L18 9M18 8L17 9" />
    {/* Wavy "fever" lines */}
    <path d="M4 5C4.5 4.5 5.5 4.5 6 5" strokeDasharray="1 1" />
    <path d="M19 4C19.5 3.5 20.5 3.5 21 4" strokeDasharray="1 1" />
  </svg>
);

export function Logo({ showText = true, className, ...props }: LogoProps) {
  return (
    <div className="flex items-center gap-2">
      <SickPiggyBankIcon className={cn("h-7 w-7 text-primary", className)} {...props} />
      {showText && (
        <h1 className="text-xl sm:text-2xl font-bold text-primary">
          CashFlu
        </h1>
      )}
    </div>
  );
}
