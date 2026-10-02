import { AnalyzeRequestPayload, CodePreset, ReviewHistoryEntry, ReviewResult } from '../types/review.types';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export class ApiClient {
  public static async analyzeCode(payload: AnalyzeRequestPayload): Promise<ReviewResult> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 35000);

    try {
      // First attempt direct backend connection
      const response = await fetch(`${BACKEND_URL}/review/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage =
          errorData?.message || `API Error: Server responded with status ${response.status}`;
        throw new Error(errorMessage);
      }

      const data: ReviewResult = await response.json();
      return data;
    } catch (err: unknown) {
      clearTimeout(timeoutId);

      // Check if aborted
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw new Error('Analysis timed out. The server or AI model took longer than 35 seconds to respond.');
      }

      // If network failed to reach localhost:4000, attempt fallback proxy route
      if (err instanceof TypeError && err.message.includes('fetch')) {
        try {
          const fallbackRes = await fetch('/api/review', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          });
          if (fallbackRes.ok) {
            return await fallbackRes.json();
          }
        } catch {
          // Ignore and throw original error
        }
      }

      throw err instanceof Error ? err : new Error(String(err));
    }
  }

  public static async fetchPresets(): Promise<CodePreset[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/review/presets`);
      if (response.ok) {
        const data = await response.json();
        return data.presets || [];
      }
    } catch {
      // Silently fall back to bundled presets
    }
    return [];
  }

  public static async fetchHistory(): Promise<ReviewHistoryEntry[]> {
    try {
      const response = await fetch(`${BACKEND_URL}/review/history`);
      if (response.ok) {
        const data = await response.json();
        return data.history || [];
      }
    } catch {
      // Silently return empty array on offline
    }
    return [];
  }
}
