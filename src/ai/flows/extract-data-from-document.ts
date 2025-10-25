'use server';

/**
 * @fileOverview Extracts data from documents of various formats (PDFs, emails, spreadsheets, etc.).
 *
 * - extractDataFromDocument - A function that handles the extraction of data from a document.
 * - ExtractDataFromDocumentInput - The input type for the extractDataFromDocument function.
 * - ExtractDataFromDocumentOutput - The return type for the extractDataFromDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractDataFromDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "A document (PDF, email, spreadsheet, etc.) as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  documentType: z.string().describe('The type of the document (e.g., PDF, email, spreadsheet).'),
  instructions: z
    .string()
    .optional()
    .describe('Instructions for data extraction, such as specific fields to extract.'),
});
export type ExtractDataFromDocumentInput = z.infer<typeof ExtractDataFromDocumentInputSchema>;

const ExtractDataFromDocumentOutputSchema = z.object({
  extractedData: z
    .string()
    .describe('The extracted data from the document, formatted as a JSON string.'),
  summary: z.string().describe('A summary of the extracted data.'),
});
export type ExtractDataFromDocumentOutput = z.infer<typeof ExtractDataFromDocumentOutputSchema>;

export async function extractDataFromDocument(
  input: ExtractDataFromDocumentInput
): Promise<ExtractDataFromDocumentOutput> {
  return extractDataFromDocumentFlow(input);
}

const extractDataFromDocumentPrompt = ai.definePrompt({
  name: 'extractDataFromDocumentPrompt',
  input: {schema: ExtractDataFromDocumentInputSchema},
  output: {schema: ExtractDataFromDocumentOutputSchema},
  prompt: `You are an expert data extraction specialist. Your task is to extract data from the provided document.

Document Type: {{{documentType}}}

Document Content: {{media url=documentDataUri}}

Instructions: {{{instructions}}}

Extract the relevant information from the document and format it as a JSON string. Also, provide a summary of the extracted data.

Ensure that the extracted data is accurate and complete.

Output the extracted data as a JSON string and provide a summary of the extracted data.

Extracted Data (JSON):

Summary:`, // Ensure proper formatting for LLM parsing
});

const extractDataFromDocumentFlow = ai.defineFlow(
  {
    name: 'extractDataFromDocumentFlow',
    inputSchema: ExtractDataFromDocumentInputSchema,
    outputSchema: ExtractDataFromDocumentOutputSchema,
  },
  async input => {
    const {output} = await extractDataFromDocumentPrompt(input);
    return output!;
  }
);
