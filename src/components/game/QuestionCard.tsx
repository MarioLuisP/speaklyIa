
"use client";

import type { Question } from '@/types';
import React, { useState } from 'react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean, isFirstAttempt: boolean, selectedOptionText: string, isQuestionResolved: boolean) => void;
  showTranslationButton?: boolean;
}

export function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  onAnswer,
  showTranslationButton = true,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false); // True when question is fully resolved
  const [attempts, setAttempts] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const handleOptionSelect = (optionText: string) => {
    if (isAnswered) return; // If question is already fully resolved, do nothing.

    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);
    setSelectedOption(optionText);

    const chosenOption = question.options.find(opt => opt.text === optionText);
    const isCorrect = chosenOption?.isCorrect || false;
    
    let questionResolved = false;
    if (isCorrect || currentAttempts >= 2) {
      setIsAnswered(true); // Mark as fully answered
      questionResolved = true;
      if (!isCorrect && question.translation && currentAttempts >= 2) { // Show translation if resolved, incorrect, has translation, and all attempts used
        setShowTranslation(true);
      }
    }
    onAnswer(isCorrect, currentAttempts === 1, optionText, questionResolved);
  };

  return (
    <div className="card bg-base-100 shadow-xl w-full max-w-lg mx-auto">
      <div className="card-body">
        <div className="flex justify-between items-center mb-2">
          <h2 className="card-title text-lg md:text-xl">Pregunta {questionNumber}/{totalQuestions}</h2>
          {question.translation && showTranslationButton && (
            <button 
              className="btn btn-xs btn-ghost" 
              onClick={() => setShowTranslation(!showTranslation)}
              // Disable if the question is not yet fully resolved (answered)
              disabled={!isAnswered}
            >
              {showTranslation ? 'Ocultar' : 'Traducción'}
            </button>
          )}
        </div>
        <p className="text-base-content/90 mb-4 text-lg">{question.text}</p>

        {showTranslation && question.translation && (
          <div role="alert" className="alert alert-info my-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" className="stroke-current shrink-0 w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            <span>Traducción: <strong>{question.translation}</strong></span>
          </div>
        )}

        <div className="space-y-3">
          {question.options.map((option, index) => {
            const isSelected = selectedOption === option.text;
            let buttonClass = "btn btn-outline w-full justify-start text-left normal-case";
            
            // Apply styling based on attempts and correctness
            if (isSelected && attempts > 0) { // If this option has been selected in any attempt
              if (option.isCorrect) {
                buttonClass = "btn btn-success w-full justify-start text-left normal-case";
              } else {
                buttonClass = "btn btn-error w-full justify-start text-left normal-case";
              }
            }
            // If question is fully answered, highlight the correct answer even if not selected
            if (isAnswered && option.isCorrect && !isSelected) {
                 buttonClass = "btn btn-success btn-outline w-full justify-start text-left normal-case"; // Highlight correct answer
            }
             if (isAnswered && option.isCorrect && isSelected) {
                 buttonClass = "btn btn-success w-full justify-start text-left normal-case";
            }


            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleOptionSelect(option.text)}
                disabled={isAnswered} // Disable all options if question is fully answered
              >
                {option.text}
              </button>
            );
          })}
        </div>
        {isAnswered && attempts >= 2 && !question.options.find(o => o.text === selectedOption)?.isCorrect && question.explanation && (
           <div role="alert" className="alert alert-warning mt-4">
            <span>Explicación: {question.explanation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
