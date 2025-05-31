
import { Sparkles } from 'lucide-react';
// Removed Link import

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'; // Added 'xl'
  showText?: boolean;
  className?: string; // This className will be applied to the root div of the logo
}

export function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizeClasses = {
    sm: { icon: 18, text: 'text-lg' },
    md: { icon: 24, text: 'text-xl' },
    lg: { icon: 32, text: 'text-2xl' },
    xl: { icon: 48, text: 'text-4xl' }, // New xl size
  };

  return (
    // No Link component here.
    // The className prop is applied here.
    // Hover styles (hover:opacity-80, transition-opacity) should be on the parent Link/anchor in Navbar.tsx.
    <div className={`flex items-center gap-2 text-primary ${className}`}>
      <Sparkles size={sizeClasses[size].icon} className="text-primary" />
      {showText && <span className={`font-bold ${sizeClasses[size].text}`}>SpeaklyAI</span>}
    </div>
  );
}
