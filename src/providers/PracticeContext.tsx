// src/providers/PracticeContext.tsx
"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import axios, { AxiosError } from 'axios';
import type { Question as AppQuestionType } from '@/types';

// Types from backend (ensure these match your backend's actual response structure)
interface ApiPracticeQuestionOption {
  label: "A" | "B" | "C";
  text: string;
  explanation: string;
}
interface ApiPracticeQuestion {
  id?: string;
  question: string;
  options: ApiPracticeQuestionOption[];
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

const PracticeContext = createContext<PracticeContextType | undefined>(undefined);

export const PracticeProvider = ({ children }: { children: ReactNode }) => {
  const [practiceQuestions, setPracticeQuestions] = useState<AppQuestionType[]>([]);
  const [isLoadingPractice, setIsLoadingPractice] = useState<boolean>(false);
  const [practiceError, setPracticeError] = useState<string | null>(null);

  const getPracticeSettingsFromStorage = useCallback((): PracticeSettings | null => {
    try {
      const savedSettingsRaw = localStorage.getItem(LOCAL_STORAGE_PRACTICE_SETTINGS_KEY);
      if (savedSettingsRaw) {
        const savedSettings = JSON.parse(savedSettingsRaw);
        // Basic validation, could be improved with Zod or similar
        if (savedSettings.language && savedSettings.level && savedSettings.topic && savedSettings.numQuestions && savedSettings.questionType) {
          return savedSettings as PracticeSettings;
        }
      }
    } catch (e) {
      console.warn("Could not parse saved practice settings from localStorage", e);
    }
    return null;
  }, []);

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

      if (response.data.source === 'error' || !response.data.questions) {
        setPracticeError(response.data.message || 'Error desconocido al generar preguntas desde el backend.');
        setPracticeQuestions([]);
        return;
      }

      const transformedQuestions: AppQuestionType[] = response.data.questions.map((apiQ: ApiPracticeQuestion, qIndex: number) => {
        const questionId = apiQ.id || `genQ${qIndex}-${Date.now()}`;
        let correctOptionGeneratedId = '';

        const optionsWithIdsAndOriginalLabel: { id: string; text: string; explanation: string; originalLabel: string; isCorrect?: boolean }[] = apiQ.options.map((apiOpt, optIndex) => {
          const currentOptionId = `${questionId}-opt${apiOpt.label}`;
          if (optIndex === 0) { // Assuming first option is correct as per backend mock
            correctOptionGeneratedId = currentOptionId;
          }
          return {
            id: currentOptionId,
            text: apiOpt.text,
            explanation: apiOpt.explanation,
            originalLabel: apiOpt.label,
            isCorrect: optIndex === 0 // Mark correct for AppQuestionType
          };
        });
        
        // Transform to AppQuestionType structure
        return {
          id: questionId,
          question: apiQ.question,
          options: optionsWithIdsAndOriginalLabel.map(opt => ({ // Map to ApiQuestionOption for AppQuestionType
            label: opt.originalLabel,
            text: opt.text,
            explanation: opt.explanation,
            // isCorrect: opt.isCorrect, // This field might not be directly on AppQuestionType options
          })),
          // correctOptionId: correctOptionGeneratedId, // Not directly on AppQuestionType
          // translation: apiQ.translation, // If backend provides it
          // type: apiQ.type, // If backend provides it
        };
      });

      setPracticeQuestions(transformedQuestions);
      if (response.data.source === 'mock') {
        console.warn('PracticeContext: BEWARE - Backend returned mock data. Mistral API might have failed or is not configured.');
      }
    } catch (error) {
      console.error("PracticeContext: Error fetching practice questions:", error);
      let errorMessage = 'No se pudieron cargar las preguntas de práctica. ';
      if (axios.isAxiosError(error)) {
        if (error.response) {
          errorMessage += `Error del backend: ${error.response.status} - ${error.response.data?.message || 'Respuesta no detallada.'}`;
        } else if (error.request) {
          errorMessage += 'Error de red. Asegúrate que el backend esté corriendo en http://localhost:3001 y accesible.';
        } else {
          errorMessage += `Error de Axios: ${error.message}`;
        }
      } else if (error instanceof Error) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Ocurrió un error inesperado.';
      }
      setPracticeError(errorMessage);
      setPracticeQuestions([]);
    } finally {
      setIsLoadingPractice(false);
    }
  }, []);

  const clearPracticeError = useCallback(() => {
    setPracticeError(null);
  }, []);

  // Load default settings into storage if not present (e.g., on first app load after login)
  useEffect(() => {
    const existingSettings = getPracticeSettingsFromStorage();
    if (!existingSettings) {
      localStorage.setItem(LOCAL_STORAGE_PRACTICE_SETTINGS_KEY, JSON.stringify(defaultPracticeSettings));
      console.log("PracticeContext: Initialized default practice settings in localStorage.");
      // Optionally, load questions with these default settings immediately if desired,
      // but current logic loads them after login.
      // loadPracticeQuestions(defaultPracticeSettings); 
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
