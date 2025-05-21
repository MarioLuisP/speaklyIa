"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, ListChecks, User, BarChart3, Sparkles } from 'lucide-react';

const navItems = [
  { href: '/home', label: 'Inicio', icon: Home },
  { href: '/practice', label: 'Práctica', icon: ListChecks },
  { href: '/level-test', label: 'Nivel', icon: Sparkles}, // Or use this for level-test quick access
  { href: '/progress', label: 'Progreso', icon: BarChart3 },
  { href: '/profile', label: 'Perfil', icon: User },
];

export function BottomNavigation() {
  const pathname = usePathname();

  return (
    <div className="btm-nav btm-nav-sm md:btm-nav-md z-40 bg-base-200 border-t border-base-300">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href === '/home' && pathname.startsWith('/app')); // Adjust active logic if needed
        return (
          <Link key={item.href} href={item.href} className={`transition-colors ${isActive ? 'active text-primary' : 'text-base-content/70 hover:text-primary'}`}>
            <item.icon className="h-5 w-5" />
            <span className="btm-nav-label text-xs">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
