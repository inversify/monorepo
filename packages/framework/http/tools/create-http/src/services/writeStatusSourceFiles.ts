import fs from 'node:fs/promises';
import path from 'node:path';

import { generateStatusContainerModuleSource } from '../generation/calculations/generateStatusContainerModuleSource.js';
import { generateStatusControllerSource } from '../generation/calculations/generateStatusControllerSource.js';
import { generateStatusDomainModelSource } from '../generation/calculations/generateStatusDomainModelSource.js';
import { generateStatusV1FromStatusBuilderSource } from '../generation/calculations/generateStatusV1FromStatusBuilderSource.js';
import { generateStatusV1Source } from '../generation/calculations/generateStatusV1Source.js';

const STATUS_SOURCE_FILES: ReadonlyArray<readonly [string, () => string]> = [
  ['src/status/domain/models/Status.ts', generateStatusDomainModelSource],
  ['src/status/api/models/StatusV1.ts', generateStatusV1Source],
  [
    'src/status/api/builders/StatusV1FromStatusBuilder.ts',
    generateStatusV1FromStatusBuilderSource,
  ],
  [
    'src/status/api/controllers/StatusController.ts',
    generateStatusControllerSource,
  ],
  [
    'src/status/adapter/inversify/containerModules/StatusContainerModule.ts',
    generateStatusContainerModuleSource,
  ],
];

export async function writeStatusSourceFiles(
  projectPath: string,
): Promise<void> {
  await Promise.all(
    STATUS_SOURCE_FILES.map(
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
