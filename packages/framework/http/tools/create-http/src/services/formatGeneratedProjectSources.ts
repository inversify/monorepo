import fs from 'node:fs/promises';
import path from 'node:path';

import { formatScaffoldSource } from '../generation/calculations/formatScaffoldSource.js';

async function collectTypeScriptFilePaths(
  directoryPath: string,
): Promise<string[]> {
  const directoryEntries: string[] = await fs.readdir(directoryPath, {
    recursive: true,
  });

  return directoryEntries
    .filter((relativePath: string) => relativePath.endsWith('.ts'))
    .map((relativePath: string) => path.join(directoryPath, relativePath));
}

export async function formatGeneratedProjectSources(
  projectPath: string,
): Promise<void> {
  const srcRoot: string = path.join(projectPath, 'src');
  const typeScriptFilePaths: string[] =
    await collectTypeScriptFilePaths(srcRoot);

  await Promise.all(
    typeScriptFilePaths.map(async (filePath: string): Promise<void> => {
      const source: string = await fs.readFile(filePath, 'utf8');
      const formatted: string = await formatScaffoldSource(filePath, source);

      if (formatted !== source) {
        await fs.writeFile(filePath, formatted, 'utf8');
      }
    }),
  );
}
