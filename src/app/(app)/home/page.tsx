
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDailyVocabularySuggestions, DailyVocabularySuggestionsOutput } from '@/ai/flows/vocabulary-suggestions';
import type { UserProfile as AppUserProfile } from '@/types';
import { BookOpen, HelpCircle, Cog, Loader2 } from 'lucide-react';
import { UserProgressHeader } from '@/components/layout/UserProgressHeader';
import { differenceInDays, differenceInHours, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUser } from '@/providers/MockAuthContext';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { usePractice } from '@/providers/PracticeContext'; // Import usePractice

// Removed local PracticeQuestion interfaces as we'll use types from context/global types

// const LOCAL_STORAGE_PRACTICE_SETTINGS_KEY = 'speaklyai_practice_settings'; // No longer needed here for fetching

export default function HomePage() {
  const { user, isLoaded, isSignedIn } = useUser();
  const {
    practiceQuestions: contextPracticeQuestions,
    isLoadingPractice: isLoadingContextPractice,
    practiceError: contextPracticeError,
    getPracticeSettingsFromStorage,
    loadPracticeQuestions, // Keep if we want a refresh button, but initial load is from login
  } = usePractice();

  const [userProfileData, setUserProfileData] = useState<Omit<AppUserProfile, 'id' | 'email' | 'avatarUrl' | 'name' | 'dataAihint' | 'currentVocabularyLevel' | 'learningGoals' | 'dailyLessonTarget' | 'dailyLessonProgress' > | null>(null);
  const [timeSinceLastLogin, setTimeSinceLastLogin] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);
  const [currentPracticeSettings, setCurrentPracticeSettings] = useState<ReturnType<typeof getPracticeSettingsFromStorage>>(null);


  useEffect(() => {
    if (user) {
      const mockBackendData: Omit<AppUserProfile, 'id' | 'email' | 'avatarUrl' | 'name' | 'dataAihint' | 'currentVocabularyLevel' | 'learningGoals' | 'dailyLessonTarget' | 'dailyLessonProgress' > = {
        score: user.score || 0,
        userLevel: user.userLevel || 'Novato',
        tematic: user.tematic || 'Viajes',
        lastLogin: user.lastLogin || new Date(Date.now() - (1000 * 60 * 60 * 27)).toISOString(),
        consecutiveDays: user.consecutiveDays || 0,
        wordsLearned: user.wordsLearned || 0,
      };
      setUserProfileData(mockBackendData);
      // Load current practice settings from storage to display relevant info
      const settings = getPracticeSettingsFromStorage();
      setCurrentPracticeSettings(settings);

    } else {
      setUserProfileData(null);
      setCurrentPracticeSettings(null);
    }
  }, [user, getPracticeSettingsFromStorage]);

  useEffect(() => {
    if (userProfileData?.lastLogin) {
      const lastLoginDate = new Date(userProfileData.lastLogin);
      const now = new Date();
      const days = differenceInDays(now, lastLoginDate);

      if (days > 0) {
        setTimeSinceLastLogin(`Han pasado ${formatDistanceToNowStrict(lastLoginDate, { locale: es, addSuffix: true })}.`);
      } else {
        const hours = differenceInHours(now, lastLoginDate);
        if (hours > 0) {
          setTimeSinceLastLogin(`Han pasado ${formatDistanceToNowStrict(lastLoginDate, { locale: es, addSuffix: true })}.`);
        } else {
          setTimeSinceLastLogin("¡Volviste hace poco!");
        }
      }
    } else {
        setTimeSinceLastLogin('');
    }
  }, [userProfileData?.lastLogin]);

  useEffect(() => {
    async function fetchRecommendations() {
      if (!userProfileData) return;
      try {
        setLoadingRecs(true);
        const result: DailyVocabularySuggestionsOutput = await getDailyVocabularySuggestions({
          userLevel: userProfileData.userLevel || 'Intermedio',
          learningGoals: 'Travel vocabulary',
          numberOfSuggestions: 5,
        });
        setRecommendations(result.suggestedWords);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations(['error', 'fetching', 'words']);
      } finally {
        setLoadingRecs(false);
      }
    }
    if (userProfileData) {
        fetchRecommendations();
    }
  }, [userProfileData]);


  // Initial practice questions are now loaded by PracticeContext, typically after login.
  // This component consumes the state from the context.

  if (!isLoaded) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Cargando autenticación...</p>
      </div>
    );
  }

  if (!isSignedIn) {
     return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <p className="mb-4">Parece que no has iniciado sesión.</p>
        <Link href="/login" legacyBehavior><Button>Ir a Iniciar Sesión</Button></Link>
      </div>
    );
  }

  if (!userProfileData && user) {
     return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Cargando datos de perfil...</p>
      </div>
    );
  }

  const userName = user?.firstName || "Usuario";
  const displayUserLevel = userProfileData?.userLevel || 'Novato';
  const displayScore = userProfileData?.score || 0;
  const dailyProgressPercentage = 45; // Placeholder, should come from user profile
  const levelUpMsg = (userProfileData?.wordsLearned || 0) > 0 ? "Sólo 3 entrenamientos más y subís de nivel." : "¡Empezá tu primera práctica!";
  const dailyLessonProgLabel = `${dailyProgressPercentage}% para completar tu lección del día`;
  const wordsLearned = userProfileData?.wordsLearned || 0;
  const displayTematic = currentPracticeSettings?.topic ? 
    currentPracticeSettings.topic.charAt(0).toUpperCase() + currentPracticeSettings.topic.slice(1).replace('-', ' ')
    : (userProfileData?.tematic || 'No definida');


  return (
    <div className="container mx-auto p-4 space-y-6">
      <UserProgressHeader
        mainMessage={`Bienvenido ${userName}!`}
        score={displayScore}
        userLevel={displayUserLevel}
        levelUpMessage={levelUpMsg}
        dailyLessonProgressPercentage={dailyProgressPercentage}
        dailyLessonProgressLabel={dailyLessonProgLabel}
      />

      <div className="bg-base-200 p-3 rounded-lg shadow flex flex-col items-center justify-center text-sm text-base-content text-center">
        <span>Temática de práctica actual: <strong>{displayTematic}</strong></span>
        {timeSinceLastLogin && <span className="mt-1">{timeSinceLastLogin}</span>}
      </div>

      {isLoadingContextPractice && (
        <div className="text-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p>Cargando preguntas de práctica desde el contexto...</p>
        </div>
      )}
      {contextPracticeError && !isLoadingContextPractice && (
        <div role="alert" className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{contextPracticeError}</span>
          {contextPracticeError.includes("Failed to fetch") && <p className="text-xs mt-1">Asegúrate que el backend esté corriendo en http://localhost:3001.</p>}
          {contextPracticeError.includes("localhost:3001") && !contextPracticeError.includes("Failed to fetch") && <p className="text-xs mt-1">Verifica la conexión con el backend en http://localhost:3001.</p>}
        </div>
      )}

      {contextPracticeQuestions.length > 0 && !isLoadingContextPractice && !contextPracticeError && (
         <div className="text-center p-2 bg-green-500/10 text-green-700 rounded-md border border-green-500/30">
           <p className="text-sm">¡Preguntas de práctica listas! Ya puedes</p>
           <Link href="/practice" legacyBehavior>
              <Button variant="link" className="p-0 h-auto text-sm text-green-700 hover:text-green-800">ir a tu práctica.</Button>
           </Link>
         </div>
      )}


      <div className="text-center space-y-3 md:space-y-0 md:flex md:flex-wrap md:justify-center md:gap-3">
        <Link href="/practice" legacyBehavior>
          <Button className="btn btn-primary btn-lg w-full md:w-auto" disabled={isLoadingContextPractice || contextPracticeQuestions.length === 0}>
            <BookOpen size={20} className="mr-2" />
            {wordsLearned > 0 ? 'Continuar Práctica' : 'Hacer mi Primera Práctica'}
          </Button>
        </Link>
        <Link href="/practice-settings" legacyBehavior>
          <Button className="btn btn-secondary btn-lg w-full md:w-auto">
            <Cog size={20} className="mr-2" />
            Configurar Práctica
          </Button>
        </Link>
        {wordsLearned === 0 && (
           <p className="mt-2 text-sm text-base-content/70 w-full">
            <Link href="/level-test" className="link link-accent">
              O empezá con una prueba de nivel
            </Link>
          </p>
        )}
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-xl">Palabras Recomendadas del Día</h2>
          {loadingRecs ? (
            <div className="space-y-2 mt-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="skeleton h-8 w-full"></div>
              ))}
            </div>
          ) : recommendations && recommendations.length > 0 ? (
            <ul className="list-disc list-inside mt-2 space-y-1 text-base-content">
              {recommendations.map((word, index) => (
                <li key={index} className="capitalize flex items-center gap-2">
                  {word}
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-base-content/50 hover:text-primary">
                           <HelpCircle size={16} />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Ver definición (próximamente)</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-base-content/70 mt-2">No hay recomendaciones disponibles en este momento.</p>
          )}
          <div className="card-actions justify-end mt-2">
            <Link href="/practice?source=recommendations" legacyBehavior>
              <Button className="btn btn-outline btn-primary btn-sm" disabled={loadingRecs || !recommendations || recommendations.length === 0}>Practicar estas palabras</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-xl">Nuestros Planes</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className="border border-base-300 p-4 rounded-lg">
              <h3 className="font-semibold text-lg">Plan Gratuito</h3>
              <ul className="list-disc list-inside text-sm text-base-content/80 mt-1">
                <li>Prácticas diarias limitadas</li>
                <li>Recomendaciones básicas</li>
                <li>Seguimiento de progreso</li>
              </ul>
            </div>
            <div className="border border-primary p-4 rounded-lg relative">
              <div className="badge badge-primary absolute -top-3 right-2">Popular</div>
              <h3 className="font-semibold text-lg text-primary">Plan Premium</h3>
              <ul className="list-disc list-inside text-sm text-base-content/80 mt-1">
                <li>Prácticas ilimitadas</li>
                <li>Recomendaciones personalizadas avanzadas</li>
                <li>Análisis detallado de errores</li>
                <li>Acceso a todos los niveles y temas</li>
              </ul>
              <Button className="btn btn-primary btn-sm mt-3">Actualizar a Premium</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

