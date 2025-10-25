'use server';

/**
 * @fileOverview A flow that summarizes imported labor data for managers.
 *
 * - summarizeImportedData - A function that summarizes the data.
 * - SummarizeImportedDataInput - The input type for the summarizeImportedData function.
 * - SummarizeImportedDataOutput - The return type for the summarizeImportedData function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeImportedDataInputSchema = z.object({
  data: z.string().describe('The imported labor data in text format (e.g., CSV, XLSX, PDF).'),
});

export type SummarizeImportedDataInput = z.infer<typeof SummarizeImportedDataInputSchema>;

const SummarizeImportedDataOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the key trends and insights from the labor data.'),
});

export type SummarizeImportedDataOutput = z.infer<typeof SummarizeImportedDataOutputSchema>;

export async function summarizeImportedData(input: SummarizeImportedDataInput): Promise<SummarizeImportedDataOutput> {
  return summarizeImportedDataFlow(input);
}

const summarizeImportedDataPrompt = ai.definePrompt({
  name: 'summarizeImportedDataPrompt',
  input: {schema: SummarizeImportedDataInputSchema},
  output: {schema: SummarizeImportedDataOutputSchema},
  prompt: `You are an AI assistant helping managers understand labor data.
  Summarize the following labor data, highlighting key trends and insights that would be useful for staffing decisions.
  Data: {{{data}}}`,
});

const summarizeImportedDataFlow = ai.defineFlow(
  {
    name: 'summarizeImportedDataFlow',
    inputSchema: SummarizeImportedDataInputSchema,
    outputSchema: SummarizeImportedDataOutputSchema,
  },
  async input => {
    const {output} = await summarizeImportedDataPrompt(input);
    return output!;
  }
);
