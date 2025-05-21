"use client";

import React, { useState, useEffect } from 'react';
import type { Question } from '@/types';
import { QuestionCard } from './QuestionCard';
import { Button } from '@/components/ui/button'; // Shadcn button

interface QuizComponentProps {
  questions: Question[];
  quizTitle: string;
  mode: 'level-test' | 'practice';
  onQuizComplete: (score: number, userAnswers?: any[]) => void; // userAnswers for level test analysis
}

export function QuizComponent({ questions, quizTitle, mode, onQuizComplete }: QuizComponentProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [userAnswers, setUserAnswers] = useState<any[]>([]); // For level test
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(180); // 3 minutes for the quiz, example
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


  const handleAnswer = (isCorrect: boolean, isFirstAttempt: boolean) => {
    let pointsEarned = 0;
    if (isCorrect) {
      if (mode === 'level-test') {
        pointsEarned = isFirstAttempt ? 2 : 1;
      } else { // practice mode
        pointsEarned = isFirstAttempt ? 10 : 5; // Example scoring for practice
      }
      setScore(prevScore => prevScore + pointsEarned);
    }

    if (mode === 'level-test') {
      // Find the original question to get the correct answer text
      const currentQ = questions[currentQuestionIndex];
      const correctAnswerText = currentQ.options.find(opt => opt.isCorrect)?.text || '';
      
      // Simulate getting selectedAnswer and attempts, actual implementation would be more robust in QuestionCard
      // For now, this is a simplified representation.
      // This part needs selectedAnswer to be passed up from QuestionCard correctly.
      // For simplicity, I'll assume QuestionCard handles attempts internally and we get a final `isCorrect` and `isFirstAttempt`.
      // The `userAnswers` structure should match `LevelTestAnalysisInput`.
      const answerDetail = {
        question: currentQ.text,
        selectedAnswer: "User's selection" , // This needs to be passed from QuestionCard
        correctAnswer: correctAnswerText,
        attempts: isCorrect ? (isFirstAttempt ? 1 : 2) : 2, // Simplified
      };
      setUserAnswers(prev => [...prev, answerDetail]);
    }
    
    // Automatically move to next question after a short delay to see feedback
    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prevIndex => prevIndex + 1);
      } else {
        handleQuizEnd();
      }
    }, 1500); // 1.5 second delay
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


  if (showResults) {
    return (
      <div className="text-center p-4">
        <h2 className="text-2xl font-semibold mb-4">
          {mode === 'level-test' ? '¡Prueba de Nivel Completada!' : '¡Práctica Completada!'}
        </h2>
        <p className="text-xl mb-2">
          Puntaje Final: <span className="font-bold text-primary">{score}</span> puntos
        </p>
        {/* Further results details or AI analysis message would go here */}
        <Link href="/home" legacyBehavior>
          <Button className="btn btn-secondary mt-6">Volver al Inicio</Button>
        </Link>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return <p className="text-center p-4">No hay preguntas disponibles.</p>;
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
        showTranslationButton={mode === 'practice' || mode === 'level-test'} // Show for both for now
      />
    </div>
  );
}

