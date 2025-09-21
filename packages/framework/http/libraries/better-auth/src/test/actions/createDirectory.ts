import fs from 'node:fs/promises';

export async function createDirectory(directory: string): Promise<void> {
  try {
    await fs.stat(directory);
  } catch (_error: unknown) {
    await fs.mkdir(directory, { recursive: true });
  }
}
