
"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { getDailyVocabularySuggestions, DailyVocabularySuggestionsOutput } from '@/ai/flows/vocabulary-suggestions';
import type { UserProfile } from '@/types';
import { BookOpen, Flame, HelpCircle } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { Progress } from '@/components/ui/progress'; // ShadCN Progress

// Mock user data - updated for Laura
const mockUser: UserProfile = {
  id: '1',
  name: 'Laura', // Changed from Usuario Demo
  email: 'laura@example.com',
  avatarUrl: 'https://placehold.co/100x100.png?text=L',
  dataAihint: 'profile avatar',
  level: 'Intermedio', // Level string for other parts of app
  xp: 590, // Points from image
  wordsLearned: 120,
  consecutiveDays: 3, // Streak from image
  currentVocabularyLevel: 'Intermediate', // For AI suggestions
  learningGoals: 'General English improvement and travel vocabulary',
  // Example fields for daily lesson progress, if needed elsewhere
  dailyLessonTarget: 100, // e.g. target XP for the day
  dailyLessonProgress: 45, // e.g. current XP for the day, making it 45%
};

// This can be simplified or removed if not used elsewhere as mastery levels are different now.
// For now, keeping it for potential other uses.
const levelDetails = {
  Novato: { progressToNext: 100 },
  Intermedio: { progressToNext: 250 },
  Experto: { progressToNext: 500 },
};

export default function HomePage() {
  const [user, setUser] = useState<UserProfile>(mockUser);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [loadingRecs, setLoadingRecs] = useState(true);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoadingRecs(true);
        const result: DailyVocabularySuggestionsOutput = await getDailyVocabularySuggestions({
          userLevel: user.currentVocabularyLevel,
          learningGoals: user.learningGoals,
          numberOfSuggestions: 5,
        });
        setRecommendations(result.suggestedWords);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendations(['error', 'fetching', 'words', 'please', 'retry']);
      } finally {
        setLoadingRecs(false);
      }
    }
    fetchRecommendations();
  }, [user.currentVocabularyLevel, user.learningGoals]);

  // For the new header design, "NIVEL 1" is used as per image.
  // The user.level ("Intermedio") can be used for other displays if needed.
  const displayLevel = "NIVEL 1"; // As per image
  const dailyProgressPercentage = user.dailyLessonProgress || 45; // Default to 45% if not set

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* New Header Section */}
      <div className="bg-base-100 p-4 rounded-lg shadow-md space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-xs text-muted-foreground">{displayLevel}</p>
            <p className="text-xs text-muted-foreground mt-1">PUNTOS</p>
            <p className="text-3xl font-bold text-primary">{user.xp}</p>
          </div>
          <Logo size="sm" />
        </div>

        <div>
          <h1 className="text-2xl font-bold">¡Seguí así {user.name}!</h1>
          <p className="text-sm text-muted-foreground">Sólo 3 entrenamientos más y subís de nivel.</p> {/* This text is from image, adjust logic if dynamic */}
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-1">{dailyProgressPercentage}% para completar tu lección del día</p>
          <Progress value={dailyProgressPercentage} className="h-3 rounded-full" />
        </div>
      </div>
      
      {/* Streak Message - Placed below header or above CTA */}
      <div className="bg-base-200 p-3 rounded-lg shadow flex items-center justify-center text-sm text-base-content">
        <Flame size={20} className="mr-2 text-orange-500" />
        <span>¡Estás de racha! Llevas {user.consecutiveDays} respuestas correctas seguidas.</span> {/* Text from image, may need adjustment based on actual streak metric */}
      </div>


      {/* CTA */}
      <div className="text-center">
        <Link href="/practice" legacyBehavior>
          <Button className="btn btn-primary btn-lg">
            <BookOpen size={20} className="mr-2" />
            {user.wordsLearned > 0 ? 'Continuar Práctica' : 'Hacer mi Primera Práctica'}
          </Button>
        </Link>
        {user.wordsLearned === 0 && (
           <p className="mt-2 text-sm text-base-content/70">
            <Link href="/level-test" className="link link-secondary">
              O empezá con una prueba de nivel
            </Link>
          </p>
        )}
      </div>
      

      {/* Daily Recommendations */}
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
                  <div className="tooltip tooltip-right" data-tip="Ver definición (próximamente)">
                    <HelpCircle size={16} className="text-base-content/50 cursor-pointer" />
                  </div>
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

      {/* Plans */}
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
