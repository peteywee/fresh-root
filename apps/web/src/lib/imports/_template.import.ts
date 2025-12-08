// [P2][APP][CODE]  Template Import
// Tags: P2, APP, CODE
import ExcelJS from "exceljs";
import type { Row, Cell } from "exceljs";
import { parse } from "papaparse";
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
    rows = parsed.data;
  } else if (name.endsWith(".xlsx")) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(await file.arrayBuffer());
    const worksheet = workbook.worksheets[0];
    if (worksheet) {
      const headers: string[] = [];
      worksheet.eachRow((row: Row, rowNumber: number) => {
        if (rowNumber === 1) {
          // First row is headers
          row.eachCell((cell: Cell) => {
            headers.push(String(cell.value ?? ""));
          });
        } else {
          // Data rows
          const rowData: Record<string, unknown> = {};
          row.eachCell((cell: Cell, colNumber: number) => {
            const header = headers[colNumber - 1];
            if (header) {
              rowData[header] = cell.value;
            }
          });
          if (Object.keys(rowData).length > 0) {
            rows.push(rowData);
          }
        }
      });
    }
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
