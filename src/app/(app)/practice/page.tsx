
"use client";

import React from 'react';
import { NewQuizComponent } from '@/components/game/NewQuizComponent'; // Changed import
import type { Question } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { POINTS_PER_PRACTICE_CORRECT_ANSWER } from '@/lib/constants';

// Mock questions for General Practice - Updated Structure
const generalPracticeQuestions: Question[] = [
  { 
    id: 'pq1', type: 'vocabulary', text: 'Apple', 
    options: [{id:'o1', text: 'Pera'}, {id:'o2', text: 'Manzana'}, {id:'o3', text: 'Naranja'}], 
    correctOptionId: 'o2', translation: 'Manzana', explanation: '"Apple" is "Manzana" in Spanish.' 
  },
  { 
    id: 'pq2', type: 'vocabulary', text: 'Dog', 
    options: [{id:'o1', text: 'Gato'}, {id:'o2', text: 'Perro'}, {id:'o3', text: 'Pájaro'}], 
    correctOptionId: 'o2', translation: 'Perro', explanation: '"Dog" is "Perro".' 
  },
  { 
    id: 'pq3', type: 'grammar', text: 'They ___ happy.', 
    options: [{id:'o1', text: 'is'}, {id:'o2', text: 'are'}, {id:'o3', text: 'am'}], 
    correctOptionId: 'o2', explanation: '"They" is plural, so use "are".' 
  },
  { 
    id: 'pq4', type: 'vocabulary', text: 'Hot', 
    options: [{id:'o1', text: 'Warm'}, {id:'o2', text: 'Cold'}, {id:'o3', text: 'Spicy'}], 
    correctOptionId: 'o2', translation: 'Frío', explanation: '"Cold" is the opposite of "hot".' 
  },
  { 
    id: 'pq5', type: 'grammar', text: 'I ___ English.', 
    options: [{id:'o1', text: 'speak'}, {id:'o2', text: 'speaks'}, {id:'o3', text: 'spoke'}], 
    correctOptionId: 'o1', explanation: 'For "I", use the base form of the verb in present simple.' 
  },
  { 
    id: 'pq6', type: 'vocabulary', text: 'Library', 
    options: [{id:'o1', text: 'Bookstore'}, {id:'o2', text: 'Library (place to borrow books)'}, {id:'o3', text: 'Cinema'}], 
    correctOptionId: 'o2', translation: 'Biblioteca', explanation: 'A library is where you borrow books.' 
  },
  { 
    id: 'pq7', type: 'grammar', text: 'She is ___ than her brother.', 
    options: [{id:'o1', text: 'tall'}, {id:'o2', text: 'taller'}, {id:'o3', text: 'tallest'}], 
    correctOptionId: 'o2', explanation: 'Use the comparative form "taller" for two items.' 
  },
  { 
    id: 'pq8', type: 'vocabulary', text: 'Sky', 
    options: [{id:'o1', text: 'Green'}, {id:'o2', text: 'Blue'}, {id:'o3', text: 'Red'}], 
    correctOptionId: 'o2', translation: 'Azul', explanation: 'The sky is typically blue on a sunny day (related to "sky").' 
  },
  { 
    id: 'pq9', type: 'grammar', text: 'He ___ to music right now.', 
    options: [{id:'o1', text: 'listen'}, {id:'o2', text: 'is listening'}, {id:'o3', text: 'listened'}], 
    correctOptionId: 'o2', explanation: 'Present continuous for actions happening now.' 
  },
  { 
    id: 'pq10', type: 'vocabulary', text: 'Bicycle', 
    options: [{id:'o1', text: 'Car'}, {id:'o2', text: 'Bicycle (vehicle with two wheels)'}, {id:'o3', text: 'Bus'}], 
    correctOptionId: 'o2', translation: 'Bicicleta', explanation: 'A bicycle has two wheels.' 
  },
];

// Hardcoded questions for recommended words - Updated Structure
const recommendedPracticeQuestions: Question[] = [
  {
    id: 'rec_ebullient', type: 'vocabulary', text: 'Ebullient',
    options: [
      { id: 'o1', text: 'Quiet and reserved' },
      { id: 'o2', text: 'Cheerful and full of energy' },
      { id: 'o3', text: 'Sad and lonely' }
    ],
    correctOptionId: 'o2',
    translation: 'Entusiasta / Vivaz',
    explanation: '"Ebullient" means overflowing with fervor, enthusiasm, or excitement.'
  },
  {
    id: 'rec_ephemeral', type: 'vocabulary', text: 'Ephemeral',
    options: [
      { id: 'o1', text: 'Long-lasting' },
      { id: 'o2', text: 'Lasting for a very short time' },
      { id: 'o3', text: 'Very important' }
    ],
    correctOptionId: 'o2',
    translation: 'Efímero',
    explanation: '"Ephemeral" describes something that is transient or quickly fading.'
  },
  {
    id: 'rec_serendipity', type: 'vocabulary', text: 'Serendipity',
    options: [
      { id: 'o1', text: 'A planned discovery' },
      { id: 'o2', text: 'The occurrence of events by chance in a happy or beneficial way' },
      { id: 'o3', text: 'A type of fruit' }
    ],
    correctOptionId: 'o2',
    translation: 'Serendipia',
    explanation: '"Serendipity" is finding valuable or agreeable things not sought for.'
  }
];


export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source');

  let currentQuestions = generalPracticeQuestions;
  let quizTitle = "Práctica Diaria";

  if (source === 'recommendations') {
    // Make sure there are questions for recommendations, otherwise fall back
    currentQuestions = recommendedPracticeQuestions.length > 0 ? recommendedPracticeQuestions : generalPracticeQuestions;
    quizTitle = recommendedPracticeQuestions.length > 0 ? "Práctica de Palabras Recomendadas" : "Práctica Diaria (Recomendadas no disponibles)";
  }

  const handlePracticeComplete = (score: number, sessionData?: any[]) => { // sessionData is available if needed
    console.log("Practice complete, score:", score, "Session Data:", sessionData);
    // Here you would typically update user's XP and other stats
    // For example: updateUserXP(score);
    toast({
      title: "¡Práctica Completada!",
      description: `Has ganado ${score} puntos de XP. ¡Seguí así!`,
      variant: "default", 
    });
    // The NewQuizComponent already handles navigation to home or repeating practice.
    // If specific navigation is needed from here, it can be done.
    // router.push('/home'); 
  };

  return (
    <NewQuizComponent
      questions={currentQuestions}
      quizTitle={quizTitle}
      pointsPerCorrectAnswer={POINTS_PER_PRACTICE_CORRECT_ANSWER}
      onQuizComplete={handlePracticeComplete}
      showExplanations={true}
    />
  );
}
