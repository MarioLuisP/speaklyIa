
"use client";

import React from 'react';
import { NewQuizComponent } from '@/components/game/NewQuizComponent'; 
import type { Question } from '@/types';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { POINTS_PER_PRACTICE_CORRECT_ANSWER, POINTS_PER_PRACTICE_SECOND_ATTEMPT } from '@/lib/constants';
import { UserProgressHeader } from '@/components/layout/UserProgressHeader';

const generalPracticeQuestions: Question[] = [
  { 
    id: 'pq1', type: 'vocabulary', text: 'What do plants need from the sun to grow properly?', 
    options: [
      {id:'o1', text: 'Plants need sunlight to grow healthy and strong.'},
      {id:'o2', text: 'Plants need darkness to grow healthy and strong.'},
      {id:'o3', text: 'Plants need music to grow healthy and strong.'}
    ], 
    correctOptionId: 'o1', explanation: 'Plants use sunlight to make food and grow.'
  },
  { 
    id: 'pq2', type: 'vocabulary', text: 'Where do children usually play with water in summer?', 
    options: [
      {id:'o1', text: 'Children usually play with water in a pool.'},
      {id:'o2', text: 'Children usually play with water in a library.'},
      {id:'o3', text: 'Children usually play with water in a classroom.'}
    ], 
    correctOptionId: 'o1', explanation: 'Pools are common places for water play.'
  },
  { 
    id: 'pq3', type: 'vocabulary', text: 'What do we call the energy from the sun?', 
    options: [
      {id:'o1', text: 'We call the energy from the sun solar energy.'},
      {id:'o2', text: 'We call the energy from the sun wind energy.'},
      {id:'o3', text: 'We call the energy from the sun water energy.'}
    ], 
    correctOptionId: 'o1', explanation: 'Solar energy comes from the sun.'
  },
  { 
    id: 'pq4', type: 'vocabulary', text: 'What do we use to play music on a device?', 
    options: [
      {id:'o1', text: 'We use speakers to play music on a device.'},
      {id:'o2', text: 'We use a microwave to play music on a device.'},
      {id:'o3', text: 'We use a refrigerator to play music on a device.'}
    ], 
    correctOptionId: 'o1', explanation: 'Speakers produce sound for music.'
  },
  { 
    id: 'pq5', type: 'vocabulary', text: 'What do seeds need to grow into plants?', 
    options: [
      {id:'o1', text: 'Seeds need water to grow into plants.'},
      {id:'o2', text: 'Seeds need darkness to grow into plants.'},
      {id:'o3', text: 'Seeds need silence to grow into plants.'}
    ], 
    correctOptionId: 'o1', explanation: 'Water helps seeds grow into plants.'
  },
  { 
    id: 'pq6', type: 'vocabulary', text: 'What do dogs use to smell things around them?', 
    options: [
      {id:'o1', text: 'Dogs use their noses to smell things around them.'},
      {id:'o2', text: 'Dogs use their ears to smell things around them.'},
      {id:'o3', text: 'Dogs use their tails to smell things around them.'}
    ], 
    correctOptionId: 'o1', explanation: 'Noses are used by dogs to smell.'
  },
  { 
    id: 'pq7', type: 'vocabulary', text: 'Where do people usually play football with their friends?', 
    options: [
      {id:'o1', text: 'People usually play football in a field or park.'},
      {id:'o2', text: 'People usually play football in a swimming pool.'},
      {id:'o3', text: 'People usually play football in a library.'}
    ], 
    correctOptionId: 'o1', explanation: 'Fields or parks are common for football.'
  },
  { 
    id: 'pq8', type: 'vocabulary', text: 'What do we study in science to learn about nature?', 
    options: [
      {id:'o1', text: 'We study plants and animals in science to learn about nature.'},
      {id:'o2', text: 'We study mathematics in science to learn about nature.'},
      {id:'o3', text: 'We study history in science to learn about nature.'}
    ], 
    correctOptionId: 'o1', explanation: 'Science includes studying plants and animals.'
  },
  { 
    id: 'pq9', type: 'vocabulary', text: 'What do we use a computer for at school?', 
    options: [
      {id:'o1', text: 'We use a computer for learning and doing homework.'},
      {id:'o2', text: 'We use a computer for cooking food at school.'},
      {id:'o3', text: 'We use a computer for playing outside at school.'}
    ], 
    correctOptionId: 'o1', explanation: 'Computers help with learning and homework.'
  },
  { 
    id: 'pq10', type: 'vocabulary', text: 'What do we call something very fancy and decorative?', 
    options: [
      {id:'o1', text: 'We call something very fancy and decorative ornate.'},
      {id:'o2', text: 'We call something very fancy and decorative simple.'},
      {id:'o3', text: 'We call something very fancy and decorative plain.'}
    ], 
    correctOptionId: 'o1', explanation: 'Ornate means fancy and decorative.'
  },
];

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

// Mock data for the header in practice page
const practicePageMockHeaderData = {
  userName: 'Laura',
  xp: 590, 
  displayLevel: "NIVEL 1",
  dailyLessonProgressPercentage: 45, // Example, could be dynamic later
  levelUpMessage: "¡Concentrate y sumá más puntos en tu práctica!",
  dailyLessonProgressLabel: "45% para completar tu lección del día",
};

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source');

  let currentQuestions = generalPracticeQuestions;
  let quizTitle = "Práctica Diaria";

  if (source === 'recommendations') {
    currentQuestions = recommendedPracticeQuestions.length > 0 ? recommendedPracticeQuestions : generalPracticeQuestions;
    quizTitle = recommendedPracticeQuestions.length > 0 ? "Práctica de Palabras Recomendadas" : "Práctica Diaria (Recomendadas no disponibles)";
  }

  const handlePracticeComplete = (score: number, sessionData?: any[]) => { 
    console.log("Practice complete, score:", score, "Session Data:", sessionData);
    toast({
      title: "¡Práctica Completada!",
      description: `Has ganado ${score} puntos de XP. ¡Seguí así!`,
      variant: "default", 
    });
  };

  return (
    <div className="container mx-auto p-4 space-y-0"> {/* Reduced space-y to 0 or a small value like 2 */}
      <UserProgressHeader
        userName={practicePageMockHeaderData.userName}
        xp={practicePageMockHeaderData.xp}
        displayLevel={practicePageMockHeaderData.displayLevel}
        levelUpMessage={practicePageMockHeaderData.levelUpMessage}
        dailyLessonProgressPercentage={practicePageMockHeaderData.dailyLessonProgressPercentage}
        dailyLessonProgressLabel={practicePageMockHeaderData.dailyLessonProgressLabel}
      />
      <NewQuizComponent
        questions={currentQuestions}
        quizTitle={quizTitle}
        pointsPerCorrectAnswer={POINTS_PER_PRACTICE_CORRECT_ANSWER}
        pointsPerSecondAttempt={POINTS_PER_PRACTICE_SECOND_ATTEMPT}
        onQuizComplete={handlePracticeComplete}
        showExplanations={true}
      />
    </div>
  );
}
