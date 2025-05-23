
"use client";

import React, { useState } from 'react';
import { NewQuizComponent, QuizSessionDataItem } from '@/components/game/NewQuizComponent';
import type { Question } from '@/types'; // Question type ya espera 'question' para el enunciado
import { analyzeLevelTest, LevelTestAnalysisInput, LevelTestAnalysisOutput } from '@/ai/flows/level-test-analysis';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Mock questions for Level Test - REESTRUCTURADAS
const levelTestQuestions: Question[] = [
  {
    id: 'ltq1',
    type: 'vocabulary',
    question: 'Which word means "very happy"?', // Campo cambiado de 'text' a 'question'
    translation: 'Extático',
    options: [
      { label: 'A', text: 'Ecstatic', explanation: '"Ecstatic" means extremely happy.' }, // Correcta, primera opción
      { label: 'B', text: 'Sorrowful', explanation: 'Sorrowful means feeling or showing grief.' },
      { label: 'C', text: 'Neutral', explanation: 'Neutral means not supporting any side or having no strong characteristics.' },
    ],
  },
  {
    id: 'ltq2',
    type: 'vocabulary',
    question: 'A synonym for "important" is:', // Campo cambiado
    translation: 'Crucial',
    options: [
      { label: 'A', text: 'Crucial', explanation: '"Crucial" is a synonym for very important.' }, // Correcta
      { label: 'B', text: 'Trivial', explanation: 'Trivial means of little value or importance.' },
      { label: 'C', text: 'Minor', explanation: 'Minor means lesser in importance or seriousness.' },
    ],
  },
  {
    id: 'ltq3',
    type: 'grammar',
    question: 'She ___ to the store yesterday.', // Campo cambiado
    options: [
      { label: 'A', text: 'went', explanation: 'Past tense of "go" is "went".' }, // Correcta
      { label: 'B', text: 'go', explanation: '"Go" is present tense or infinitive, not past simple.' },
      { label: 'C', text: 'goes', explanation: '"Goes" is third-person singular present tense.' },
    ],
  },
  {
    id: 'ltq4',
    type: 'vocabulary',
    question: 'What does "ephemeral" mean?', // Campo cambiado
    translation: 'Efímero',
    options: [
      { label: 'A', text: 'Lasting a very short time', explanation: '"Ephemeral" means lasting for a very short time.' }, // Correcta
      { label: 'B', text: 'Lasting forever', explanation: 'This is the opposite of ephemeral.' },
      { label: 'C', text: 'Transparent', explanation: 'Transparent means see-through, not related to duration.' },
    ],
  },
  {
    id: 'ltq5',
    type: 'grammar',
    question: 'This is ___ apple.', // Campo cambiado
    options: [
      { label: 'A', text: 'an', explanation: 'Use "an" before a vowel sound.' }, // Correcta
      { label: 'B', text: 'a', explanation: 'Use "a" before a consonant sound.' },
      { label: 'C', text: 'the', explanation: '"The" is a definite article, "an" is indefinite and fits here.' },
    ],
  },
  {
    id: 'ltq6',
    type: 'vocabulary',
    question: '"Diligent" means:', // Campo cambiado
    translation: 'Diligente',
    options: [
      { label: 'A', text: 'Hard-working and careful', explanation: '"Diligent" describes someone who works hard and pays attention to detail.' }, // Correcta
      { label: 'B', text: 'Lazy', explanation: 'Lazy is an antonym for diligent.' },
      { label: 'C', text: 'Quick', explanation: 'While diligent people can be quick, "diligent" emphasizes care and effort.' },
    ],
  },
  {
    id: 'ltq7',
    type: 'grammar',
    question: 'They ___ watching TV when I arrived.', // Campo cambiado
    options: [
      { label: 'A', text: 'were', explanation: '"They" is plural, so use "were" for past continuous.' }, // Correcta
      { label: 'B', text: 'is', explanation: '"Is" is singular present tense.' },
      { label: 'C', text: 'was', explanation: '"Was" is singular past tense.' },
    ],
  },
  {
    id: 'ltq8',
    type: 'vocabulary',
    question: 'An antonym for "brave" is:', // Campo cambiado
    translation: 'Temeroso',
    options: [
      { label: 'A', text: 'Fearful', explanation: '"Fearful" is an antonym for "brave".' }, // Correcta
      { label: 'B', text: 'Courageous', explanation: 'Courageous is a synonym for brave.' },
      { label: 'C', text: 'Bold', explanation: 'Bold is a synonym for brave.' },
    ],
  },
  {
    id: 'ltq9',
    type: 'grammar',
    question: 'My book is ___ the table.', // Campo cambiado
    options: [
      { label: 'A', text: 'on', explanation: '"On" is used for surfaces.' }, // Correcta
      { label: 'B', text: 'in', explanation: '"In" is used for enclosed spaces.' },
      { label: 'C', text: 'at', explanation: '"At" is used for specific points or locations, not typically for surfaces like this.' },
    ],
  },
  {
    id: 'ltq10',
    type: 'vocabulary',
    question: 'What is "ubiquitous"?', // Campo cambiado
    translation: 'Ubicuo',
    options: [
      { label: 'A', text: 'Present everywhere', explanation: '"Ubiquitous" means appearing or found everywhere.' }, // Correcta
      { label: 'B', text: 'Rare', explanation: 'Rare is an antonym for ubiquitous.' },
      { label: 'C', text: 'Invisible', explanation: 'Invisible means unable to be seen, not the same as ubiquitous.' },
    ],
  },
];

export default function LevelTestPage() {
  const [analysisResult, setAnalysisResult] = useState<LevelTestAnalysisOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [finalScoreFromQuiz, setFinalScoreFromQuiz] = useState(0);
  const router = useRouter();

  const handleLevelTestComplete = async (score: number, userAnswers?: QuizSessionDataItem[]) => {
    setFinalScoreFromQuiz(score); 
    if (userAnswers && userAnswers.length > 0) {
      setIsLoadingAnalysis(true);
      try {
        const analysisInput: LevelTestAnalysisInput = { 
            answers: userAnswers.map(ans => ({
                question: ans.questionText,
                selectedAnswer: ans.selectedOptionText,
                correctAnswer: ans.correctOptionText,
                attempts: ans.attempts,
            }))
        };
        const result = await analyzeLevelTest(analysisInput);
        setAnalysisResult(result);
        console.log("AI Analysis Result:", result);
      } catch (error) {
        console.error("Error analyzing level test:", error);
        setAnalysisResult({ level: 'Intermedio', score: score, summary: 'No se pudo completar el análisis IA. Nivel asignado basado en puntaje.' });
      } finally {
        setIsLoadingAnalysis(false);
      }
    } else {
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
            <p className="text-lg">Tu puntaje en el test: <span className="font-bold text-primary">{finalScoreFromQuiz}</span></p>
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
    <NewQuizComponent
      questions={levelTestQuestions}
      quizTitle="Prueba de Nivel"
      pointsPerCorrectAnswer={2}
      pointsPerSecondAttempt={1}
      onQuizComplete={handleLevelTestComplete}
      showExplanations={true} 
      isLevelTest={true}
      quizInstanceId="levelTestQuiz" // Added a unique ID for sessionStorage persistence
    />
  );
}
