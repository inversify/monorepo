import fs from 'node:fs/promises';
import path from 'node:path';

import prettier from 'prettier';

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
      const resolvedOptions: prettier.Options | null =
        await prettier.resolveConfig(filePath);
      const formatted: string = await prettier.format(source, {
        ...resolvedOptions,
        filepath: filePath,
      });

      if (formatted !== source) {
        await fs.writeFile(filePath, formatted, 'utf8');
      }
    }),
  );
}
