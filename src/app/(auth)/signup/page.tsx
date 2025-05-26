
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/MockAuthProvider'; // Import signIn from mock context
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';

export default function SignupPage() {
  const router = useRouter();
  const { signIn, isSignedIn } = useUser(); // Get signIn from mock context

  useEffect(() => {
    // If already signed in, redirect to home
    if (isSignedIn) {
      router.push('/home');
    }
  }, [isSignedIn, router]);

  const handleMockSignup = () => {
    // Simulate signup and immediate sign-in
    signIn(() => {
      router.push('/home');
    });
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="items-center text-center">
          <Logo size="xl" className="mb-4" />
          <CardTitle className="text-2xl">Registrarse (Mock)</CardTitle>
          <CardDescription>
            Esto simulará un registro y te llevará a la página de inicio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleMockSignup} className="w-full">
            Registrarse y Entrar (Mock)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
