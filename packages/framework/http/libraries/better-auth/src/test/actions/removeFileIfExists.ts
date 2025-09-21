import fs from 'node:fs/promises';

export async function removeFileIfExists(path: string): Promise<void> {
  try {
    await fs.stat(path);
    await fs.rm(path);
  } catch (_error: unknown) {
    // nothing to do here
  }
}
