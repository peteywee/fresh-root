// [P2][APP][CODE]  Template Import
// Tags: P2, APP, CODE
import { parse } from "papaparse";
import * as XLSX from "xlsx";
import { z } from "zod";

// Use string keys and allow any values for template imports; callers should replace with concrete schema
export const RowSchema = z.record(z.string(), z.any()); // replace with concrete schema per import type

export type ImportResult<T> = {
  records: T[];
  warnings: string[];
  rejected: { row: number; reason: string }[];
};

export async function importFile(file: File): Promise<ImportResult<z.infer<typeof RowSchema>>> {
  const name = file.name.toLowerCase();
  let rows: unknown[] = [];

  if (name.endsWith(".csv")) {
    const text = await file.text();
    const parsed = parse(text, { header: true, skipEmptyLines: true });
    rows = parsed.data as unknown[];
  } else if (name.endsWith(".xlsx")) {
    const wb = XLSX.read(await file.arrayBuffer());
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws) as unknown[];
  } else {
    throw new Error("Unsupported file type");
  }

  const records: z.infer<typeof RowSchema>[] = [];
  const rejected: { row: number; reason: string }[] = [];
  const warnings: string[] = [];

  rows.forEach((r, i) => {
    const ok = RowSchema.safeParse(r);
    if (ok.success) records.push(ok.data);
    else rejected.push({ row: i + 1, reason: ok.error.message });
  });

  return { records, warnings, rejected };
}
