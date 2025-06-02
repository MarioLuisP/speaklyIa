
import { AppShell } from '@/components/layout/AppShell';
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';

export default function AppPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center min-h-screen w-full">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-3 text-muted-foreground">Cargando página...</p>
      </div>
    }>
      <AppShell>{children}</AppShell>
    </Suspense>
  );
}
