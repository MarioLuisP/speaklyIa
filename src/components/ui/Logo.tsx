import { Sparkles } from 'lucide-react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Added 'xl'
  showText?: boolean;
  className?: string;
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 18, text: 'text-lg' },
    md: { icon: 24, text: 'text-xl' },
    lg: { icon: 32, text: 'text-2xl' },
    xl: { icon: 48, text: 'text-4xl' }, // New xl size
  };

  return (
    <Link href="/" className={`flex items-center gap-2 text-primary hover:opacity-80 transition-opacity ${className}`}>
      <Sparkles size={sizeClasses[size].icon} className="text-primary" />
      {showText && <span className={`font-bold ${sizeClasses[size].text}`}>SpeaklyAI</span>}
    </Link>
  );
}
