// src/components/game/NewQuizComponent.tsx
"use client";

import React, { useState } from "react";
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
  correctOptionId: string;
  isCorrect: boolean;
}

interface NewQuizComponentProps {
  questions: Question[];
  quizTitle: string;
  pointsPerCorrectAnswer: number;
  onQuizComplete: (score: number, sessionData: QuizSessionDataItem[]) => void;
  showExplanations?: boolean; // If true, will show translation/explanation for incorrect answers
}

export function NewQuizComponent({
  questions,
  quizTitle,
  pointsPerCorrectAnswer,
  onQuizComplete,
  showExplanations = true,
}: NewQuizComponentProps) {
  const router = useRouter();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean | null>(null);
  const [quizSessionData, setQuizSessionData] = useState<QuizSessionDataItem[]>([]);

  if (!questions || questions.length === 0) {
    return (
      <Card className="shadow-lg text-center">
        <CardHeader>
          <CardTitle>Sin Preguntas</CardTitle>
        </CardHeader>
        <CardContent>
          <p>No hay preguntas disponibles para esta práctica.</p>
        </CardContent>
        <CardFooter>
          <Button onClick={() => router.push(NAV_PATHS.HOME)}>Volver a Inicio</Button>
        </CardFooter>
      </Card>
    );
  }

  const totalQuestions = questions.length;
  const currentQuestion = questions[currentQuestionIndex];

  const handleOptionSelect = (optionId: string) => {
    // Allow changing selection only if feedback is not currently shown
    if (!showFeedback) {
      setSelectedOptionId(optionId);
    }
  };

  const handleSubmitOrNext = () => {
    if (quizCompleted) return;

    if (!selectedOptionId && !showFeedback) {
      alert("Por favor, seleccioná una respuesta.");
      return;
    }

    if (showFeedback) { // User is clicking "Siguiente Pregunta" or "Ver Resultados"
      setShowFeedback(false);
      setIsAnswerCorrect(null);
      setSelectedOptionId(null); // Reset selection for the next question
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setQuizCompleted(true);
        onQuizComplete(score, quizSessionData);
      }
    } else { // User is clicking "Verificar Respuesta"
      if (!selectedOptionId) return; // Should not happen if button is enabled correctly
      const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
      setIsAnswerCorrect(isCorrect);
      setShowFeedback(true);
      if (isCorrect) {
        setScore(score + pointsPerCorrectAnswer);
      }
      setQuizSessionData(prevData => [
        ...prevData,
        {
          questionId: currentQuestion.id,
          questionText: currentQuestion.text,
          selectedOptionId: selectedOptionId,
          correctOptionId: currentQuestion.correctOptionId,
          isCorrect: isCorrect,
        }
      ]);
    }
  };

  const handleRepeatPractice = () => {
    setCurrentQuestionIndex(0);
    setSelectedOptionId(null);
    setScore(0);
    setQuizCompleted(false);
    setShowFeedback(false);
    setIsAnswerCorrect(null);
    setQuizSessionData([]);
  };
  
  const getFeedbackMessage = () => {
    if (isAnswerCorrect) {
      return `¡Correcto! Ganaste +${pointsPerCorrectAnswer} puntos.`;
    }
    if (currentQuestion.type === 'vocabulary' && currentQuestion.translation) {
      return `Incorrecto. La palabra "${currentQuestion.text}" significa: ${currentQuestion.translation}.`;
    }
    if (currentQuestion.type === 'grammar' && currentQuestion.explanation) {
      return `Incorrecto. ${currentQuestion.explanation}.`;
    }
    return 'Respuesta incorrecta.';
  };


  if (quizCompleted) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] p-4">
        <Card className="shadow-lg text-center animate-fadeIn w-full max-w-md">
          <CardHeader>
            <Award className="mx-auto h-16 w-16 text-yellow-400" />
            <CardTitle className="text-3xl mt-4">¡Práctica Completada!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xl">
              Obtuviste <span className="font-semibold text-primary">{score}</span> puntos de{" "}
              {totalQuestions * pointsPerCorrectAnswer}.
            </p>
            <p className="text-muted-foreground">
              ¡Seguí así para alcanzar el próximo nivel!
            </p>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-center space-y-2 sm:space-y-0 sm:space-x-4">
            <Button variant="outline" size="lg" onClick={handleRepeatPractice} className="w-full sm:w-auto">
              Repetir Práctica
            </Button>
            <Button size="lg" onClick={() => router.push(NAV_PATHS.HOME)} className="w-full sm:w-auto">
              Ir a Inicio
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
          <CardDescription className="text-center">
            Poné a prueba tu conocimiento y ganá puntos.
          </CardDescription>
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
                disabled={showFeedback} // Disable radio group when feedback is shown
              >
                {currentQuestion.options.map((option) => (
                  <Label
                    key={option.id}
                    htmlFor={`option-${option.id}`}
                    className={`flex items-center space-x-3 p-3 border rounded-md transition-colors cursor-pointer
                                ${selectedOptionId === option.id && !showFeedback ? 'border-primary ring-2 ring-primary bg-primary/10' : 'hover:bg-accent/10'}
                                ${showFeedback && option.id === currentQuestion.correctOptionId ? 'border-green-500 bg-green-500/10 ring-2 ring-green-500' : ''}
                                ${showFeedback && selectedOptionId === option.id && option.id !== currentQuestion.correctOptionId ? 'border-destructive bg-destructive/10 ring-2 ring-destructive' : ''}
                                ${showFeedback ? 'cursor-not-allowed' : ''}`}
                  >
                    <RadioGroupItem 
                      value={option.id} 
                      id={`option-${option.id}`} 
                      disabled={showFeedback}
                      className="shrink-0"
                    />
                    <span className="text-base flex-1">{option.text}</span>
                  </Label>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {showFeedback && isAnswerCorrect !== null && showExplanations && (
            <div
              className={`p-3 rounded-md flex items-center text-sm animate-fadeIn
                ${isAnswerCorrect
                  ? "bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400"
                  : "bg-destructive/10 border border-destructive/30 text-destructive dark:text-red-400"
                }`}
            >
              {isAnswerCorrect ? (
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
            disabled={!selectedOptionId && !showFeedback}
            className="w-full sm:w-auto"
          >
            {showFeedback 
              ? (currentQuestionIndex < totalQuestions - 1 ? "Siguiente Pregunta" : "Ver Resultados")
              : "Verificar Respuesta"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
