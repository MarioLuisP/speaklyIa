
"use client";

import React, { useState, useEffect } from 'react';
import type { Question } from '@/types';
import { QuestionCard } from './QuestionCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link'; // Import Link

interface QuizComponentProps {
  questions: Question[];
  quizTitle: string;
  mode: 'level-test' | 'practice';
  onQuizComplete: (score: number, userAnswers?: any[]) => void;
}

export function QuizComponent({ questions, quizTitle, mode, onQuizComplete }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); 
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (!quizStarted || showResults) return;
    if (timeLeft === 0) {
      handleQuizEnd();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft((prevTime) => prevTime - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft, quizStarted, showResults]);
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleAnswer = (isCorrect: boolean, isFirstAttempt: boolean, selectedOptionText: string, isQuestionResolved: boolean) => {
    let pointsEarned = 0;
    if (isCorrect) {
      if (mode === 'level-test') {
        pointsEarned = isFirstAttempt ? 2 : 1;
      } else { 
        pointsEarned = isFirstAttempt ? 10 : 5; 
      }
      setScore(prevScore => prevScore + pointsEarned);
    }

    if (mode === 'level-test' && isQuestionResolved) {
      const currentQ = questions[currentQuestionIndex];
      const correctAnswerText = currentQ.options.find(opt => opt.isCorrect)?.text || '';
      
      let finalAttemptsForAnalysis: number;
      if (isCorrect) {
        finalAttemptsForAnalysis = isFirstAttempt ? 1 : 2;
      } else { 
        finalAttemptsForAnalysis = 2; // Incorrect and resolved means max attempts used
      }

      const answerDetail = {
        question: currentQ.text,
        selectedAnswer: selectedOptionText,
        correctAnswer: correctAnswerText,
        attempts: finalAttemptsForAnalysis,
      };
      setUserAnswers(prev => [...prev, answerDetail]);
    }
    
    if (isQuestionResolved) {
      setTimeout(() => {
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prevIndex => prevIndex + 1);
        } else {
          handleQuizEnd();
        }
      }, 1500); 
    }
  };

  const handleQuizEnd = () => {
    setShowResults(true);
    if (mode === 'level-test') {
      onQuizComplete(score, userAnswers);
    } else {
      onQuizComplete(score);
    }
  };
  
  if (!quizStarted) {
    return (
      <div className="text-center p-4">
        <h1 className="text-3xl font-bold mb-4">{quizTitle}</h1>
        <p className="mb-2">Tenés {questions.length} preguntas.</p>
        <p className="mb-6">Tiempo límite: {formatTime(timeLeft)}</p>
        <Button onClick={() => setQuizStarted(true)} className="btn btn-primary btn-lg">
          Comenzar {mode === 'level-test' ? 'Prueba de Nivel' : 'Práctica'}
        </Button>
      </div>
    );
  }

  if (showResults && mode === 'practice') { // Specific display for practice mode completion
    return (
      <div className="text-center p-4">
        <h2 className="text-2xl font-semibold mb-4">¡Práctica Completada!</h2>
        <p className="text-xl mb-2">
          Puntaje Final: <span className="font-bold text-primary">{score}</span> puntos
        </p>
        <Link href="/home" legacyBehavior>
          <Button className="btn btn-secondary mt-6">Volver al Inicio</Button>
        </Link>
      </div>
    );
  }
  // Note: For 'level-test', the results display is handled by the LevelTestPage itself after AI analysis.
  // So, if showResults is true and mode is 'level-test', QuizComponent effectively renders nothing,
  // allowing LevelTestPage to take over. This is fine. If LevelTestPage needs QuizComponent
  // to render something generic *before* AI analysis is shown, this structure would need adjustment.


  if (!questions || questions.length === 0) {
    return <p className="text-center p-4">No hay preguntas disponibles.</p>;
  }

  // If it's level-test mode and results are to be shown, LevelTestPage handles UI.
  // So, don't render the question card if showResults is true for level-test.
  if (showResults && mode === 'level-test') {
      return null; // Or a loading indicator if LevelTestPage isn't immediately ready
  }


  const currentQuestion = questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="p-4 space-y-6">
      <div className="flex justify-between items-center sticky top-[calc(var(--navbar-height,4rem)+1rem)] z-20 bg-base-100/80 backdrop-blur-md p-2 rounded-lg shadow">
        <h1 className="text-xl font-semibold">{quizTitle}</h1>
        <div className="text-lg font-mono badge badge-outline badge-lg">{formatTime(timeLeft)}</div>
      </div>
      
      <div className="my-4">
        <progress className="progress progress-primary w-full" value={progressPercentage} max="100"></progress>
        <p className="text-xs text-center mt-1 text-base-content/70">Pregunta {currentQuestionIndex + 1} de {questions.length}</p>
      </div>

      <QuestionCard
        question={currentQuestion}
        questionNumber={currentQuestionIndex + 1}
        totalQuestions={questions.length}
        onAnswer={handleAnswer}
        showTranslationButton={mode === 'practice' || mode === 'level-test'}
      />
    </div>
  );
}
