"use client";

import { useState } from "react";
import { useFormState } from "react-dom";
import {
  handleExtractData,
  handleSummarizeData,
  handleSuggestImprovements,
} from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  FileUp,
  Loader,
  Lightbulb,
  FileText,
  Table,
  Terminal,
} from "lucide-react";
import type {
  ExtractDataFromDocumentOutput,
  SummarizeImportedDataOutput,
  SuggestScheduleImprovementsOutput,
} from "@/lib/types";

const initialState = {
  extractedData: null,
  summary: null,
  suggestions: null,
  error: null,
};

export default function InsightsPage() {
  const [file, setFile] = useState<File | null>(null);

  const [extractState, extractAction] = useFormState(
    handleExtractData,
    initialState
  );
  const [summarizeState, summarizeAction] = useFormState(
    handleSummarizeData,
    initialState
  );
  const [suggestState, suggestAction] = useFormState(
    handleSuggestImprovements,
    initialState
  );

  const [pendingAction, setPendingAction] = useState<
    "extract" | "summarize" | "suggest" | null
  >(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  };

  const createAction = (
    action: (
      prevState: any,
      formData: FormData
    ) => Promise<any>
  ) => {
    return (formData: FormData) => {
      if (file) {
        formData.append("file", file);
      }
      action(initialState, formData);
    };
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold font-headline">Labor Insights</h1>
        <p className="text-muted-foreground">
          Use AI to analyze your labor data and optimize your schedule.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>1. Import and Extract Data</CardTitle>
          <CardDescription>
            Upload a document (PDF, email, spreadsheet) to extract structured
            data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPendingAction("extract");
              createAction(extractAction)(new FormData(e.currentTarget));
            }}
            className="space-y-4"
          >
            <div className="grid w-full max-w-sm items-center gap-1.5">
              <Input
                id="document"
                name="document"
                type="file"
                onChange={handleFileChange}
                required
                className="file:text-primary file:font-medium"
              />
            </div>
            <Textarea
              name="instructions"
              placeholder="Optional: Provide specific extraction instructions. E.g., 'Extract names, hours worked, and total pay.'"
            />
            <Button
              type="submit"
              disabled={!file || pendingAction === "extract"}
            >
              {pendingAction === "extract" ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileUp className="mr-2 h-4 w-4" />
              )}
              Extract Data
            </Button>
          </form>
          {extractState.error && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{extractState.error}</AlertDescription>
            </Alert>
          )}
          {extractState.extractedData && (
            <div className="mt-4 space-y-4">
              <h3 className="font-semibold flex items-center">
                <Table className="mr-2 h-4 w-4" />
                Extracted Data
              </h3>
              <pre className="p-4 bg-muted rounded-md text-sm overflow-x-auto">
                {JSON.stringify(extractState.extractedData.extractedData, null, 2)}
              </pre>
              <h3 className="font-semibold flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Extraction Summary
              </h3>
              <p className="text-sm text-muted-foreground">
                {extractState.extractedData.summary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>2. Get Summary</CardTitle>
          <CardDescription>
            Generate a concise summary of the extracted labor data to identify
            key trends.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPendingAction("summarize");
              const formData = new FormData();
              if (extractState.extractedData) {
                formData.append(
                  "data",
                  JSON.stringify(extractState.extractedData.extractedData)
                );
              }
              summarizeAction(initialState, formData);
            }}
          >
            <Button
              type="submit"
              disabled={!extractState.extractedData || pendingAction === 'summarize'}
              variant="outline"
            >
              {pendingAction === 'summarize' ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FileText className="mr-2 h-4 w-4" />
              )}
              Summarize Data
            </Button>
          </form>
          {summarizeState.error && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{summarizeState.error}</AlertDescription>
            </Alert>
          )}
          {summarizeState.summary && (
            <div className="mt-4 space-y-2">
              <h3 className="font-semibold flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Data Summary
              </h3>
              <p className="text-sm text-muted-foreground">
                {summarizeState.summary.summary}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>3. Get Suggestions</CardTitle>
          <CardDescription>
            Receive AI-powered suggestions to optimize your schedule based on
            the data.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setPendingAction("suggest");
              const formData = new FormData(e.currentTarget);
              if (extractState.extractedData) {
                 formData.append(
                  "historicalData",
                  JSON.stringify(extractState.extractedData.extractedData)
                );
              }
              suggestAction(initialState, formData);
            }}
            className="space-y-4"
          >
            <Textarea
              name="forecastedNeeds"
              placeholder="Describe forecasted needs. E.g., 'Expecting 20% more customers on weekends. Need extra staff for checkout and floor support.'"
              required
            />
            <Textarea
              name="constraints"
              placeholder="Optional: List any constraints. E.g., 'Budget for overtime is limited to 10 hours per week. Jane is unavailable on Mondays.'"
            />
            <Button type="submit" disabled={!extractState.extractedData || pendingAction === 'suggest'}>
              {pendingAction === 'suggest' ? (
                <Loader className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Lightbulb className="mr-2 h-4 w-4" />
              )}
              Suggest Improvements
            </Button>
          </form>
          {suggestState.error && (
            <Alert variant="destructive" className="mt-4">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{suggestState.error}</AlertDescription>
            </Alert>
          )}
          {suggestState.suggestions && (
            <div className="mt-4 space-y-4">
              <Alert>
                <Lightbulb className="h-4 w-4" />
                <AlertTitle>Optimization Suggestions</AlertTitle>
                <AlertDescription className="whitespace-pre-wrap">
                  {suggestState.suggestions.suggestions}
                </AlertDescription>
              </Alert>
              <h3 className="font-semibold flex items-center">
                Rationale
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {suggestState.suggestions.rationale}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
