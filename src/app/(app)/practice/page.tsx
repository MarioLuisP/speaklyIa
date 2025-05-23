
"use client";

import React from 'react';
import { NewQuizComponent } from '@/components/game/NewQuizComponent'; 
import type { Question } from '@/types'; // Question type now expects "question" for question text
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from '@/hooks/use-toast';
import { POINTS_PER_PRACTICE_CORRECT_ANSWER, POINTS_PER_PRACTICE_SECOND_ATTEMPT } from '@/lib/constants';
import { UserProgressHeader } from '@/components/layout/UserProgressHeader';

// mockApiPracticeQuestions (antes generalPracticeQuestions)
const mockApiPracticeQuestions: Question[] = [
  {
    question: "What do plants need to grow?",
    options: [
      {
        label: "A",
        text: "Plants need water to grow.",
        explanation: "This is correct because water is essential for plant growth."
      },
      {
        label: "B",
        text: "Plants need rocks to grow.",
        explanation: "This is incorrect because rocks are not necessary for plant growth."
      },
      {
        label: "C",
        text: "Plants need toys to grow.",
        explanation: "This is incorrect because toys do not help plants grow."
      }
    ]
  },
  {
    question: "How do we get energy from the sun?",
    options: [
      {
        label: "A",
        text: "The sun gives us energy to play.",
        explanation: "This is correct because the sun provides the energy needed for activities like playing."
      },
      {
        label: "B",
        text: "The sun gives us energy to sleep.",
        explanation: "This is incorrect because the sun does not provide energy for sleeping."
      },
      {
        label: "C",
        text: "The sun gives us energy to eat.",
        explanation: "This is incorrect because the sun does not provide energy for eating."
      }
    ]
  },
  {
    question: "What is the state of water in the hearth?",
    options: [
      {
        label: "A",
        text: "Water in the hearth is hot.",
        explanation: "This is correct because the hearth is a source of heat."
      },
      {
        label: "B",
        text: "Water in the hearth is cold.",
        explanation: "This is incorrect because the hearth is a source of heat, not cold."
      },
      {
        label: "C",
        text: "Water in the hearth is frozen.",
        explanation: "This is incorrect because the hearth is a source of heat, not cold."
      }
    ]
  },
  {
    question: "What is the vision of a fany?",
    options: [
      {
        label: "A",
        text: "A fany has good vision.",
        explanation: "This is correct because fany is a type of cat, and cats have good vision."
      },
      {
        label: "B",
        text: "A fany has bad vision.",
        explanation: "This is incorrect because fany cats have good vision."
      },
      {
        label: "C",
        text: "A fany has no vision.",
        explanation: "This is incorrect because fany cats can see."
      }
    ]
  },
  {
    question: "What is crypto made from?",
    options: [
      {
        label: "A",
        text: "Crypto is made from metal.",
        explanation: "This is correct because crypto coins are often made from metal."
      },
      {
        label: "B",
        text: "Crypto is made from wood.",
        explanation: "This is incorrect because crypto coins are not made from wood."
      },
      {
        label: "C",
        text: "Crypto is made from paper.",
        explanation: "This is incorrect because crypto coins are not made from paper."
      }
    ]
  },
  {
    question: "What do we need to see the sun?",
    options: [
      {
        label: "A",
        text: "We need clear skies to see the sun.",
        explanation: "This is correct because clear skies allow us to see the sun."
      },
      {
        label: "B",
        text: "We need dark skies to see the sun.",
        explanation: "This is incorrect because dark skies do not allow us to see the sun."
      },
      {
        label: "C",
        text: "We need rain to see the sun.",
        explanation: "This is incorrect because rain does not allow us to see the sun."
      }
    ]
  },
  {
    question: "What is the sun made of?",
    options: [
      {
        label: "A",
        text: "The sun is made of hot gas.",
        explanation: "This is correct because the sun is primarily composed of hot gas."
      },
      {
        label: "B",
        text: "The sun is made of ice.",
        explanation: "This is incorrect because the sun is not made of ice."
      },
      {
        label: "C",
        text: "The sun is made of rock.",
        explanation: "This is incorrect because the sun is not made of rock."
      }
    ]
  },
  {
    question: "What do we use to play in the water?",
    options: [
      {
        label: "A",
        text: "We use toys to play in the water.",
        explanation: "This is correct because toys are commonly used for playing in the water."
      },
      {
        label: "B",
        text: "We use books to play in the water.",
        explanation: "This is incorrect because books are not used for playing in the water."
      },
      {
        label: "C",
        text: "We use shoes to play in the water.",
        explanation: "This is incorrect because shoes are not typically used for playing in the water."
      }
    ]
  },
  {
    question: "What is the energy from the sun called?",
    options: [
      {
        label: "A",
        text: "The energy from the sun is called solar energy.",
        explanation: "This is correct because solar energy comes from the sun."
      },
      {
        label: "B",
        text: "The energy from the sun is called wind energy.",
        explanation: "This is incorrect because wind energy comes from the wind, not the sun."
      },
      {
        label: "C",
        text: "The energy from the sun is called water energy.",
        explanation: "This is incorrect because water energy comes from water, not the sun."
      }
    ]
  },
  {
    question: "What do we need to see clearly?",
    options: [
      {
        label: "A",
        text: "We need good vision to see clearly.",
        explanation: "This is correct because good vision is necessary for clear sight."
      },
      {
        label: "B",
        text: "We need bad vision to see clearly.",
        explanation: "This is incorrect because bad vision does not allow for clear sight."
      },
      {
        label: "C",
        text: "We need no vision to see clearly.",
        explanation: "This is incorrect because vision is required to see clearly."
      }
    ]
  }
];

