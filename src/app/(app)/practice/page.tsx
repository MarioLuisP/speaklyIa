"use client";

import React, { useState } from 'react';
import { QuizComponent } from '@/components/game/QuizComponent';
import type { Question } from '@/types';
import { useRouter } //, useSearchParams  // Uncomment if using query params
from 'next/navigation';
import { toast } from '@/hooks/use-toast'; // Shadcn Toaster

// Mock questions for Practice
const practiceQuestions: Question[] = [
  { id: 'pq1', type: 'vocabulary', text: 'Translate "apple" to Spanish:', options: [{ text: 'Pera', isCorrect: false }, { text: 'Manzana', isCorrect: true }, { text: 'Naranja', isCorrect: false }], translation: 'Manzana', explanation: '"Apple" is "Manzana" in Spanish.' },
  { id: 'pq2', type: 'vocabulary', text: 'What is "dog" in Spanish?', options: [{ text: 'Gato', isCorrect: false }, { text: 'Perro', isCorrect: true }, { text: 'Pájaro', isCorrect: false }], translation: 'Perro', explanation: '"Dog" is "Perro".' },
  { id: 'pq3', type: 'grammar', text: 'Choose the correct sentence: "They ___ happy."', options: [{ text: 'is', isCorrect: false }, { text: 'are', isCorrect: true }, { text: 'am', isCorrect: false }], explanation: '"They" is plural, so use "are".' },
  { id: 'pq4', type: 'vocabulary', text: 'The opposite of "hot" is:', options: [{ text: 'Warm', isCorrect: false }, { text: 'Cold', isCorrect: true }, { text: 'Spicy', isCorrect: false }], translation: 'Frío', explanation: '"Cold" is the opposite of "hot".' },
  { id: 'pq5', type: 'grammar', text: '"I ___ English."', options: [{ text: 'speak', isCorrect: true }, { text: 'speaks', isCorrect: false }, { text: 'spoke', isCorrect: false }], explanation: 'For "I", use the base form of the verb in present simple.' },
  { id: 'pq6', type: 'vocabulary', text: 'A place where you borrow books:', options: [{ text: 'Bookstore', isCorrect: false }, { text: 'Library', isCorrect: true }, { text: 'Cinema', isCorrect: false }], translation: 'Biblioteca', explanation: 'A library is where you borrow books.' },
  { id: 'pq7', type: 'grammar', text: 'She is ___ than her brother.', options: [{ text: 'tall', isCorrect: false }, { text: 'taller', isCorrect: true }, { text: 'tallest', isCorrect: false }], explanation: 'Use the comparative form "taller" for two items.' },
  { id: 'pq8', type: 'vocabulary', text: 'What color is the sky on a sunny day?', options: [{ text: 'Green', isCorrect: false }, { text: 'Blue', isCorrect: true }, { text: 'Red', isCorrect: false }], translation: 'Azul', explanation: 'The sky is typically blue on a sunny day.' },
  { id: 'pq9', type: 'grammar', text: 'He ___ to music right now.', options: [{ text: 'listen', isCorrect: false }, { text: 'is listening', isCorrect: true }, { text: 'listened', isCorrect: false }], explanation: 'Present continuous for actions happening now.' },
  { id: 'pq10', type: 'vocabulary', text: 'A vehicle with two wheels:', options: [{ text: 'Car', isCorrect: false }, { text: 'Bicycle', isCorrect: true }, { text: 'Bus', isCorrect: false }], translation: 'Bicicleta', explanation: 'A bicycle has two wheels.' },
];

export default function PracticePage() {
  const router = useRouter();
  // const searchParams = useSearchParams(); // Example: const source = searchParams.get('source');

  const handlePracticeComplete = (score: number) => {
    console.log("Practice complete, score:", score);
    // Here you would typically update user's XP and other stats
    // For example: updateUserXP(score);
    toast({
      title: "¡Práctica Completada!",
      description: `Has ganado ${score} puntos de XP. ¡Seguí así!`,
      variant: "default", // Or use "success" if you add that variant
    });
    // Potentially navigate or show a summary specific to practice
  };

  // TODO: Fetch questions based on user level or 'source' param if available
  // For now, using mock questions.
  const currentQuestions = practiceQuestions;

  return (
    <QuizComponent
      questions={currentQuestions}
      quizTitle="Práctica Diaria"
      mode="practice"
      onQuizComplete={handlePracticeComplete}
    />
  );
}
