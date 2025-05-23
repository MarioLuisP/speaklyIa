
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
import type { Question as OriginalQuestion, ApiQuestionOption } from '@/types';
import { NAV_PATHS } from "@/lib/constants";

// Tipos internos para el componente después de procesar las preguntas originales
interface ProcessedQuestionOption {
  id: string;
  text: string;
  explanation: string;
  originalLabel: string; // 'A', 'B', 'C', etc.
}

interface ProcessedQuestion {
  id: string;
  questionText: string; // Texto de la pregunta
  options: ProcessedQuestionOption[];
  correctOptionId: string;
  type?: OriginalQuestion['type'];
}

export interface QuizSessionDataItem {
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
  questions: OriginalQuestion[];
  quizTitle: string;
  pointsPerCorrectAnswer: number;
  pointsPerSecondAttempt?: number;
  onQuizComplete: (score: number, sessionData: QuizSessionDataItem[]) => void;
  showExplanations?: boolean;
  isLevelTest?: boolean;
}

const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

export function NewQuizComponent({
  questions: originalQuestions,
  quizTitle,
  pointsPerCorrectAnswer,
  pointsPerSecondAttempt = Math.floor(pointsPerCorrectAnswer / 2),
  onQuizComplete,
  showExplanations = true,
  isLevelTest = false,
}: NewQuizComponentProps) {
  const router = useRouter();
  const [shuffledQuestions, setShuffledQuestions] = useState<ProcessedQuestion[]>([]);
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
    setTranslatedText(null);
    setIsTranslating(false);
    setTranslationError(null);
  }, []);

  useEffect(() => {
    if (originalQuestions && originalQuestions.length > 0) {
      const processedQs: ProcessedQuestion[] = originalQuestions.map((origQ, questionIndex) => {
        const baseQuestionId = origQ.id || `q${questionIndex}`;
        let derivedCorrectOptionId = '';

        const optionsWithIdsAndOriginalLabel: ProcessedQuestionOption[] = origQ.options.map((apiOpt, optionIndex) => {
          // Ensure apiOpt.label is a string or fallback to index
          const labelPart = typeof apiOpt.label === 'string' ? apiOpt.label : String(optionIndex);
          const currentOptionId = `${baseQuestionId}-opt${labelPart}`;
          
          // The first option in the original JSON is always correct
          if (optionIndex === 0) {
            derivedCorrectOptionId = currentOptionId;
          }
          return {
            id: currentOptionId,
            text: apiOpt.text,
            explanation: apiOpt.explanation,
            originalLabel: labelPart,
          };
        });
        
        const shuffledProcessedOptions = shuffleArray(optionsWithIdsAndOriginalLabel);

        return {
          id: baseQuestionId,
          questionText: origQ.question, // CRITICAL FIX: Ensuring this assignment
          options: shuffledProcessedOptions,
          correctOptionId: derivedCorrectOptionId,
          // type: origQ.type, // Removed as 'type' is not in the new JSON structure
        };
      });
      // console.log("Processed Questions:", JSON.stringify(processedQs, null, 2)); 
      setShuffledQuestions(processedQs);
      
      // Reset main quiz state as questions have changed
      setCurrentQuestionIndex(0);
      setScore(0);
      setQuizCompleted(false);
      setQuizSessionData([]);
      // resetQuestionState will be called by the useEffect dependent on currentQuestionIndex changing to 0
    } else {
      setShuffledQuestions([]); // Ensure it's empty if no original questions
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [originalQuestions]);


  useEffect(() => {
    resetQuestionState();
  }, [currentQuestionIndex, resetQuestionState]);

  
  if (!originalQuestions || originalQuestions.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] p-4">
        <Card className="shadow-lg text-center w-full max-w-md">
          <CardHeader><CardTitle>Cargando Preguntas...</CardTitle></CardHeader>
          <CardContent>
            <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
            <p className="mt-2">Por favor, esperá un momento.</p>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  const totalQuestions = shuffledQuestions.length;

  if (totalQuestions === 0) { 
     return ( 
       <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] p-4">
         <Card className="shadow-lg text-center w-full max-w-md">
           <CardHeader><CardTitle>Preparando Quiz...</CardTitle></CardHeader>
           <CardContent><Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" /></CardContent>
         </Card>
       </div>
    );
  }
  
  const currentQuestion = shuffledQuestions[currentQuestionIndex];

  if (!currentQuestion) {
    // This case implies an issue if currentQuestionIndex is out of bounds for a non-empty shuffledQuestions array
    // or shuffledQuestions somehow became malformed after initial processing.
    return (
      <div className="flex justify-center items-center min-h-[calc(100vh-12rem)] p-4">
        <Card className="shadow-lg text-center w-full max-w-md">
          <CardHeader><CardTitle>Error Cargando Pregunta</CardTitle></CardHeader>
          <CardContent><p>No se pudo cargar la pregunta actual ({currentQuestionIndex + 1} de {totalQuestions}). Por favor, intentá recargar.</p></CardContent>
           <CardFooter className="justify-center">
            <Button onClick={() => router.push(NAV_PATHS.HOME)}>Volver a Inicio</Button>
          </CardFooter>
        </Card>
      </div>
     );
  }


  const handleTextToSpeech = () => {
    if (!currentQuestion?.questionText) {
        setFeedback({ type: 'info', message: 'No hay texto para leer.' });
        setTimeout(() => setFeedback(null), 2000);
        return;
    }
    const textToSpeak = currentQuestion.questionText;
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
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
    if (!currentQuestion?.questionText) {
        setFeedback({ type: 'info', message: 'No hay texto para traducir.' });
        setTimeout(() => setFeedback(null), 2000);
        return;
    }
    if (isTranslating) return;

    setIsTranslating(true);
    setTranslatedText(null);
    setTranslationError(null);
    try {
      const encodedQuery = encodeURIComponent(currentQuestion.questionText);
      const response = await fetch(`https://api.mymemory.translated.net/get?q=${encodedQuery}&langpair=en|es`);
      
      let errorMessage = `Error de traducción (${response.status})`;
      if (!response.ok) {
        try {
          const errorData = await response.json();
          if (errorData?.responseDetails) { errorMessage += `: ${errorData.responseDetails}`; }
          else if (errorData?.responseData?.translatedText?.includes("NO QUERY SPECIFIED") || (errorData?.match && typeof errorData.match === 'number' && errorData.match < 0.5)) {
            errorMessage += ": No se especificó consulta o hubo un problema con la API de MyMemory.";
          } else if (errorData?.message) { errorMessage += `: ${errorData.message}`; }
          else if (response.statusText) { errorMessage += `: ${response.statusText}`; }
          else { errorMessage += ": Error desconocido del servidor"; }
        } catch (e) {
          if (response.statusText) { errorMessage += `: ${response.statusText}`; }
           else { errorMessage += ": Error desconocido del servidor (cuerpo no JSON)"; }
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      if (data.responseData && data.responseData.translatedText && !data.responseData.translatedText.includes("NO QUERY SPECIFIED")) {
        setTranslatedText(data.responseData.translatedText);
      } else if (data.responseDetails || data.responseData?.translatedText?.includes("NO QUERY SPECIFIED")) {
        throw new Error(`Error de traducción: ${data.responseDetails || "Respuesta no válida de la API de MyMemory."}`);
      } else {
        throw new Error("Respuesta de traducción no válida o vacía.");
      }
    } catch (error: any) {
      console.error("Error al traducir:", error);
      setTranslationError(error?.message || "No se pudo traducir el texto.");
    } finally {
      setIsTranslating(false);
    }
  };

  const handleOptionSelect = (optionId: string) => {
    if (questionIsResolved || isSubmitting) return;
    if (currentQuestionAttempts === 0 || (currentQuestionAttempts === 1 && optionId !== firstAttemptIncorrectOptionId)) {
      setSelectedOptionId(optionId);
    }
    if (feedback && (feedback.type === 'incorrect' || feedback.type === 'info')) { 
      setFeedback(null); 
    }
    if (translatedText || translationError) {
        setTranslatedText(null);
        setTranslationError(null);
    }
  };

  const handleSubmitOrNext = () => {
    if (quizCompleted || isSubmitting) return; 
    
    if (questionIsResolved) { 
      setIsSubmitting(true); 
      if (currentQuestionIndex < totalQuestions - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      } else {
        setQuizCompleted(true);
        onQuizComplete(score, quizSessionData);
      }
      setIsSubmitting(false); 
      return; 
    }

    if (!selectedOptionId) {
      setFeedback({type: 'info', message: "Por favor, seleccioná una respuesta."});
      return;
    }
    
    setIsSubmitting(true);

    const attemptsForThisTurn = currentQuestionAttempts + 1;
    const isCorrect = selectedOptionId === currentQuestion.correctOptionId;
    let pointsEarnedThisTurn = 0;
    
    const selectedOptionObject = currentQuestion.options.find(o => o.id === selectedOptionId);
    const correctOptionObject = currentQuestion.options.find(o => o.id === currentQuestion.correctOptionId);
    
    let feedbackMessage = "";
    let feedbackType: 'correct' | 'incorrect' | 'finalIncorrect' = 'incorrect';
    let questionAttemptResolvedCurrentTurn = false;

    if (!selectedOptionObject || !correctOptionObject) {
        console.error("Error: Opción seleccionada o correcta no encontrada.", {selectedOptionId, correctOptionId: currentQuestion.correctOptionId, options: currentQuestion.options});
        setFeedback({type: 'info', message: "Error al procesar la respuesta. Intentá de nuevo."});
        setIsSubmitting(false);
        return;
    }

    if (isCorrect) {
      pointsEarnedThisTurn = attemptsForThisTurn === 1 ? pointsPerCorrectAnswer : (pointsPerSecondAttempt || 0);
      setScore(prevScore => prevScore + pointsEarnedThisTurn);
      setQuestionIsResolved(true);
      questionAttemptResolvedCurrentTurn = true;
      feedbackType = 'correct';
      feedbackMessage = `¡Correcto! ${selectedOptionObject.explanation || ''} Ganaste +${pointsEarnedThisTurn} puntos.`;
    } else { 
      if (attemptsForThisTurn === 1) { 
        setCurrentQuestionAttempts(1);
        setFirstAttemptIncorrectOptionId(selectedOptionId);
        feedbackType = 'incorrect';
        feedbackMessage = `Respuesta incorrecta. ${selectedOptionObject.explanation || ''} ¡Intentá de nuevo!`;
        
        setFeedback({type: feedbackType, message: feedbackMessage});
        // Important: setSelectedOptionId(null) will be called after a timeout if we want to clear selection for 2nd attempt
        // For now, let's not clear it to keep the incorrect selection visible until the user explicitly changes it or confirms.
        setTimeout(() => {
          if (currentQuestionAttempts === 1 && !questionIsResolved) { // Check if still in 2nd attempt mode
             setFeedback(null); // Clear temporary feedback
             setSelectedOptionId(null); // Force user to re-select for 2nd chance
          }
          setIsSubmitting(false); 
        }, 1500); 
        return; // Early return, don't set questionIsResolved yet
      } else { // This is the second (and final) incorrect attempt
        setQuestionIsResolved(true);
        questionAttemptResolvedCurrentTurn = true;
        feedbackType = 'finalIncorrect';
        feedbackMessage = `Incorrecto. ${selectedOptionObject.explanation || ''} <br/>La respuesta correcta era "${correctOptionObject.text}". <br/>Explicación: ${correctOptionObject.explanation || ''}`;
      }
    }
    
    setFeedback({type: feedbackType, message: feedbackMessage});
    
    if (questionAttemptResolvedCurrentTurn) {
      setQuizSessionData(prevData => [
        ...prevData,
        {
          questionId: currentQuestion.id, questionText: currentQuestion.questionText,
          selectedOptionId: selectedOptionId, selectedOptionText: selectedOptionObject?.text || '',
          correctOptionId: currentQuestion.correctOptionId, correctOptionText: correctOptionObject?.text || '',
          isCorrect: isCorrect, attempts: attemptsForThisTurn
        }
      ]);
    }
    
    setIsSubmitting(false); 
  };

  const handleRepeatPractice = () => {
    // Re-process originalQuestions to get a fresh shuffle
    if (originalQuestions && originalQuestions.length > 0) {
      const reProcessedQs: ProcessedQuestion[] = originalQuestions.map((origQ, questionIndex) => {
        const baseQuestionId = origQ.id || `q${questionIndex}`;
        let derivedCorrectOptionId = '';
        const optionsWithIds: ProcessedQuestionOption[] = origQ.options.map((apiOpt, optionIndex) => {
          const labelPart = typeof apiOpt.label === 'string' ? apiOpt.label : String(optionIndex);
          const currentOptionId = `${baseQuestionId}-opt${labelPart}`;
          if (optionIndex === 0) { derivedCorrectOptionId = currentOptionId; }
          return { id: currentOptionId, text: apiOpt.text, explanation: apiOpt.explanation, originalLabel: labelPart };
        });
        const shuffledProcessedOptions = shuffleArray(optionsWithIds);
        return { id: baseQuestionId, questionText: origQ.question, options: shuffledProcessedOptions, correctOptionId: derivedCorrectOptionId };
      });
      setShuffledQuestions(reProcessedQs);
    }
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);
    setQuizSessionData([]);
    // resetQuestionState() will be called by useEffect on currentQuestionIndex change
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
                    disabled={isSubmitting || !currentQuestion?.questionText}
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
                    disabled={!questionIsResolved || isTranslating || isSubmitting || !currentQuestion?.questionText} 
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

          <Card className="bg-card border border-border"> {/* Changed from bg-secondary/30 */}
            <CardHeader>
              <CardTitle className="text-xl text-center">
                {/* CRITICAL FIX: Accessing questionText */}
                {currentQuestion.questionText || "[Texto de pregunta no disponible]"}
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

          {feedback && !isTranslating && !isSubmitting && ( 
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
              <span className="leading-snug" dangerouslySetInnerHTML={{ __html: feedback.message.replace(/\n/g, "<br />") }}></span>
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
            {isSubmitting && !questionIsResolved ? <Loader2 className="animate-spin mr-2" /> : null}
            {getButtonText()}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

