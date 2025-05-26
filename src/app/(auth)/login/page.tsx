
"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  // Redirect to Clerk's sign-in if preferred, or handle mock login
  // useEffect(() => {
  //   // Uncomment this if you want to default to Clerk's sign-in page
  //   // router.replace('/sign-in');
  // }, [router]);

  const handleMockLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (email === 'mario@mail.com' && password === 'Password123') {
      const mockUserData = {
        id: 'mock_user_mario_001',
        firstName: 'Mario',
        email: 'mario@mail.com',
        // Mimic some Clerk user structure if needed by other parts
        // emailAddresses: [{ emailAddress: 'mario@mail.com' }], 
      };
      localStorage.setItem('speaklyai_mock_user_session', JSON.stringify(mockUserData));
      router.push('/home');
    } else {
      setError('Credenciales incorrectas para el mock login.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
      <Card className="w-full max-w-sm shadow-xl">
        <CardHeader className="items-center text-center">
          <Logo size="lg" className="mb-4" />
          <CardTitle className="text-2xl">Iniciar Sesión (Mock)</CardTitle>
          <CardDescription>
            Usá mario@mail.com / Password123 para simulación.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleMockLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="mario@mail.com"
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
            <Link href="/sign-in" legacyBehavior>
              <a className="text-sm link link-primary text-center w-full">
                O iniciar sesión con Clerk
              </a>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
