import React from 'react';
import { Navbar } from './Navbar';
import { BottomNavigation } from './BottomNavigation';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col min-h-screen bg-base-100">
      <Navbar hideAuthButtons={true} />
      <main className="flex-grow pb-16 md:pb-20"> {/* Padding bottom to avoid overlap with btm-nav */}
        {children}
      </main>
      <BottomNavigation />
    </div>
  );
}
