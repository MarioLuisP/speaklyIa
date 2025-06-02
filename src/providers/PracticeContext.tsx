
// src/providers/PracticeContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import type { Question as AppQuestionType, ApiQuestionOption as AppApiQuestionOption } from '@/types';

// Types from backend (ensure these match your backend's actual response structure)
interface ApiPracticeQuestion {
  id?: string;
  question: string;
  options: AppApiQuestionOption[]; // Using AppApiQuestionOption from global types
}
interface GenerateQuestionsResponse {
  source: 'api' | 'mock' | 'error';
  questions: ApiPracticeQuestion[];
  keywordData?: any[];
  message?: string;
}

interface PracticeContextType {
  practiceQuestions: AppQuestionType[];
  isLoadingPractice: boolean;
  practiceError: string | null;
  loadPracticeQuestions: (settings: PracticeSettings) => Promise<void>;
  clearPracticeError: () => void;
  getPracticeSettingsFromStorage: () => PracticeSettings | null;
}

export interface PracticeSettings {
  language: string;
  level: 'beginner' | 'intermediate' | 'advanced' | string;
  topic: string;
  numQuestions: number;
  questionType: 'multiple-choice' | 'meaning' | 'fill_blank' | 'mix' | string;
}

const BACKEND_URL = 'http://localhost:3001/api/practice/generate-questions';
const LOCAL_STORAGE_PRACTICE_SETTINGS_KEY = 'speaklyai_practice_settings_v2';

const defaultPracticeSettings: PracticeSettings = {
  language: "english",
  level: "beginner",
  topic: "travel",
  numQuestions: 10,
  questionType: "multiple-choice",
};

// Frontend Mock Questions for Fallback
const frontendMockPracticeQuestions: AppQuestionType[] = [
  {
    id: 'mock_q1_local',
    question: "This is a local fallback question: What is the capital of France?",
    options: [
      { label: "A", text: "Paris", explanation: "Paris is the capital of France." },
      { label: "B", text: "London", explanation: "London is the capital of the UK." },
      { label: "C", text: "Berlin", explanation: "Berlin is the capital of Germany." }
    ],
    type: 'vocabulary', // Example type
  },
  {
    id: 'mock_q2_local',
    question: "Local fallback: Which planet is known as the Red Planet?",
    options: [
      { label: "A", text: "Mars", explanation: "Mars is known as the Red Planet." },
      { label: "B", text: "Jupiter", explanation: "Jupiter is the largest planet." },
      { label: "C", text: "Venus", explanation: "Venus is the second planet from the Sun." }
    ],
    type: 'vocabulary',
  }
];


