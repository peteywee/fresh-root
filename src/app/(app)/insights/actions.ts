"use server";

import {
  extractDataFromDocument,
  ExtractDataFromDocumentInput,
} from "@/ai/flows/extract-data-from-document";
import {
  summarizeImportedData,
  SummarizeImportedDataInput,
} from "@/ai/flows/summarize-imported-data";
import {
  suggestScheduleImprovements,
  SuggestScheduleImprovementsInput,
} from "@/ai/flows/suggest-schedule-improvements";

interface FormState {
  extractedData?: any;
  summary?: any;
  suggestions?: any;
  error?: string | null;
}

function fileToDataURI(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function handleExtractData(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const file = formData.get("file") as File;
  const instructions = formData.get("instructions") as string;

  if (!file) {
    return { error: "No file uploaded." };
  }

  try {
    const documentDataUri = await fileToDataURI(file);

    const input: ExtractDataFromDocumentInput = {
      documentDataUri,
      documentType: file.type,
      instructions: instructions || "Extract relevant labor data.",
    };

    const result = await extractDataFromDocument(input);
    const parsedExtractedData = JSON.parse(result.extractedData);

    return {
      extractedData: { ...result, extractedData: parsedExtractedData },
      error: null,
    };
  } catch (error) {
    console.error(error);
    return { error: "Failed to extract data from the document." };
  }
}

export async function handleSummarizeData(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const data = formData.get("data") as string;

  if (!data) {
    return { error: "No data to summarize." };
  }

  try {
    const input: SummarizeImportedDataInput = { data };
    const result = await summarizeImportedData(input);
    return { summary: result, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to summarize the data." };
  }
}

export async function handleSuggestImprovements(
  prevState: FormState,
  formData: FormData
): Promise<FormState> {
  const historicalData = formData.get("historicalData") as string;
  const forecastedNeeds = formData.get("forecastedNeeds") as string;
  const constraints = formData.get("constraints") as string;

  if (!historicalData || !forecastedNeeds) {
    return { error: "Historical data and forecasted needs are required." };
  }

  try {
    const input: SuggestScheduleImprovementsInput = {
      historicalData,
      forecastedNeeds,
      constraints,
    };
    const result = await suggestScheduleImprovements(input);
    return { suggestions: result, error: null };
  } catch (error) {
    console.error(error);
    return { error: "Failed to generate suggestions." };
  }
}
