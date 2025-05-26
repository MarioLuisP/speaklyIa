
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDailyVocabularySuggestions, DailyVocabularySuggestionsOutput } from '@/ai/flows/vocabulary-suggestions';
import type { UserProfile } from '@/types';
import { BookOpen, HelpCircle, Cog, Loader2 } from 'lucide-react';
import { UserProgressHeader } from '@/components/layout/UserProgressHeader';
import { differenceInDays, differenceInHours, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { useUser } from '@clerk/nextjs';
import axios from 'axios';

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
  language: "english", // Ensure this matches what backend expects
  level: "beginner",
  topic: "daily-life",
  questionCount: 10,
  questionType: "multiple-choice",
};

const LOCAL_STORAGE_PRACTICE_SETTINGS_KEY = 'speaklyai_practice_settings';

export default function HomePage() {
  const { user, isLoaded: isClerkLoaded } = useUser();
  
  // State for mock backend data (user profile specifics)
  const [userProfileData, setUserProfileData] = useState<Omit<UserProfile, 'id' | 'email' | 'avatarUrl' | 'name' | 'dataAihint' | 'currentVocabularyLevel' | 'learningGoals' | 'dailyLessonTarget' | 'dailyLessonProgress' > | null>(null);
  const [timeSinceLastLogin, setTimeSinceLastLogin] = useState('');

  // State for vocabulary recommendations
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  // State for practice questions fetched after login
  const [practiceQuestions, setPracticeQuestions] = useState<PracticeQuestion[]>([]);
  const [practiceKeywords, setPracticeKeywords] = useState<PracticeKeyword[]>([]);
  const [isLoadingPractice, setIsLoadingPractice] = useState<boolean>(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);
  const [initialPracticeFetchAttempted, setInitialPracticeFetchAttempted] = useState(false);

  // Simulate fetching user-specific data (score, level, tematic, lastLogin)
  useEffect(() => {
    // This would eventually be a fetch to your backend for user data
    // For now, it's hardcoded for "Mario" or the logged-in user's name
    if (isClerkLoaded && user) {
      const mockBackendData: Omit<UserProfile, 'id' | 'email' | 'avatarUrl' | 'name' | 'dataAihint' | 'currentVocabularyLevel' | 'learningGoals' | 'dailyLessonTarget' | 'dailyLessonProgress' > = {
        score: 650,
        userLevel: 'Intermedio', // Default until backend provides
        tematic: 'Viajes',    // Default until backend provides
        lastLogin: new Date(Date.now() - (1000 * 60 * 60 * 27)).toISOString(), // Example: 27 hours ago
        consecutiveDays: 3, // Added for consistency with UserProfile
        wordsLearned: 120, // Added for consistency
      };
      setUserProfileData(mockBackendData);
    }
  }, [isClerkLoaded, user]);

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

  // Fetch daily vocabulary recommendations
  useEffect(() => {
    async function fetchRecommendations() {
      if (!userProfileData) return; // Wait for user profile data
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


  // Fetch initial practice questions after login
  const fetchInitialPracticeQuestions = useCallback(async (userId: string) => {
    setIsLoadingPractice(true);
    setPracticeError(null);
    let configToUse = { ...defaultPracticeConfig };

    try {
      const savedSettingsRaw = localStorage.getItem(LOCAL_STORAGE_PRACTICE_SETTINGS_KEY);
      if (savedSettingsRaw) {
        const savedSettings = JSON.parse(savedSettingsRaw);
        // Basic validation for saved settings structure
        if (savedSettings.language && savedSettings.level && savedSettings.topic && savedSettings.questionCount && savedSettings.questionType) {
             configToUse = {
                language: savedSettings.language === 'en' ? 'english' : savedSettings.language, // ensure "english"
                level: savedSettings.level,
                topic: savedSettings.topic,
                questionCount: parseInt(String(savedSettings.numQuestions), 10) || 10, // from form it was numQuestions
                questionType: savedSettings.questionType,
            };
        }
      }
    } catch (e) {
      console.warn("Could not parse saved practice settings from localStorage", e);
    }
    
    // Backend expects 'questionCount', not 'numQuestions'
    const requestBody = {
        language: configToUse.language,
        level: configToUse.level,
        topic: configToUse.topic,
        questionCount: configToUse.questionCount,
        questionType: configToUse.questionType,
        // userId: userId, // Backend might infer userId from auth token if protected
    };

    try {
      // Replace with your actual backend URL
      const response = await axios.post<{source: string, questions: PracticeQuestion[], keywordData: PracticeKeyword[]}>('http://localhost:8080/api/practice/generate-questions', requestBody);
      setPracticeQuestions(response.data.questions);
      setPracticeKeywords(response.data.keywordData);
      console.log("Practice questions fetched:", response.data);
      if (response.data.source === 'mock') {
        console.warn('BEWARE: Backend returned mock data for practice questions. Mistral API might have failed or is not configured on the backend.');
        // Optionally, set a user-visible warning
      }
    } catch (error) {
      console.error("Error fetching initial practice questions:", error);
      if (axios.isAxiosError(error) && error.response) {
        setPracticeError(`Error del backend: ${error.response.status} - ${error.response.data.message || 'No se pudieron cargar las preguntas.'}`);
      } else {
        setPracticeError('No se pudieron cargar las preguntas de práctica. Intenta más tarde.');
      }
    } finally {
      setIsLoadingPractice(false);
    }
  }, []);

  useEffect(() => {
    if (isClerkLoaded && user && !initialPracticeFetchAttempted) {
      fetchInitialPracticeQuestions(user.id);
      setInitialPracticeFetchAttempted(true);
    }
  }, [isClerkLoaded, user, initialPracticeFetchAttempted, fetchInitialPracticeQuestions]);


  if (!isClerkLoaded || !userProfileData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  const userName = user?.firstName || user?.username || "Mario";
  const displayUserLevel = userProfileData.userLevel || 'Novato';
  const displayScore = userProfileData.score || 0;
  const dailyProgressPercentage = 45; // Placeholder
  const levelUpMsg = "Sólo 3 entrenamientos más y subís de nivel."; // Placeholder for home page
  const dailyLessonProgLabel = `${dailyProgressPercentage}% para completar tu lección del día`; // Placeholder
  const wordsLearned = userProfileData.wordsLearned || 0; // Placeholder

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
        <span>Última temática seleccionada: <strong>{userProfileData.tematic || 'No definida'}</strong></span>
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
        </div>
      )}
      {/* TODO: Logic to pass practiceQuestions and practiceKeywords to the practice page or store them */}
      {/* For now, just logging them if fetched */}
      {practiceQuestions.length > 0 && !isLoadingPractice && (
         <div className="text-center p-2 bg-success/10 rounded-md">
           <p className="text-sm text-success">¡Preguntas de práctica listas!</p>
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
                        <HelpCircle size={16} className="text-base-content/50 cursor-pointer" />
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
              <Button className="btn btn-outline btn-primary btn-sm">Practicar estas palabras</Button>
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
