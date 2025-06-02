
"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { useUser } from '@/providers/MockAuthContext'; // Updated import path
import Link from 'next/link';
import { usePractice, PracticeSettings } from '@/providers/PracticeContext';
import { Loader2 } from 'lucide-react';

const defaultPracticeSettings: PracticeSettings = {
  language: "english",
  level: "beginner",
  topic: "travel",
  numQuestions: 10,
  questionType: "multiple-choice",
};

export default function LoginPage() {
  const router = useRouter();
  const { signIn, isSignedIn, isLoaded, user } = useUser(); 
  const { loadPracticeQuestions, getPracticeSettingsFromStorage } = usePractice();

  const [email, setEmail] = useState('mario@speakly.ai');
  const [password, setPassword] = useState('Password123'); 
  const [error, setError] = useState('');
  const [isSigningIn, setIsSigningIn] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleMockLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSigningIn(true);

    if (email === 'mario@speakly.ai' && password === 'Password123') {
      signIn(async () => { 
        let settingsToLoad = getPracticeSettingsFromStorage();
        if (!settingsToLoad) {
            settingsToLoad = {
                ...defaultPracticeSettings,
                level: "beginner", 
            };
        }
        
        try {
          console.log("LoginPage: Attempting to load practice questions with settings:", settingsToLoad);
          await loadPracticeQuestions(settingsToLoad);
          console.log("LoginPage: Practice questions loading initiated.");
          router.push('/home');
        } catch (loadError) {
          console.error("LoginPage: Error loading practice questions after login:", loadError);
          setError("Login exitoso, pero falló la carga de preguntas de práctica.");
          router.push('/home'); 
        } finally {
          setIsSigningIn(false);
        }
      });
    } else {
      setError('Credenciales incorrectas para el mock login.');
      setIsSigningIn(false);
    }
  };

  if (!isLoaded) {
    return <div className="flex justify-center items-center min-h-screen"><Loader2 className="h-8 w-8 animate-spin" /></div>; 
  }
  
  if (isSignedIn) {
    return <div className="flex justify-center items-center min-h-screen">Redirigiendo...</div>;
  }

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
                disabled={isSigningIn}
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
                disabled={isSigningIn}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSigningIn}>
              {isSigningIn ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
              {isSigningIn ? 'Entrando...' : 'Entrar (Mock)'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
