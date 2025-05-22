
"use client";

import React, { useState } from 'react';
import { NewQuizComponent, QuizSessionDataItem } from '@/components/game/NewQuizComponent'; // Import QuizSessionDataItem
import type { Question } from '@/types';
import { analyzeLevelTest, LevelTestAnalysisInput, LevelTestAnalysisOutput } from '@/ai/flows/level-test-analysis';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// Mock questions for Level Test
const levelTestQuestions: Question[] = [
  { id: 'ltq1', type: 'vocabulary', text: 'Which word means "very happy"?', options: [{id:'o1', text: 'Sorrowful'}, {id:'o2', text: 'Ecstatic'}, {id:'o3', text: 'Neutral'}], correctOptionId: 'o2', translation: 'Extático', explanation: '"Ecstatic" means extremely happy.' },
  { id: 'ltq2', type: 'vocabulary', text: 'A synonym for "important" is:', options: [{id:'o1', text: 'Trivial'}, {id:'o2', text: 'Crucial'}, {id:'o3', text: 'Minor'}], correctOptionId: 'o2', translation: 'Crucial', explanation: '"Crucial" is a synonym for very important.' },
  { id: 'ltq3', type: 'grammar', text: 'She ___ to the store yesterday.', options: [{id:'o1', text: 'go'}, {id:'o2', text: 'goes'}, {id:'o3', text: 'went'}], correctOptionId: 'o3', explanation: 'Past tense of "go" is "went".' },
  { id: 'ltq4', type: 'vocabulary', text: 'What does "ephemeral" mean?', options: [{id:'o1', text: 'Lasting forever'}, {id:'o2', text: 'Lasting a very short time'}, {id:'o3', text: 'Transparent'}], correctOptionId: 'o2', translation: 'Efímero', explanation: '"Ephemeral" means lasting for a very short time.' },
  { id: 'ltq5', type: 'grammar', text: 'This is ___ apple.', options: [{id:'o1', text: 'a'}, {id:'o2', text: 'an'}, {id:'o3', text: 'the'}], correctOptionId: 'o2', explanation: 'Use "an" before a vowel sound.' },
  { id: 'ltq6', type: 'vocabulary', text: '"Diligent" means:', options: [{id:'o1', text: 'Lazy'}, {id:'o2', text: 'Hard-working and careful'}, {id:'o3', text: 'Quick'}], correctOptionId: 'o2', translation: 'Diligente', explanation: '"Diligent" describes someone who works hard and pays attention to detail.' },
  { id: 'ltq7', type: 'grammar', text: 'They ___ watching TV when I arrived.', options: [{id:'o1', text: 'is'}, {id:'o2', text: 'were'}, {id:'o3', text: 'was'}], correctOptionId: 'o2', explanation: '"They" is plural, so use "were" for past continuous.' },
  { id: 'ltq8', type: 'vocabulary', text: 'An antonym for "brave" is:', options: [{id:'o1', text: 'Courageous'}, {id:'o2', text: 'Fearful'}, {id:'o3', text: 'Bold'}], correctOptionId: 'o2', translation: 'Temeroso', explanation: '"Fearful" is an antonym for "brave".' },
  { id: 'ltq9', type: 'grammar', text: 'My book is ___ the table.', options: [{id:'o1', text: 'on'}, {id:'o2', text: 'in'}, {id:'o3', text: 'at'}], correctOptionId: 'o1', explanation: '"On" is used for surfaces.' },
  { id: 'ltq10', type: 'vocabulary', text: 'What is "ubiquitous"?', options: [{id:'o1', text: 'Rare'}, {id:'o2', text: 'Present everywhere'}, {id:'o3', text: 'Invisible'}], correctOptionId: 'o2', translation: 'Ubicuo', explanation: '"Ubiquitous" means appearing or found everywhere.' },
];

export default function LevelTestPage() {
  const [analysisResult, setAnalysisResult] = useState<LevelTestAnalysisOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [finalScoreFromQuiz, setFinalScoreFromQuiz] = useState(0); // Renamed for clarity
  const router = useRouter();

  const handleLevelTestComplete = async (score: number, userAnswers?: QuizSessionDataItem[]) => {
    setFinalScoreFromQuiz(score); // Store the score from NewQuizComponent
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
        // Here you would typically update user's profile with the new level
        console.log("AI Analysis Result:", result);
      } catch (error) {
        console.error("Error analyzing level test:", error);
        // Fallback if AI fails, use score from NewQuizComponent for the score field in fallback
        setAnalysisResult({ level: 'Intermedio', score: score, summary: 'No se pudo completar el análisis IA. Nivel asignado basado en puntaje.' });
      } finally {
        setIsLoadingAnalysis(false);
      }
    } else {
      // Fallback if no answers for analysis, use score from NewQuizComponent for the score field in fallback
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
            <p className="text-lg">Tu puntaje en el test: <span className="font-bold text-primary">{finalScoreFromQuiz}</span></p> {/* Display score from quiz */}
            <div className="divider">Resultado del Análisis IA</div>
            <p className="text-xl">Nivel Asignado: <span className="font-bold text-secondary">{analysisResult.level}</span></p>
            <div className="stats bg-transparent shadow-none">
              <div className="stat p-0">
                <div className="stat-title">Puntaje IA</div>
                <div className="stat-value text-accent">{analysisResult.score}</div> {/* Score from AI analysis */}
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
      pointsPerCorrectAnswer={2} // Specific scoring for level test
      pointsPerSecondAttempt={1} // Specific scoring for level test
      onQuizComplete={handleLevelTestComplete}
      showExplanations={true} // Show explanations after the question is resolved
      isLevelTest={true} // Important for NewQuizComponent to behave as a test
    />
  );
}

