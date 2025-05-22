
// src/components/game/NewQuizComponent.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { AlertCircle, CheckCircle2, Award, Info, Volume2, Languages, Loader2 } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Question } from '@/types';
import { NAV_PATHS } from "@/lib/constants";

export interface QuizSessionDataItem { // Exportando la interfaz
  questionId: string;
  questionText: string;
  selectedOptionId: string | null;
  selectedOptionText: string;
  correctOptionId: string;
  correctOptionText: string;
  isCorrect: boolean;
  attempts: number;
}

interface NewQuizComponentProps {
  questions: Question[];
  quizTitle: string;
  pointsPerCorrectAnswer: number;
  pointsPerSecondAttempt?: number;
  onQuizComplete: (score: number, sessionData: QuizSessionDataItem[]) => void;
  showExplanations?: boolean;
  isLevelTest?: boolean;
}

export function NewQuizComponent({
  questions,
  quizTitle,
  pointsPerCorrectAnswer,
  pointsPerSecondAttempt = Math.floor(pointsPerCorrectAnswer / 2),
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
  const [questionIsResolved, setQuestionIsResolved] = useState(false);
  const [firstAttemptIncorrectOptionId, setFirstAttemptIncorrectOptionId] = useState<string | null>(null);

  const [quizSessionData, setQuizSessionData] = useState<QuizSessionDataItem[]>([]);
  const [feedback, setFeedback] = useState<{type: 'correct' | 'incorrect' | 'info' | 'finalIncorrect', message: string} | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [translationError, setTranslationError] = useState<string | null>(null);

  const resetQuestionState = useCallback(() => {
    setSelectedOptionId(null);
    setCurrentQuestionAttempts(0);
    setQuestionIsResolved(false);
    setFirstAttemptIncorrectOptionId(null);
    setFeedback(null);
    setIsSubmitting(false);
    setTranslatedText(null);
    setIsTranslating(false);
    setTranslationError(null);
  }, []);

  useEffect(() => {
    resetQuestionState();
  }, [currentQuestionIndex, resetQuestionState]);


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

  const handleTextToSpeech = () => {
    if (!currentQuestion) return;
    const textToSpeak = currentQuestion.text;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel(); // Cancel any previous speech
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.lang = 'en-US';
      utterance.rate = 0.8; 
      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('Speech Synthesis API no está soportada en este navegador.');
      setFeedback({ type: 'info', message: 'La lectura de voz no está soportada.' });
      setTimeout(() => setFeedback(null), 2000);
    }
  };

  const handleTranslate = async () => {
    if (!currentQuestion || !currentQuestion.text || isTranslating) return;

    setIsTranslating(true);
    setTranslatedText(null);
    setTranslationError(null);

    try {
      const encodedQuery = encodeURIComponent(currentQuestion.text);
      // Using MyMemory API
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodedQuery}&langpair=en|es`);

      if (!response.ok) {
        let errorData;
        let errorMessage = `Error de traducción (${response.status})`;
        try {
          errorData = await response.json();
          if (errorData?.responseDetails) { // MyMemory specific error field
            errorMessage += `: ${errorData.responseDetails}`;
          } else if (errorData?.message) { // Generic message field
             errorMessage += `: ${errorData.message}`;
          } else if (response.statusText) {
            errorMessage += `: ${response.statusText}`;
          } else {
            errorMessage += ": Error desconocido del servidor";
          }
        } catch (e) {
           if (response.statusText) {
            errorMessage += `: ${response.statusText}`;
          } else {
            errorMessage += ": Error desconocido del servidor";
          }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      // MyMemory specific success field
      if (data.responseData && data.responseData.translatedText) {
        setTranslatedText(data.responseData.translatedText);
      } else if (data.responseDetails) { // MyMemory specific error field even on 200 OK
        throw new Error(`Error de traducción: ${data.responseDetails}`);
      } else {
        throw new Error("Respuesta de traducción no válida o vacía.");
      }
    } catch (error: any) {
      console.error("Error al traducir:", error);
      const displayError = error?.message || "No se pudo traducir el texto. Intente más tarde.";
      setTranslationError(displayError);
    } finally {
      setIsTranslating(false);
    }
  };


  const handleOptionSelect = (optionId: string) => {
    if (questionIsResolved || isSubmitting) return;
    // Allow selection only if it's not the first incorrect attempt or if the question isn't resolved
    if (currentQuestionAttempts === 1 && optionId === firstAttemptIncorrectOptionId) return;

    setSelectedOptionId(optionId);
    
    if (feedback && feedback.type === 'incorrect') { 
      setFeedback(null); 
    }
    if (translatedText || translationError) {
        setTranslatedText(null);
        setTranslationError(null);
    }
  };

  const handleSubmitOrNext = () => {
    if (quizCompleted) return; 

    if (questionIsResolved) { 
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setQuizCompleted(true);
        onQuizComplete(score, quizSessionData);
      }
      return; 
    }

    if (!selectedOptionId) {
      setFeedback({type: 'info', message: "Por favor, seleccioná una respuesta."});
      return;
    }

    if (isSubmitting) return; 
    setIsSubmitting(true);

    const attemptsForThisTurn = currentQuestionAttempts + 1;
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    let pointsEarnedThisTurn = 0;
    let questionAttemptResolved = false; 

    const selectedOpt = currentQuestion.options.find(o => o.id === selectedOptionId);
    const correctOpt = currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId);

    if (isCorrect) {
      pointsEarnedThisTurn = attemptsForThisTurn === 1 ? pointsPerCorrectAnswer : (pointsPerSecondAttempt || 0);
      setScore(prevScore => prevScore + pointsEarnedThisTurn);
      setQuestionIsResolved(true);
      questionAttemptResolved = true;
      setFeedback({type: 'correct', message: `¡Correcto! Ganaste +${pointsEarnedThisTurn} puntos.`});
    } else { 
      if (attemptsForThisTurn === 1) { 
        setCurrentQuestionAttempts(1);
        setFirstAttemptIncorrectOptionId(selectedOptionId);
        setFeedback({type: 'incorrect', message: "Respuesta incorrecta. ¡Intentá de nuevo!"});
        
        setTimeout(() => {
          if (currentQuestionAttempts === 1 && !questionIsResolved && feedback?.type === 'incorrect') { 
             setFeedback(null);
             setSelectedOptionId(null); 
          }
          setIsSubmitting(false); 
        }, 1500); 
        return; 
      } else { 
        setQuestionIsResolved(true);
        questionAttemptResolved = true;
        let finalFeedbackMessage = 'Respuesta incorrecta.';
        const correctOptionText = correctOpt?.text || 'desconocida';
        if (showExplanations) {
          finalFeedbackMessage = `Incorrecto. La respuesta correcta era "${correctOptionText}".`;
          if (currentQuestion.explanation) {
            finalFeedbackMessage += ` ${currentQuestion.explanation}`;
          } else if (currentQuestion.type === 'vocabulary' && currentQuestion.translation) {
             finalFeedbackMessage = `Incorrecto. La palabra "${currentQuestion.text}" significa: ${currentQuestion.translation}. La respuesta correcta era "${correctOptionText}".`;
          }
        }
        setFeedback({type: 'finalIncorrect', message: finalFeedbackMessage});
      }
    }
    
    if (questionAttemptResolved) {
      setQuizSessionData(prevData => [
        ...prevData,
        {
          questionId: currentQuestion.id, questionText: currentQuestion.text,
          selectedOptionId: selectedOptionId, selectedOptionText: selectedOpt?.text || '',
          correctOptionId: currentQuestion.correctOptionId, correctOptionText: correctOpt?.text || '',
          isCorrect: isCorrect, attempts: attemptsForThisTurn
        }
      ]);
    }
    
    if (questionAttemptResolved) {
        setIsSubmitting(false);
    }
  };

  const handleRepeatPractice = () => {
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setQuizSessionData([]);
    resetQuestionState(); 
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
    return "Verificar Respuesta"; 
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
                ? "La IA analizará tus resultados para asignarte un nivel."
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

  const questionDisplayTitle = currentQuestion.text;

  return (
    <div className="p-4 space-y-6 flex flex-col items-center">
      <Card className="shadow-lg w-full max-w-2xl">
        <CardHeader className="items-center">
          <div className="flex items-center justify-between w-full mb-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-muted-foreground hover:text-primary"
                    onClick={handleTextToSpeech}
                    disabled={isSubmitting}
                  >
                    <Volume2 size={18} />
                    <span className="sr-only">Leer pregunta</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Leer pregunta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <CardTitle className="text-2xl text-center flex-grow px-2">{quizTitle}</CardTitle>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                   <Button 
                    variant="ghost" 
                    size="icon" 
                    disabled={!questionIsResolved || isTranslating || isSubmitting} 
                    className="text-muted-foreground hover:text-primary disabled:opacity-50"
                    onClick={handleTranslate}
                  >
                    {isTranslating ? <Loader2 size={18} className="animate-spin" /> : <Languages size={18} />}
                    <span className="sr-only">Traducir pregunta</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Traducir pregunta</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          {quizTitle !== "Prueba de Nivel" && ( 
            <CardDescription className="text-center pt-0">
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
                disabled={questionIsResolved || isSubmitting} 
              >
                {currentQuestion.options.map((option) => {
                  const isCurrentlySelected = selectedOptionId === option.id;
                  const isFirstAttemptFail = firstAttemptIncorrectOptionId === option.id;
                  let optionClass = 'hover:bg-accent/10';

                  if (questionIsResolved) { 
                    if (option.id === currentQuestion.correctOptionId) {
                      optionClass = 'border-green-500 bg-green-500/10 ring-2 ring-green-500'; 
                    } else if (isCurrentlySelected && option.id !== currentQuestion.correctOptionId) { 
                      optionClass = 'border-destructive bg-destructive/10 ring-2 ring-destructive';
                    } else { 
                      optionClass = 'opacity-70 cursor-not-allowed';
                    }
                  } else if (currentQuestionAttempts === 1) { 
                    if (isFirstAttemptFail) { 
                         optionClass = 'border-destructive bg-destructive/10 opacity-60 cursor-not-allowed';
                    } else if (isCurrentlySelected) { 
                         optionClass = 'border-primary ring-2 ring-primary bg-primary/10';
                    }
                  } else if (isCurrentlySelected) { 
                     optionClass = 'border-primary ring-2 ring-primary bg-primary/10';
                  }
                  
                  const isDisabledIndividually = questionIsResolved || isSubmitting || (currentQuestionAttempts === 1 && isFirstAttemptFail);

                  return (
                    <Label
                      key={option.id}
                      htmlFor={`option-${option.id}`}
                      className={`flex items-center space-x-3 p-3 border rounded-md transition-colors
                                  ${optionClass}
                                  ${isDisabledIndividually ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                      <RadioGroupItem
                        value={option.id}
                        id={`option-${option.id}`}
                        disabled={isDisabledIndividually}
                        className="shrink-0"
                      />
                      <span className="text-base flex-1">{option.text}</span>
                    </Label>
                  );
                })}
              </RadioGroup>
            </CardContent>
          </Card>

          {isTranslating && (
            <div className="p-3 rounded-md flex items-center text-sm bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400 animate-fadeIn">
              <Loader2 className="mr-2 h-4 w-4 shrink-0 animate-spin" />
              Traduciendo...
            </div>
          )}
          {translationError && !isTranslating && (
            <div className="p-3 rounded-md flex items-center text-sm bg-destructive/10 border border-destructive/30 text-destructive dark:text-red-400 animate-fadeIn">
              <AlertCircle className="mr-2 h-4 w-4 shrink-0" />
              {translationError}
            </div>
          )}
          {translatedText && !isTranslating && (
             <div className="p-3 rounded-md flex items-start text-sm bg-sky-500/10 border border-sky-500/30 text-sky-700 dark:text-sky-400 animate-fadeIn">
              <Languages className="mr-2 h-4 w-4 shrink-0 mt-0.5" />
              <div className="flex-1">
                <span className="font-medium">Traducción:</span> {translatedText}
              </div>
            </div>
          )}

          {feedback && !isTranslating && !isTranslating && ( 
            <div
              className={`p-3 rounded-md flex items-center text-sm animate-fadeIn
                ${feedback.type === 'correct' ? "bg-green-500/10 border border-green-500/30 text-green-700 dark:text-green-400"
                  : feedback.type === 'info' ? "bg-blue-500/10 border border-blue-500/30 text-blue-700 dark:text-blue-400"
                  : "bg-destructive/10 border border-destructive/30 text-destructive dark:text-red-400" 
                }`}
            >
              {feedback.type === 'correct' ? <CheckCircle2 className="mr-2 h-4 w-4 shrink-0" />
                : feedback.type === 'info' ? <Info className="mr-2 h-4 w-4 shrink-0" />
                : <AlertCircle className="mr-2 h-4 w-4 shrink-0" />}
              <span className="leading-snug">{feedback.message}</span>
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
            disabled={isSubmitting || (!questionIsResolved && !selectedOptionId)}
            className="w-full sm:w-auto"
          >
            {isSubmitting && !questionIsResolved ? <Loader2 className="animate-spin" /> : getButtonText()}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
