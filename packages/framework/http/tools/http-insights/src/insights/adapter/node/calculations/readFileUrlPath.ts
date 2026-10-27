import { fileURLToPath } from 'node:url';

export function readFileUrlPath(url: string): string | null {
  try {
    return fileURLToPath(url);
  } catch (_error: unknown) {
    return null;
  }
}
