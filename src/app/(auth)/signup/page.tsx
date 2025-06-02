
"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/providers/MockAuthContext'; // Updated import path
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Logo } from '@/components/ui/Logo';
import { Loader2 } from 'lucide-react'; 
import { usePractice, PracticeSettings } from '@/providers/PracticeContext'; 

const defaultPracticeSettings: PracticeSettings = {
  language: "english",
  level: "beginner",
  topic: "travel",
  numQuestions: 10,
  questionType: "multiple-choice",
};

export default function SignupPage() {
  const router = useRouter();
  const { signIn, isSignedIn, isLoaded } = useUser(); 
  const { loadPracticeQuestions, getPracticeSettingsFromStorage } = usePractice();
  const [isSigningUp, setIsSigningUp] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.push('/home');
    }
  }, [isLoaded, isSignedIn, router]);

  const handleMockSignup = async () => {
    setIsSigningUp(true);
    setError('');
    signIn(async () => { 
      let settingsToLoad = getPracticeSettingsFromStorage();
      if (!settingsToLoad) {
        settingsToLoad = {
            ...defaultPracticeSettings,
            level: "beginner", 
        };
      }
      try {
        await loadPracticeQuestions(settingsToLoad);
        router.push('/home');
      } catch (loadError) {
        console.error("SignupPage: Error loading practice questions after signup:", loadError);
        setError("Registro exitoso, pero falló la carga de preguntas de práctica.");
        router.push('/home'); 
      } finally {
        setIsSigningUp(false);
      }
    });
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
          <CardTitle className="text-2xl">Registrarse (Mock)</CardTitle>
          <CardDescription>
            Esto simulará un registro y te llevará a la página de inicio.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && <p className="text-sm text-destructive mb-2 text-center">{error}</p>}
          <Button onClick={handleMockSignup} className="w-full" disabled={isSigningUp}>
            {isSigningUp ? <Loader2 className="animate-spin mr-2 h-4 w-4"/> : null}
            {isSigningUp ? 'Registrando...' : 'Registrarse y Entrar (Mock)'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