// Updated recommendedPracticeQuestions structure
const recommendedPracticeQuestions: Question[] = [
  {
    id: 'rec_ebullient',
    question: 'Ebullient', // Changed 'text' to 'question'
    type: 'vocabulary',
    options: [
      { label: 'B', text: 'Cheerful and full of energy', explanation: '"Ebullient" means overflowing with fervor, enthusiasm, or excitement.' }, // Correct option listed first
      { label: 'A', text: 'Quiet and reserved', explanation: 'This is not the meaning of Ebullient.' },
      { label: 'C', text: 'Sad and lonely', explanation: 'This is not the meaning of Ebullient.' }
    ],
    translation: 'Entusiasta / Vivaz',
    // Removed top-level explanation, it's now in the correct option
  },
  {
    id: 'rec_ephemeral',
    question: 'Ephemeral', // Changed 'text' to 'question'
    type: 'vocabulary',
    options: [
      { label: 'B', text: 'Lasting for a very short time', explanation: '"Ephemeral" describes something that is transient or quickly fading.' }, // Correct option listed first
      { label: 'A', text: 'Long-lasting', explanation: 'This is not the meaning of Ephemeral.' },
      { label: 'C', text: 'Very important', explanation: 'This is not the meaning of Ephemeral.' }
    ],
    translation: 'Efímero',
  },
  {
    id: 'rec_serendipity',
    question: 'Serendipity', // Changed 'text' to 'question'
    type: 'vocabulary',
    options: [
      { label: 'B', text: 'The occurrence of events by chance in a happy or beneficial way', explanation: '"Serendipity" is finding valuable or agreeable things not sought for.' }, // Correct option listed first
      { label: 'A', text: 'A planned discovery', explanation: 'This is not the meaning of Serendipity.' },
      { label: 'C', text: 'A type of fruit', explanation: 'This is not the meaning of Serendipity.' }
    ],
    translation: 'Serendipia',
  }
];

// Mock data for the header in practice page
const practicePageMockHeaderData = {
  userName: 'Laura',
  xp: 590, 
  displayLevel: "NIVEL 1",
  dailyLessonProgressPercentage: 45, 
  levelUpMessage: "¡Concentrate y sumá más puntos en tu práctica!",
  dailyLessonProgressLabel: "45% para completar tu lección del día",
};

export default function PracticePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const source = searchParams.get('source');

  let currentQuestions = mockApiPracticeQuestions; // Default to general questions
  let quizTitle = "Práctica Diaria";

  if (source === 'recommendations') {
    currentQuestions = recommendedPracticeQuestions.length > 0 ? recommendedPracticeQuestions : mockApiPracticeQuestions;
    quizTitle = recommendedPracticeQuestions.length > 0 ? "Práctica de Palabras Recomendadas" : "Práctica Diaria (Recomendadas no disponibles)";
  }

  const handlePracticeComplete = (score: number, sessionData?: any[]) => { 
    console.log("Practice complete, score:", score, "Session Data:", sessionData);
    toast({
      title: "¡Práctica Completada!",
      description: `Has ganado ${score} puntos de XP. ¡Seguí así!`,
      variant: "default", 
    });
    // Optionally, you could send sessionData to an AI flow for analysis here if needed in the future
  };

  return (
    <div className="container mx-auto p-4 space-y-0"> 
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
        showExplanations={true} // NewQuizComponent now handles explanations internally
      />
    </div>
  );
}

