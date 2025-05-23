
// src/types/index.ts

// Representa una opción tal como viene de la API/JSON simulado
export interface ApiQuestionOption {
  label: string; // 'A', 'B', 'C'
  text: string;
  explanation: string;
}

// Representa una pregunta tal como viene de la API/JSON simulado
export interface Question {
  id?: string; // Opcional, se puede derivar del índice si no viene de la API
  question: string; // El texto de la pregunta como viene en el JSON
  options: ApiQuestionOption[];
  type?: 'vocabulary' | 'grammar'; // Mantener por si se usa para lógica de display, aunque el JSON actual no lo incluye
  translation?: string; // Del formato anterior, podría no ser usado con el nuevo JSON
  // correctOptionId no está en la estructura original del JSON, se deriva en el componente.
  // explanation (para la pregunta en sí) no está en el nuevo JSON.
}

// Representa una opción de pregunta DESPUÉS de ser procesada por NewQuizComponent (con ID generado, etc.)
// Este tipo no necesita estar aquí si solo se usa internamente en NewQuizComponent,
// pero si se exporta (ej. para QuizSessionDataItem), podría estar aquí.
// Por ahora, la mantendremos como tipo interno en NewQuizComponent si es posible.
// export interface ProcessedQuestionOption {
//   id: string;
//   text: string;
//   explanation: string;
//   originalLabel: string;
// }


// Perfil de Usuario y Leaderboard se mantienen igual
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  level: 'Novato' | 'Intermedio' | 'Experto';
  xp: number;
  wordsLearned: number;
  consecutiveDays: number;
  currentVocabularyLevel: string;
  learningGoals: string;
  dataAihint?: string;
  dailyLessonTarget?: number;
  dailyLessonProgress?: number;
}

export interface LeaderboardUser {
  id: string;
  name: string;
  avatarUrl: string;
  xp: number;
  level: 'Novato' | 'Intermedio' | 'Experto';
  dataAihint?: string;
}
