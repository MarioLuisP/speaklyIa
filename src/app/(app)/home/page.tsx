"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Shadcn button
import { getDailyVocabularySuggestions, DailyVocabularySuggestionsOutput } from '@/ai/flows/vocabulary-suggestions';
import type { UserProfile } from '@/types';
import { BookOpen, Zap, Shield, Star, HelpCircle } from 'lucide-react';

// Mock user data - replace with actual data fetching
const mockUser: UserProfile = {
  id: '1',
  name: 'Usuario Demo',
  email: 'demo@example.com',
  avatarUrl: 'https://placehold.co/100x100.png?text=UD',
  dataAihint: 'profile avatar',
  level: 'Novato',
  xp: 75,
  wordsLearned: 20,
  consecutiveDays: 3,
  currentVocabularyLevel: 'Novice',
  learningGoals: 'General English improvement and travel vocabulary',
};

const levelDetails = {
  Novato: { icon: Shield, color: 'text-success', progressToNext: 100 },
  Intermedio: { icon: Star, color: 'text-info', progressToNext: 250 },
  Experto: { icon: Zap, color: 'text-primary', progressToNext: 500 },
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
        setRecommendations(['error', 'fetching', 'words', 'please', 'retry']); // Fallback
      } finally {
        setLoadingRecs(false);
      }
    }
    fetchRecommendations();
  }, [user.currentVocabularyLevel, user.learningGoals]);

  const currentLevelDetail = levelDetails[user.level];
  const progressPercentage = Math.min((user.xp / currentLevelDetail.progressToNext) * 100, 100);

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* Welcome Message & Level */}
      <div className="card bg-base-200 shadow-xl">
        <div className="card-body">
          <h1 className="card-title text-3xl">¡Hola, {user.name}!</h1>
          <p className="text-base-content/80">Listo para expandir tu vocabulario hoy?</p>
          <div className="flex items-center gap-2 mt-2">
            <currentLevelDetail.icon size={24} className={currentLevelDetail.color} />
            <span className={`font-semibold ${currentLevelDetail.color}`}>{user.level}</span>
            <span>- Nivel {Math.floor(user.xp / 50) + 1}</span>
          </div>
          <progress className={`progress ${currentLevelDetail.color.replace('text-','progress-')} w-full mt-1`} value={progressPercentage} max="100"></progress>
          <p className="text-xs text-base-content/70 mt-1">{user.xp} / {currentLevelDetail.progressToNext} XP para el siguiente nivel de maestría.</p>
        </div>
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
