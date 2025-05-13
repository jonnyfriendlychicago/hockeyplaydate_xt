// lib/helpers/normalize.ts

export function normalizeNullable(input: unknown): string | null {
    return typeof input === 'string' ? input.trim() || null : null;
  }
  