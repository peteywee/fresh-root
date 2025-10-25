export type Role = "admin" | "manager" | "staff";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar: string;
  status: "Active" | "Inactive";
  lastLogin: string;
}

export interface Shift {
  id: string;
  title: string;
  start: number;
  end: number;
  assignee: string;
  notes: string;
  color: string;
}

// GenAI Flow Types
export type ExtractDataFromDocumentOutput = {
  extractedData: Record<string, unknown>;
  summary: string;
};

export type SummarizeImportedDataOutput = {
  summary: string;
};

export type SuggestScheduleImprovementsOutput = {
  suggestions: string;
  rationale: string;
};
