
// src/components/game/NewQuizComponent.tsx
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Award } from "lucide-react";
import type { Question } from '@/types';
import { NAV_PATHS } from "@/lib/constants";

interface QuizSessionDataItem {
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string; // Added for level test analysis
  correctOptionId: string;
  correctOptionText: string; // Added for level test analysis
  isCorrect: boolean;
  attempts: number; // 1 or 2
}

interface NewQuizComponentProps {
  questions: Question[];
  quizTitle: string;
  pointsPerCorrectAnswer: number;
  pointsPerSecondAttempt?: number; // Points for correct on 2nd try
  onQuizComplete: (score: number, sessionData: QuizSessionDataItem[]) => void;
  showExplanations?: boolean;
  isLevelTest?: boolean; // To adjust button text or other minor behaviors if needed
}

export function NewQuizComponent({
  questions,
  quizTitle,
  pointsPerCorrectAnswer,
  pointsPerSecondAttempt = Math.floor(pointsPerCorrectAnswer / 2), // Default to half if not provided
  onQuizComplete,
  showExplanations = true,
  isLevelTest = false,
}: NewQuizComponentProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  
  const [currentQuestionAttempts, setCurrentQuestionAttempts] = useState(0);
  const [questionIsResolved, setQuestionIsResolved] = useState(false); // True if question is answered (correctly or all attempts used)
  const [firstAttemptIncorrectOptionId, setFirstAttemptIncorrectOptionId] = useState<string | null>(null);
  
  const [quizSessionData, setQuizSessionData] = useState<QuizSessionDataItem[]>([]);

  useEffect(() => {
    // Reset state when question changes
    setSelectedOptionId(null);
    setCurrentQuestionAttempts(0);
    setQuestionIsResolved(false);
    setFirstAttemptIncorrectOptionId(null);
  }, [currentQuestionIndex]);


  if (!questions || questions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] p-4">
        <Card className="shadow-lg text-center w-full max-w-md">
          <CardHeader>
            <CardTitle>Sin Preguntas</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No hay preguntas disponibles para esta práctica.</p>
          </CardContent>
          <CardFooter className="justify-center">
            <Button onClick={() => router.push(NAV_PATHS.HOME)}>Volver a Inicio</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionId: string) => {
    if (questionIsResolved) return;
    // Allow changing selection only if it's the first attempt OR 
    // if it's the second attempt and the selected option is not the one from the first incorrect attempt.
    if (currentQuestionAttempts < 1 || (currentQuestionAttempts === 1 && optionId !== firstAttemptIncorrectOptionId)) {
      setSelectedOptionId(optionId);
    }
  };

  const handleSubmitOrNext = () => {
    if (quizCompleted) return;

    if (questionIsResolved) { // User is clicking "Siguiente Pregunta" or "Ver Resultados"
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setQuizCompleted(true);
        onQuizComplete(score, quizSessionData);
      }
    } else { // User is clicking "Verificar Respuesta" or "Confirmar 2ª Oportunidad"
      if (!selectedOptionId) {
        alert("Por favor, seleccioná una respuesta.");
        return;
      }

      const attempts = currentQuestionAttempts + 1;
      setCurrentQuestionAttempts(attempts);
      const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
      let pointsEarnedThisTurn = 0;
      let resolvedThisTurn = false;

      if (isCorrect) {
        pointsEarnedThisTurn = attempts === 1 ? pointsPerCorrectAnswer : pointsPerSecondAttempt;
        setScore(score + pointsEarnedThisTurn);
        resolvedThisTurn = true;
      } else { // Incorrect
        if (attempts === 1) {
          // First attempt incorrect, allow for a second try
          setFirstAttemptIncorrectOptionId(selectedOptionId);
          setSelectedOptionId(null); // Clear selection for the second attempt
        } else {
          // Second attempt incorrect
          resolvedThisTurn = true;
        }
      }
      
      if(resolvedThisTurn){
        setQuestionIsResolved(true);
      }

      // Always record the attempt for analysis, especially for level test
      const selectedOpt = currentQuestion.options.find(o => o.id === selectedOptionId);
      const correctOpt = currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId);

      setQuizSessionData(prevData => [
        ...prevData,
        {
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          selectedOptionId: selectedOptionId,
          selectedOptionText: selectedOpt?.text || '',
          correctOptionId: currentQuestion.correctOptionId,
          correctOptionText: correctOpt?.text || '',
          isCorrect: isCorrect,
          attempts: attempts 
        }
      ]);
    }
  };

  const handleRepeatPractice = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setQuizSessionData([]);
    // Resetting states specific to a question will be handled by useEffect on currentQuestionIndex change
  };
  
  const getFeedbackMessage = () => {
    if (!questionIsResolved) return null; // No feedback until resolved

    const isLastAttemptCorrect = selectedOptionId === currentQuestion.correctOptionId;

    if (isLastAttemptCorrect) {
      const points = currentQuestionAttempts === 1 ? pointsPerCorrectAnswer : pointsPerSecondAttempt;
      return `¡Correcto! Ganaste +${points} puntos.`;
    }
    // If resolved and not correct, it means all attempts used or it's a level test ending after 1/2 tries
    if (currentQuestion.type === 'vocabulary' && currentQuestion.translation) {
      return `Incorrecto. La palabra "${currentQuestion.text}" significa: ${currentQuestion.translation}.`;
    }
    if (currentQuestion.type === 'grammar' && currentQuestion.explanation) {
      return `Incorrecto. ${currentQuestion.explanation}.`;
    }
    return 'Respuesta incorrecta.';
  };

  const getButtonText = () => {
    if (questionIsResolved) {
      return currentQuestionIndex < totalQuestions - 1 ? "Siguiente Pregunta" : "Ver Resultados";
    }
    if (currentQuestionAttempts === 0) {
      return "Verificar Respuesta";
    }
    if (currentQuestionAttempts === 1 && !questionIsResolved) {
      return "Confirmar 2ª Oportunidad";
    }
    return "Verificar Respuesta"; // Fallback
  };

  if (quizCompleted) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] p-4">
        <Card className="shadow-lg text-center animate-fadeIn w-full max-w-md">
          <CardHeader>
            <Award className="mx-auto h-16 w-16 text-yellow-400" />
            <CardTitle className="text-3xl mt-4">
              {isLevelTest ? "¡Prueba de Nivel Completada!" : "¡Práctica Completada!"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xl">
              Obtuviste <span className="font-semibold text-primary">{score}</span> puntos.
            </p>
            <p className="text-muted-foreground">
              {isLevelTest 
                ? "Analizando tus resultados..." 
                : "¡Seguí así para alcanzar el próximo nivel!"}
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            {!isLevelTest && (
              <Button variant="outline" size="lg" onClick={handleRepeatPractice} className="w-full sm:w-auto">
                Repetir Práctica
              </Button>
            )}
            <Button size="lg" onClick={() => router.push(NAV_PATHS.HOME)} className="w-full sm:w-auto">
              {isLevelTest ? "Continuar" : "Ir a Inicio"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const questionDisplayTitle = currentQuestion.type === 'vocabulary' 
    ? `¿Qué significa "${currentQuestion.text}"?`
    : currentQuestion.text;

  return (
    <div className="p-4 space-y-6 flex flex-col items-center">
      <Card className="shadow-lg w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl text-center">{quizTitle}</CardTitle>
          {quizTitle !== "Prueba de Nivel" && (
            <CardDescription className="text-center">
                Poné a prueba tu conocimiento y ganá puntos.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Pregunta {currentQuestionIndex + 1} de {totalQuestions}
            </p>
            <Progress
              value={((currentQuestionIndex + 1) / totalQuestions) * 100}
              className="mt-1"
              aria-label={`Progreso: ${((currentQuestionIndex + 1) / totalQuestions) * 100}%`}
            />
          </div>

          <Card className="bg-card border border-border">
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {questionDisplayTitle}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={selectedOptionId || ""}
                onValueChange={handleOptionSelect}
                className="space-y-3"
                // Disable radio group if question is resolved or it's 2nd attempt and no new option selected
                disabled={questionIsResolved || (currentQuestionAttempts === 1 && !selectedOptionId && !!firstAttemptIncorrectOptionId) }
              >
                {currentQuestion.options.map((option) => {
                  const isSelected = selectedOptionId === option.id;
                  const isFirstIncorrect = firstAttemptIncorrectOptionId === option.id;
                  let optionClass = 'hover:bg-accent/10';

                  if (questionIsResolved) { // Question is fully resolved, show final correct/incorrect
                    if (option.id === currentQuestion.correctOptionId) {
                      optionClass = 'border-green-500 bg-green-500/10 ring-2 ring-green-500';
                    } else if (isSelected && option.id !== currentQuestion.correctOptionId) {
                      optionClass = 'border-destructive bg-destructive/10 ring-2 ring-destructive';
                    } else {
                      optionClass = 'cursor-not-allowed opacity-70';
                    }
                  } else if (currentQuestionAttempts === 1 && isFirstIncorrect) { // First attempt was made and this option was the incorrect one
                     optionClass = 'border-destructive bg-destructive/10 opacity-60 cursor-not-allowed';
                  } else if (isSelected) { // Current selection, before verification or for 2nd attempt
                     optionClass = 'border-primary ring-2 ring-primary bg-primary/10';
                  }
                  
                  return (
                    <Label
                      key={option.id}
                      htmlFor={`option-${option.id}`}
                      className={`flex items-center space-x-3 p-3 border rounded-md transition-colors
                                  ${optionClass}
                                  ${questionIsResolved || (currentQuestionAttempts === 1 && isFirstIncorrect) ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <RadioGroupItem 
                        value={option.id} 
                        id={`option-${option.id}`} 
                        disabled={questionIsResolved || (currentQuestionAttempts === 1 && isFirstIncorrect)}
                        className="shrink-0"
                      />
                      <span className="text-base flex-1">{option.text}</span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {questionIsResolved && showExplanations && getFeedbackMessage() && (
            <div
              className={`p-3 rounded-md flex items-center text-sm animate-fadeIn
                ${selectedOptionId === currentQuestion.correctOptionId // Use last selected for feedback color
                  ? "bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400"
                  : "bg-destructive/10 border border-destructive/30 text-destructive dark:text-red-400"
                }`}
            >
              {selectedOptionId === currentQuestion.correctOptionId ? (
                <CheckCircle2 className="mr-2 h-4 w-4 shrink-0" />
              ) : (
                <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
              )}
              <span className="leading-snug">{getFeedbackMessage()}</span>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-4 border-t">
          <span className="text-sm text-muted-foreground mb-2 sm:mb-0">
            Puntos: <span className="font-bold text-primary">{score}</span>
          </span>
          <Button 
            size="lg" 
            onClick={handleSubmitOrNext} 
            disabled={!selectedOptionId && !questionIsResolved && currentQuestionAttempts < 2} // Disable if no selection and not resolved yet
            className="w-full sm:w-auto"
          >
            {getButtonText()}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

