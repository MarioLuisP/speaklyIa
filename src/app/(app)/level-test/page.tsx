"use client";

import React, { useState } from 'react';
import { QuizComponent } from '@/components/game/QuizComponent';
import type { Question } from '@/types';
import { analyzeLevelTest, LevelTestAnalysisInput, LevelTestAnalysisOutput } from '@/ai/flows/level-test-analysis';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Mock questions for Level Test
const levelTestQuestions: Question[] = [
  { id: 'ltq1', type: 'vocabulary', text: 'Which word means "very happy"?', options: [{ text: 'Sorrowful', isCorrect: false }, { text: 'Ecstatic', isCorrect: true }, { text: 'Neutral', isCorrect: false }], translation: 'Extático', explanation: '"Ecstatic" means extremely happy.' },
  { id: 'ltq2', type: 'vocabulary', text: 'A synonym for "important" is:', options: [{ text: 'Trivial', isCorrect: false }, { text: 'Crucial', isCorrect: true }, { text: 'Minor', isCorrect: false }], translation: 'Crucial', explanation: '"Crucial" is a synonym for very important.' },
  { id: 'ltq3', type: 'grammar', text: 'She ___ to the store yesterday.', options: [{ text: 'go', isCorrect: false }, { text: 'goes', isCorrect: false }, { text: 'went', isCorrect: true }], explanation: 'Past tense of "go" is "went".' },
  { id: 'ltq4', type: 'vocabulary', text: 'What does "ephemeral" mean?', options: [{ text: 'Lasting forever', isCorrect: false }, { text: 'Lasting a very short time', isCorrect: true }, { text: 'Transparent', isCorrect: false }], translation: 'Efímero', explanation: '"Ephemeral" means lasting for a very short time.' },
  { id: 'ltq5', type: 'grammar', text: 'This is ___ apple.', options: [{ text: 'a', isCorrect: false }, { text: 'an', isCorrect: true }, { text: 'the', isCorrect: false }], explanation: 'Use "an" before a vowel sound.' },
  // Add 5 more questions to make it 10
  { id: 'ltq6', type: 'vocabulary', text: '"Diligent" means:', options: [{ text: 'Lazy', isCorrect: false }, { text: 'Hard-working and careful', isCorrect: true }, { text: 'Quick', isCorrect: false }], translation: 'Diligente', explanation: '"Diligent" describes someone who works hard and pays attention to detail.' },
  { id: 'ltq7', type: 'grammar', text: 'They ___ watching TV when I arrived.', options: [{ text: 'is', isCorrect: false }, { text: 'were', isCorrect: true }, { text: 'was', isCorrect: false }], explanation: '"They" is plural, so use "were" for past continuous.' },
  { id: 'ltq8', type: 'vocabulary', text: 'An antonym for "brave" is:', options: [{ text: 'Courageous', isCorrect: false }, { text: 'Fearful', isCorrect: true }, { text: 'Bold', isCorrect: false }], translation: 'Temeroso', explanation: '"Fearful" is an antonym for "brave".' },
  { id: 'ltq9', type: 'grammar', text: 'My book is ___ the table.', options: [{ text: 'on', isCorrect: true }, { text: 'in', isCorrect: false }, { text: 'at', isCorrect: false }], explanation: '"On" is used for surfaces.' },
  { id: 'ltq10', type: 'vocabulary', text: 'What is "ubiquitous"?', options: [{ text: 'Rare', isCorrect: false }, { text: 'Present everywhere', isCorrect: true }, { text: 'Invisible', isCorrect: false }], translation: 'Ubicuo', explanation: '"Ubiquitous" means appearing or found everywhere.' },
];

export default function LevelTestPage() {
  const [analysisResult, setAnalysisResult] = useState<LevelTestAnalysisOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const router = useRouter();

  const handleLevelTestComplete = async (score: number, userAnswers?: any[]) => {
    setFinalScore(score);
    if (userAnswers && userAnswers.length > 0) {
      setIsLoadingAnalysis(true);
      try {
        const analysisInput: LevelTestAnalysisInput = { answers: userAnswers };
        const result = await analyzeLevelTest(analysisInput);
        setAnalysisResult(result);
        // Here you would typically update user's profile with the new level
        console.log("AI Analysis Result:", result);
        // For example: updateUserLevel(result.level);
      } catch (error) {
        console.error("Error analyzing level test:", error);
        // Fallback if AI fails
        setAnalysisResult({ level: 'Intermedio', score: score, summary: 'No se pudo completar el análisis IA. Nivel asignado basado en puntaje.' });
      } finally {
        setIsLoadingAnalysis(false);
      }
    } else {
      // Fallback if no answers for analysis
       setAnalysisResult({ level: 'Intermedio', score: score, summary: 'Nivel asignado basado en puntaje. No se proveyeron respuestas para análisis detallado.' });
    }
  };

  if (isLoadingAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-8rem)] p-4 text-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-xl">Analizando tus resultados...</p>
        <p className="text-base-content/70">Esto tomará un momento.</p>
      </div>
    );
  }

  if (analysisResult) {
    return (
      <div className="p-4 text-center space-y-4 max-w-md mx-auto">
        <div className="card bg-base-200 shadow-xl">
          <div className="card-body items-center text-center">
            <h2 className="card-title text-2xl">¡Bien hecho! Has completado la prueba.</h2>
            <p className="text-lg">Tu puntaje: <span className="font-bold text-primary">{finalScore}</span></p>
            <div className="divider">Resultado del Análisis IA</div>
            <p className="text-xl">Nivel Asignado: <span className="font-bold text-secondary">{analysisResult.level}</span></p>
            <div className="stats bg-transparent shadow-none">
              <div className="stat p-0">
                <div className="stat-title">Puntaje IA</div>
                <div className="stat-value text-accent">{analysisResult.score}</div>
              </div>
            </div>
            <p className="text-sm text-base-content/80 mt-2">{analysisResult.summary}</p>
            <div className="card-actions justify-center mt-6">
              <button className="btn btn-primary" onClick={() => router.push('/home')}>Continuar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <QuizComponent
      questions={levelTestQuestions}
      quizTitle="Prueba de Nivel"
      mode="level-test"
      onQuizComplete={handleLevelTestComplete}
    />
  );
}
