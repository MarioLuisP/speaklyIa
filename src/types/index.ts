// src/types/index.ts

export interface ApiQuestionOption {
  label: string; // 'A', 'B', 'C'
  text: string;
  explanation: string;
}

export interface Question {
  id?: string;
  question: string; // El texto de la pregunta como viene en el JSON
  options: ApiQuestionOption[];
  type?: 'vocabulary' | 'grammar';
  translation?: string; // Para preguntas de vocabulario en Test de Nivel.
}


export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  userLevel: 'Novato' | 'Intermedio' | 'Experto'; // Changed from 'level'
  score: number; // Changed from 'xp'
  wordsLearned: number;
  consecutiveDays: number;
  currentVocabularyLevel: string; // Kept for daily recommendations logic
  learningGoals: string; // Kept for daily recommendations logic
  dataAihint?: string;
  dailyLessonTarget?: number; // Kept for UI display
  dailyLessonProgress?: number; // Kept for UI display
  tematic?: 'Negocios' | 'Viajes' | 'Tecnología' | 'Vida Diaria' | string; // Added tematic
  lastLogin?: string; // Added lastLogin (ISO date string)
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string;
  xp: number; // Kept as xp for leaderboard for now, can be changed to score
  level: 'Novato' | 'Intermedio' | 'Experto';
  dataAihint?: string;
}
