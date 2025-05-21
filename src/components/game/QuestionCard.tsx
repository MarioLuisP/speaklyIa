"use client";

import type { Question } from '@/types';
import React, { useState } from 'react';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  onAnswer: (isCorrect: boolean, isFirstAttempt: boolean) => void;
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
  const [isAnswered, setIsAnswered] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const [showTranslation, setShowTranslation] = useState(false);

  const handleOptionSelect = (optionText: string) => {
    if (isAnswered && attempts >= (question.translation ? 2 : 1) ) return;

    setSelectedOption(optionText);
    const currentAttempts = attempts + 1;
    setAttempts(currentAttempts);

    const chosenOption = question.options.find(opt => opt.text === optionText);
    const isCorrect = chosenOption?.isCorrect || false;

    if (isCorrect || currentAttempts >= (question.translation ? 2 : 1)) {
      setIsAnswered(true);
      if (question.translation && !isCorrect) {
        setShowTranslation(true);
      }
    }
    onAnswer(isCorrect, currentAttempts === 1);
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
              disabled={isAnswered && !question.options.find(o => o.text === selectedOption)?.isCorrect}
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
            constisSelected = selectedOption === option.text;
            let buttonClass = "btn btn-outline w-full justify-start text-left normal-case";
            if (isAnswered || (attempts > 0 && isSelected) ) {
              if (option.isCorrect) {
                buttonClass = "btn btn-success w-full justify-start text-left normal-case";
              } else if (isSelected && !option.isCorrect) {
                buttonClass = "btn btn-error w-full justify-start text-left normal-case";
              }
            }

            return (
              <button
                key={index}
                className={buttonClass}
                onClick={() => handleOptionSelect(option.text)}
                disabled={(isAnswered && attempts >= (question.translation ? 2 : 1)) || (isSelected && !option.isCorrect && attempts >= (question.translation ? 2 : 1))}
              >
                {option.text}
              </button>
            );
          })}
        </div>
        { isAnswered && attempts >= (question.translation ? 2 : 1) && !question.options.find(o => o.text === selectedOption)?.isCorrect && question.explanation && (
           <div role="alert" className="alert alert-warning mt-4">
            <span>Explicación: {question.explanation}</span>
          </div>
        )}
      </div>
    </div>
  );
}
