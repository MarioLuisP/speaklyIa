export interface QuestionOption {
  id: string; // e.g., 'a', 'b', 'c'
  text: string;
}

export interface Question {
  id: string; // Unique ID for the question itself
  type: 'vocabulary' | 'grammar';
  // For vocabulary type, 'text' is the word. Component will format as "¿Qué significa '${text}'?"
  // For grammar type, 'text' is the full question sentence.
  text: string; 
  options: QuestionOption[];
  correctOptionId: string; // The 'id' of the correct QuestionOption
  translation?: string; // For vocabulary: meaning of the word. For grammar: can be a hint or correct sentence structure.
  explanation?: string; // Detailed explanation if needed, especially for grammar or complex vocab.
}

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
  dataAihint?: string;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string;
  xp: number;
  level: 'Novato' | 'Intermedio' | 'Experto';
  dataAihint?: string;
}
