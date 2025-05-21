
'use server';

/**
 * @fileOverview AI-powered vocabulary suggestions tailored to the user's current level and learning goals.
 *
 * - getDailyVocabularySuggestions - A function that retrieves daily vocabulary suggestions.
 * - DailyVocabularySuggestionsInput - The input type for the getDailyVocabularySuggestions function.
 * - DailyVocabularySuggestionsOutput - The return type for the getDailyVocabularySuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DailyVocabularySuggestionsInputSchema = z.object({
  userLevel: z
    .string()
    .describe("The user's current vocabulary level (e.g., Novice, Intermediate, Expert)."),
  learningGoals: z
    .string()
    .describe(
      'The user specified learning goals, e.g. to pass an advanced English test, or to do business in English.'
    ),
  numberOfSuggestions: z
    .number()
    .default(5)
    .describe('The number of vocabulary suggestions to provide.'),
});
export type DailyVocabularySuggestionsInput = z.infer<
  typeof DailyVocabularySuggestionsInputSchema
>;

const DailyVocabularySuggestionsOutputSchema = z.object({
  suggestedWords: z
    .array(z.string())
    .describe('An array of vocabulary words tailored to the user.'),
});
export type DailyVocabularySuggestionsOutput = z.infer<
  typeof DailyVocabularySuggestionsOutputSchema
>;

export async function getDailyVocabularySuggestions(
  input: DailyVocabularySuggestionsInput
): Promise<DailyVocabularySuggestionsOutput> {
  // Hardcoded response for simulation
  return Promise.resolve({ suggestedWords: ["Ebullient", "Ephemeral", "Serendipity"] });
}

// Original AI-powered flow (commented out for simulation)
/*
const dailyVocabularySuggestionsPrompt = ai.definePrompt({
  name: 'dailyVocabularySuggestionsPrompt',
  input: {schema: DailyVocabularySuggestionsInputSchema},
  output: {schema: DailyVocabularySuggestionsOutputSchema},
  prompt: `You are an AI vocabulary tutor. Suggest {{{numberOfSuggestions}}} new vocabulary words tailored to the user's current level and learning goals.

User Level: {{{userLevel}}}
Learning Goals: {{{learningGoals}}}

Ensure that the words you suggest are appropriate for the user's level and relevant to their goals. Do not provide definitions or examples, only the words themselves.

Output:
`,
});

const dailyVocabularySuggestionsFlow = ai.defineFlow(
  {
    name: 'dailyVocabularySuggestionsFlow',
    inputSchema: DailyVocabularySuggestionsInputSchema,
    outputSchema: DailyVocabularySuggestionsOutputSchema,
  },
  async input => {
    const {output} = await dailyVocabularySuggestionsPrompt(input);
    return output!;
  }
);
*/

// To restore AI functionality, uncomment the prompt and flow above,
// and change getDailyVocabularySuggestions to:
// export async function getDailyVocabularySuggestions(
// input: DailyVocabularySuggestionsInput
// ): Promise<DailyVocabularySuggestionsOutput> {
//   return dailyVocabularySuggestionsFlow(input);
// }
