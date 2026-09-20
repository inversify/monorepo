import fs from 'node:fs/promises';
import path from 'node:path';

import { generateBuilderSource } from '../generation/calculations/generateBuilderSource.js';
import { generateHandlerSource } from '../generation/calculations/generateHandlerSource.js';

const COMMON_SOURCE_FILES: ReadonlyArray<readonly [string, () => string]> = [
  ['src/common/domain/modules/Builder.ts', generateBuilderSource],
  ['src/common/domain/modules/Handler.ts', generateHandlerSource],
];

export async function writeCommonSourceFiles(
  projectPath: string,
): Promise<void> {
  await Promise.all(
    COMMON_SOURCE_FILES.map(
      async ([relativePath, generateSource]: readonly [
        string,
        () => string,
      ]): Promise<void> => {
        const absolutePath: string = path.join(projectPath, relativePath);

        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, generateSource(), 'utf8');
      },
    ),
  );
}
