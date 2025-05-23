
import type {Metadata} from 'next';
import { Geist, Geist_Mono } from 'next/font/google'; // Corrected import to Geist
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster
import { cn } from '@/lib/utils';

const geistSans = Geist({ // Changed to new font variable name
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Changed to new font variable name
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'CashFlu',
  description: 'Track your outgoing cash, even when you are not feeling your best.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("font-sans antialiased", geistSans.variable, geistMono.variable)}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
