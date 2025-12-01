// Vitest assertion helpers for testing
import { expect } from "vitest";

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Failed to parse response: ${text}`);
  }
}

export async function expectSuccess<T>(
  response: Response,
  expectedData?: Partial<T>,
): Promise<{ data: T; meta: { requestId: string } }> {
  expect(response.status).toBe(200);
  const json = await parseJsonResponse<{ data: T; meta: { requestId: string } }>(response);
  if (expectedData) {
    expect(json.data).toMatchObject(expectedData);
  }
  return json;
}

export async function expectError(
  response: Response,
  expectedCode: string,
  expectedStatus: number,
): Promise<{ error: { code: string; message: string; requestId: string } }> {
  expect(response.status).toBe(expectedStatus);
  const json = await parseJsonResponse<{
    error: { code: string; message: string; requestId: string };
  }>(response);
  expect(json.error.code).toBe(expectedCode);
  return json;
}