const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const PracticeProvider = ({ children }: { children: ReactNode }) => {
  const [practiceQuestions, setPracticeQuestions] = useState<AppQuestionType[]>([]);
  const [isLoadingPractice, setIsLoadingPractice] = useState<boolean>(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  const getPracticeSettingsFromStorage = useCallback((): PracticeSettings | null => {
    if (typeof window === 'undefined') return null; // Guard against SSR
    try {
      const savedSettingsRaw = localStorage.getItem(LOCAL_STORAGE_PRACTICE_SETTINGS_KEY);
      if (savedSettingsRaw) {
        const savedSettings = JSON.parse(savedSettingsRaw);
        if (savedSettings.language && savedSettings.level && savedSettings.topic && savedSettings.numQuestions && savedSettings.questionType) {
          return savedSettings as PracticeSettings;
        }
      }
    } catch (e) {
      console.warn("Could not parse saved practice settings from localStorage", e);
    }
    return null;
  }, []);

  const transformApiQuestionsToAppQuestions = (apiQuestions: ApiPracticeQuestion[]): AppQuestionType[] => {
    return apiQuestions.map((apiQ: ApiPracticeQuestion, qIndex: number) => {
      const questionId = apiQ.id || `genQ${qIndex}-${Date.now()}`;
      // Backend provides options with label, text, explanation.
      // The first option from backend is assumed correct for mock generation.
      // AppQuestionType.options mirrors this structure.
      return {
        id: questionId,
        question: apiQ.question,
        options: apiQ.options.map(opt => ({
          label: opt.label, // 'A', 'B', 'C'
          text: opt.text,
          explanation: opt.explanation,
        })),
        // type and translation would need to come from backend if desired
      };
    });
  };

  const loadPracticeQuestions = useCallback(async (settings: PracticeSettings) => {
    setIsLoadingPractice(true);
    setPracticeError(null);
    console.log('PracticeContext: Loading questions with settings:', settings);

    const payload = {
      language: settings.language,
      level: settings.level,
      topic: settings.topic,
      questionCount: settings.numQuestions,
      questionType: settings.questionType,
    };

    try {
      const response = await axios.post<GenerateQuestionsResponse>(BACKEND_URL, payload);
      console.log('PracticeContext: Received response from backend:', response.data);

      if (response.data.source === 'error' || !response.data.questions || response.data.questions.length === 0) {
        const errorMsg = response.data.message || 'Error desconocido al generar preguntas desde el backend o no se recibieron preguntas.';
        console.warn("PracticeContext: Backend indicated error or returned no questions. Falling back to local mocks.", errorMsg);
        setPracticeQuestions(frontendMockPracticeQuestions);
        setPracticeError(`El servicio de preguntas no está disponible o no generó preguntas. Usando preguntas de ejemplo. Detalle: ${errorMsg}`);
        return;
      }
      
      const transformedQuestions = transformApiQuestionsToAppQuestions(response.data.questions);
      setPracticeQuestions(transformedQuestions);

      if (response.data.source === 'mock') {
        console.warn('PracticeContext: BEWARE - Backend returned mock data. Mistral API might have failed or is not configured.');
        setPracticeError("Se están usando preguntas de ejemplo del backend ya que el servicio principal de IA podría no estar disponible.");
      }

    } catch (error) {
      console.error("PracticeContext: Error fetching practice questions:", error);
      let errorMessage = 'No se pudieron cargar las preguntas de práctica. ';
      let useFallback = false;

      if (axios.isAxiosError(error)) {
        if (error.response) {
          // Error from backend (e.g., 500, 400)
          errorMessage += `Error del backend: ${error.response.status} - ${error.response.data?.message || 'Respuesta no detallada.'}`;
        } else if (error.request) {
          // Network error (backend unreachable)
          errorMessage += 'Error de red. No se pudo conectar con el servidor de preguntas. Usando preguntas de ejemplo.';
          useFallback = true;
        } else {
          errorMessage += `Error de Axios: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Ocurrió un error inesperado.';
      }
      
      setPracticeError(errorMessage);
      if (useFallback) {
        setPracticeQuestions(frontendMockPracticeQuestions);
        console.log("PracticeContext: Loaded local mock questions due to network error.");
      } else {
        setPracticeQuestions([]); // Clear questions if it's not a network error where fallback is used
      }
    } finally {
      setIsLoadingPractice(false);
    }
  }, []);

  const clearPracticeError = useCallback(() => {
    setPracticeError(null);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const existingSettings = getPracticeSettingsFromStorage();
    if (!existingSettings) {
      localStorage.setItem(LOCAL_STORAGE_PRACTICE_SETTINGS_KEY, JSON.stringify(defaultPracticeSettings));
      console.log("PracticeContext: Initialized default practice settings in localStorage.");
    }
  }, [getPracticeSettingsFromStorage]);


  return (
    <PracticeContext.Provider value={{ practiceQuestions, isLoadingPractice, practiceError, loadPracticeQuestions, clearPracticeError, getPracticeSettingsFromStorage }}>
      {children}
    </PracticeContext.Provider>
  );
};

export const usePractice = (): PracticeContextType => {
  const context = useContext(PracticeContext);
  if (context === undefined) {
    throw new Error('usePractice must be used within a PracticeProvider');
  }
  return context;
};

    