export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  level: 'Novato' | 'Intermedio' | 'Experto';
  xp: number;
  wordsLearned: number;
  consecutiveDays: number;
  currentVocabularyLevel: string; // For AI suggestions, e.g., "Novice", "Intermediate"
  learningGoals: string; // For AI suggestions
}

export interface Question {
  id: string;
  type: 'vocabulary' | 'grammar'; // Example types
  text: string; // e.g., "What is the meaning of 'ubiquitous'?" or "Choose the correct form: ..."
  options: { text: string; isCorrect: boolean }[];
  translation?: string; // For vocabulary questions
  explanation?: string; // For grammar or why an answer is correct/incorrect
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string;
  xp: number;
  level: 'Novato' | 'Intermedio' | 'Experto';
}
