
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDailyVocabularySuggestions, DailyVocabularySuggestionsOutput } from '@/ai/flows/vocabulary-suggestions';
import type { UserProfile as AppUserProfile } from '@/types'; // Renamed to avoid conflict with Clerk's UserProfile
import { BookOpen, HelpCircle, Cog, Loader2 } from 'lucide-react';
import { UserProgressHeader } from '@/components/layout/UserProgressHeader';
import { differenceInDays, differenceInHours, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";


// Define interfaces for practice data (could be in types/index.ts)
interface PracticeQuestionOption {
  label: "A" | "B" | "C";
  text: string;
  explanation: string;
}
interface PracticeQuestion {
  question: string;
  options: PracticeQuestionOption[];
}
interface PracticeKeyword {
  id: number;
  word: string;
}

const defaultPracticeConfig = {
  language: "english",
  level: "beginner",
  topic: "daily-life",
  questionCount: 10,
  questionType: "multiple-choice",
};

const LOCAL_STORAGE_PRACTICE_SETTINGS_KEY = 'speaklyai_practice_settings';
const MOCK_USER_SESSION_KEY = 'speaklyai_mock_user_session';

interface MockUserSession {
  id: string;
  firstName: string;
  email: string;
}

export default function HomePage() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  
  const [userProfileData, setUserProfileData] = useState<Omit<AppUserProfile, 'id' | 'email' | 'avatarUrl' | 'name' | 'dataAihint' | 'currentVocabularyLevel' | 'learningGoals' | 'dailyLessonTarget' | 'dailyLessonProgress' > | null>(null);
  const [timeSinceLastLogin, setTimeSinceLastLogin] = useState('');
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [practiceKeywords, setPracticeKeywords] = useState<PracticeKeyword[]>([]);
  const [isLoadingPractice, setIsLoadingPractice] = useState<boolean>(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const [initialPracticeFetchAttempted, setInitialPracticeFetchAttempted] = useState(false);
  
  const [effectiveUser, setEffectiveUser] = useState<MockUserSession | null>(null);

  useEffect(() => {
    if (isClerkLoaded) {
      if (clerkUser) {
        setEffectiveUser({
          id: clerkUser.id,
          firstName: clerkUser.firstName || clerkUser.username || 'Usuario',
          email: clerkUser.emailAddresses?.[0]?.emailAddress || 'no-email@example.com',
        });
      } else {
        const mockSessionRaw = localStorage.getItem(MOCK_USER_SESSION_KEY);
        if (mockSessionRaw) {
          try {
            const mockUserData = JSON.parse(mockSessionRaw) as MockUserSession;
            setEffectiveUser(mockUserData);
          } catch (e) {
            console.error("Error parsing mock user session from localStorage", e);
            localStorage.removeItem(MOCK_USER_SESSION_KEY);
          }
        }
      }
    }
  }, [clerkUser, isClerkLoaded]);


  // Simulate fetching user-specific data (score, level, tematic, lastLogin)
  useEffect(() => {
    if (effectiveUser) { // Use effectiveUser which could be Clerk's or mock
      const mockBackendData: Omit<AppUserProfile, 'id' | 'email' | 'avatarUrl' | 'name' | 'dataAihint' | 'currentVocabularyLevel' | 'learningGoals' | 'dailyLessonTarget' | 'dailyLessonProgress' > = {
        score: 650,
        userLevel: 'Intermedio',
        tematic: 'Viajes',
        lastLogin: new Date(Date.now() - (1000 * 60 * 60 * 27)).toISOString(),
        consecutiveDays: 3,
        wordsLearned: 120,
      };
      setUserProfileData(mockBackendData);
    }
  }, [effectiveUser]);

  useEffect(() => {
    if (userProfileData?.lastLogin) {
      const lastLoginDate = new Date(userProfileData.lastLogin);
      const now = new Date();
      const days = differenceInDays(now, lastLoginDate);
      
      if (days > 0) {
        setTimeSinceLastLogin(`Han pasado ${formatDistanceToNowStrict(lastLoginDate, { locale: es, unit: 'day', addSuffix: true })}.`);
      } else {
        const hours = differenceInHours(now, lastLoginDate);
        if (hours > 0) {
          setTimeSinceLastLogin(`Han pasado ${formatDistanceToNowStrict(lastLoginDate, { locale: es, unit: 'hour', addSuffix: true })}.`);
        } else {
          setTimeSinceLastLogin("¡Volviste hace poco!");
        }
      }
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

  const fetchInitialPracticeQuestions = useCallback(async (userId: string | undefined) => {
    if (!userId) {
      setPracticeError("No se pudo identificar al usuario para cargar preguntas.");
      setIsLoadingPractice(false); // Ensure loading state is cleared
      return;
    }

    setIsLoadingPractice(true);
    setPracticeError(null);
    let configToUse = { ...defaultPracticeConfig };

    try {
      const savedSettingsRaw = localStorage.getItem(LOCAL_STORAGE_PRACTICE_SETTINGS_KEY);
      if (savedSettingsRaw) {
        const savedSettings = JSON.parse(savedSettingsRaw);
        if (savedSettings.language && savedSettings.level && savedSettings.topic && savedSettings.numQuestions && savedSettings.questionType) { // numQuestions from form
             configToUse = {
                language: savedSettings.language === 'en' ? 'english' : savedSettings.language,
                level: savedSettings.level,
                topic: savedSettings.topic,
                questionCount: parseInt(String(savedSettings.numQuestions), 10) || 10,
                questionType: savedSettings.questionType,
            };
        }
      }
    } catch (e) {
      console.warn("Could not parse saved practice settings from localStorage", e);
    }
    
    const requestBody = {
        language: configToUse.language,
        level: configToUse.level,
        topic: configToUse.topic,
        questionCount: configToUse.questionCount, // ensure this is what backend expects
        questionType: configToUse.questionType,
        // userId: userId, // Backend might infer userId from auth token (Clerk) or not need it for this call
    };

    try {
      const response = await axios.post<{source: string, questions: PracticeQuestion[], keywordData: PracticeKeyword[]}>('http://localhost:8080/api/practice/generate-questions', requestBody);
      setPracticeQuestions(response.data.questions);
      setPracticeKeywords(response.data.keywordData);
      console.log("Practice questions fetched:", response.data);
      if (response.data.source === 'mock') {
        console.warn('BEWARE: Backend returned mock data for practice questions. Mistral API might have failed or is not configured on the backend.');
      }
    } catch (error) {
      console.error("Error fetching initial practice questions:", error);
      if (axios.isAxiosError(error) && error.response) {
        setPracticeError(`Error del backend: ${error.response.status} - ${error.response.data?.message || 'No se pudieron cargar las preguntas.'}`);
      } else if (error instanceof Error) {
        setPracticeError(`No se pudieron cargar las preguntas de práctica: ${error.message}`);
      } else {
        setPracticeError('No se pudieron cargar las preguntas de práctica. Intenta más tarde.');
      }
    } finally {
      setIsLoadingPractice(false);
    }
  }, []);

  useEffect(() => {
    // This effect triggers the fetch once we know who the user is (Clerk or mock)
    if (isClerkLoaded && effectiveUser && !initialPracticeFetchAttempted) {
      fetchInitialPracticeQuestions(effectiveUser.id);
      setInitialPracticeFetchAttempted(true);
    } else if (isClerkLoaded && !effectiveUser && !initialPracticeFetchAttempted) {
      // If Clerk has loaded and there's no user (neither Clerk nor mock),
      // we might not want to fetch, or fetch generic questions.
      // For now, we only fetch if effectiveUser.id is available.
      // We set initialPracticeFetchAttempted to true to prevent retries if there's no user.
      setInitialPracticeFetchAttempted(true); 
      // console.log("Clerk loaded, no effective user, not fetching practice questions yet.");
    }
  }, [isClerkLoaded, effectiveUser, initialPracticeFetchAttempted, fetchInitialPracticeQuestions]);


  if (!isClerkLoaded && !effectiveUser) { // Show loader if Clerk is loading AND no mock user is immediately available
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }
  
  // If Clerk has loaded, but there's no effectiveUser (neither Clerk nor mock)
  // and userProfileData (which depends on effectiveUser) is also not there,
  // it might mean the user needs to login.
  // However, Clerk middleware should handle redirection to login.
  // This check is more for when effectiveUser is determined but profile data is still loading.
  if (isClerkLoaded && !userProfileData && effectiveUser) {
     return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-2">Cargando datos de perfil...</p>
      </div>
    );
  }
  
  // If no user at all after loading, it's an issue, or they should be redirected by middleware
  if (isClerkLoaded && !effectiveUser && !userProfileData) {
     return (
      <div className="flex flex-col justify-center items-center min-h-screen text-center">
        <p className="mb-4">Parece que no has iniciado sesión.</p>
        <Link href="/login" legacyBehavior><Button>Ir a Iniciar Sesión</Button></Link>
      </div>
    );
  }


  const userName = effectiveUser?.firstName || "Usuario";
  const displayUserLevel = userProfileData?.userLevel || 'Novato';
  const displayScore = userProfileData?.score || 0;
  const dailyProgressPercentage = userProfileData?.dailyLessonProgress || 45;
  const levelUpMsg = userProfileData?.wordsLearned && userProfileData.wordsLearned > 0 ? "Sólo 3 entrenamientos más y subís de nivel." : "¡Empezá tu primera práctica!";
  const dailyLessonProgLabel = `${dailyProgressPercentage}% para completar tu lección del día`;
  const wordsLearned = userProfileData?.wordsLearned || 0;

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
        <span>Última temática seleccionada: <strong>{userProfileData?.tematic || 'No definida'}</strong></span>
        {timeSinceLastLogin && <span className="mt-1">{timeSinceLastLogin}</span>}
      </div>

      {isLoadingPractice && (
        <div className="text-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
          <p>Cargando preguntas de práctica...</p>
        </div>
      )}
      {practiceError && (
        <div role="alert" className="alert alert-error">
          <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          <span>{practiceError}</span>
          {practiceError.includes("Failed to fetch") && <p className="text-xs mt-1">Asegúrate que el backend esté corriendo en http://localhost:8080.</p>}
        </div>
      )}
      
      {practiceQuestions.length > 0 && !isLoadingPractice && (
         <div className="text-center p-2 bg-green-500/10 text-green-700 rounded-md border border-green-500/30">
           <p className="text-sm">¡Preguntas de práctica listas! Ya puedes</p>
           <Link href="/practice" legacyBehavior>
              <Button variant="link" className="p-0 h-auto text-sm text-green-700 hover:text-green-800">ir a tu práctica.</Button>
           </Link>
         </div>
      )}


      <div className="text-center space-y-3 md:space-y-0 md:flex md:flex-wrap md:justify-center md:gap-3">
        <Link href="/practice" legacyBehavior>
          <Button className="btn btn-primary btn-lg w-full md:w-auto" disabled={isLoadingPractice || practiceQuestions.length === 0}>
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
