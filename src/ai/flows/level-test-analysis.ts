// src/ai/flows/level-test-analysis.ts
'use server';

/**
 * @fileOverview Analyzes the user's level test answers and assigns an appropriate initial level.
 *
 * - analyzeLevelTest - A function that handles the level test analysis process.
 * - LevelTestAnalysisInput - The input type for the analyzeLevelTest function.
 * - LevelTestAnalysisOutput - The return type for the analyzeLevelTest function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const LevelTestAnalysisInputSchema = z.object({
  answers: z.array(
    z.object({
      question: z.string().describe('The question asked in the level test.'),
      selectedAnswer: z.string().describe('The answer selected by the user.'),
      correctAnswer: z.string().describe('The correct answer to the question.'),
      attempts: z.number().describe('The number of attempts the user took to answer the question.'),
    })
  ).describe('An array of the user answers for each question in the level test.'),
});
export type LevelTestAnalysisInput = z.infer<typeof LevelTestAnalysisInputSchema>;

const LevelTestAnalysisOutputSchema = z.object({
  level: z.enum(['Novato', 'Intermedio', 'Experto']).describe('The assigned level to the user based on their performance on the level test.'),
  score: z.number().describe('The total score obtained by the user in the level test.'),
  summary: z.string().describe('A short summary of the user performance in the level test.'),
});
export type LevelTestAnalysisOutput = z.infer<typeof LevelTestAnalysisOutputSchema>;

export async function analyzeLevelTest(input: LevelTestAnalysisInput): Promise<LevelTestAnalysisOutput> {
  return analyzeLevelTestFlow(input);
}

const prompt = ai.definePrompt({
  name: 'levelTestAnalysisPrompt',
  input: {schema: LevelTestAnalysisInputSchema},
  output: {schema: LevelTestAnalysisOutputSchema},
  prompt: `You are an expert in language assessment. Analyze the user's answers to a level test and assign them an appropriate level (Novato, Intermedio, Experto).

Consider the number of attempts the user took to answer each question. Award 2 points if the user answers correctly on the first attempt, 1 point if they answer correctly on the second attempt, and 0 points if they fail both attempts.

Here are the user's answers:

{{#each answers}}
Question: {{{question}}}
Selected Answer: {{{selectedAnswer}}}
Correct Answer: {{{correctAnswer}}}
Attempts: {{{attempts}}}
{{/each}}

Based on their performance, assign a level and provide a short summary of their performance. Also calculate total score based on attempt

Output the level, score, and summary in JSON format.`, 
});

const analyzeLevelTestFlow = ai.defineFlow(
  {
    name: 'analyzeLevelTestFlow',
    inputSchema: LevelTestAnalysisInputSchema,
    outputSchema: LevelTestAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
