
"use client";

import React, { useState } from 'react'; // Added React for potential future use
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { useUser } from '@/providers/MockAuthProvider'; // Import signIn from mock context

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isSignedIn } = useUser(); // Get signIn from mock context

  // If already signed in (e.g. by hardcoded user in provider), redirect
  React.useEffect(() => {
    if (isSignedIn) {
      router.push('/home');
    }
  }, [isSignedIn, router]);

  const [email, setEmail] = useState('mario@speakly.ai');
  const [password, setPassword] = useState('Password123'); // Pre-fill for convenience
  const [error, setError] = useState('');


  const handleMockLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email === 'mario@speakly.ai' && password === 'Password123') {
      signIn(() => { // Call signIn from context
        router.push('/home');
      });
    } else {
      setError('Credenciales incorrectas para el mock login.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="items-center text-center">
          <Logo size="xl" className="mb-4" />
          <CardTitle className="text-2xl">Iniciar Sesión (Mock)</CardTitle>
          <CardDescription>
            Usá mario@speakly.ai / Password123 para simulación.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleMockLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario@speakly.ai"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password123"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full">
              Entrar (Mock)
            </Button>
            {/* Link to actual Clerk sign-in can be added back later if needed */}
            {/* <Link href="/sign-in" legacyBehavior>
              <a className="text-sm link link-primary text-center w-full">
                O iniciar sesión con Clerk
              </a>
            </Link> */}
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
