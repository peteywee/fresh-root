'use server';

/**
 * @fileOverview Provides AI-powered suggestions for optimizing the schedule based on historical data and forecasted needs.
 *
 * - suggestScheduleImprovements - A function that suggests schedule improvements.
 * - SuggestScheduleImprovementsInput - The input type for the suggestScheduleImprovements function.
 * - SuggestScheduleImprovementsOutput - The return type for the suggestScheduleImprovements function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestScheduleImprovementsInputSchema = z.object({
  historicalData: z
    .string()
    .describe(
      'Historical schedule data, including staff hours, roles, and performance metrics.'
    ),
  forecastedNeeds: z
    .string()
    .describe(
      'Forecasted staffing needs, including expected customer volume, task requirements, and peak hours.'
    ),
  constraints: z
    .string()
    .optional()
    .describe(
      'Any constraints on the schedule, such as staff availability or budget limitations.'
    ),
});

export type SuggestScheduleImprovementsInput = z.infer<
  typeof SuggestScheduleImprovementsInputSchema
>;

const SuggestScheduleImprovementsOutputSchema = z.object({
  suggestions: z
    .string()
    .describe(
      'AI-powered suggestions for optimizing the schedule, including specific changes to shifts, staff assignments, and resource allocation.'
    ),
  rationale: z
    .string()
    .describe(
      'The rationale behind the suggestions, including the data and assumptions used to generate them.'
    ),
});

export type SuggestScheduleImprovementsOutput = z.infer<
  typeof SuggestScheduleImprovementsOutputSchema
>;

export async function suggestScheduleImprovements(
  input: SuggestScheduleImprovementsInput
): Promise<SuggestScheduleImprovementsOutput> {
  return suggestScheduleImprovementsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestScheduleImprovementsPrompt',
  input: {schema: SuggestScheduleImprovementsInputSchema},
  output: {schema: SuggestScheduleImprovementsOutputSchema},
  prompt: `You are an AI assistant specializing in schedule optimization for businesses.

You are provided with historical schedule data, forecasted staffing needs, and any constraints on the schedule. Your goal is to generate suggestions for optimizing the schedule to improve efficiency and reduce labor costs.

Historical Data: {{{historicalData}}}
Forecasted Needs: {{{forecastedNeeds}}}
Constraints: {{{constraints}}}

Based on this information, provide specific and actionable suggestions for optimizing the schedule. Include a rationale for each suggestion, explaining the data and assumptions used to generate it. The suggestions should include specific changes to shifts, staff assignments, and resource allocation.

Ensure that the suggestions are realistic and take into account the constraints provided. Format the suggestions and rationale clearly and concisely.
`,
});

const suggestScheduleImprovementsFlow = ai.defineFlow(
  {
    name: 'suggestScheduleImprovementsFlow',
    inputSchema: SuggestScheduleImprovementsInputSchema,
    outputSchema: SuggestScheduleImprovementsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
