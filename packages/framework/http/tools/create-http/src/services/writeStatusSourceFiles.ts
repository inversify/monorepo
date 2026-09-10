import fs from 'node:fs/promises';
import path from 'node:path';

import { createStatusControllerSourceModel } from '../generation/calculations/createStatusControllerSourceModel.js';
import { generateStatusContainerModuleSource } from '../generation/calculations/generateStatusContainerModuleSource.js';
import { generateStatusControllerSource } from '../generation/calculations/generateStatusControllerSource.js';
import { generateStatusDomainModelSource } from '../generation/calculations/generateStatusDomainModelSource.js';
import { generateStatusSchemaV1Source } from '../generation/calculations/generateStatusSchemaV1Source.js';
import { generateStatusV1FromStatusBuilderSource } from '../generation/calculations/generateStatusV1FromStatusBuilderSource.js';
import { generateStatusV1Source } from '../generation/calculations/generateStatusV1Source.js';
import { ApiStyle } from '../models/ApiStyle.js';

export async function writeStatusSourceFiles(
  projectPath: string,
  apiStyle: ApiStyle,
): Promise<void> {
  const statusModelSource: readonly [string, string] =
    apiStyle === ApiStyle.schemaFirst
      ? [
          'src/status/api/models/StatusSchemaV1.ts',
          generateStatusSchemaV1Source(),
        ]
      : ['src/status/api/models/StatusV1.ts', generateStatusV1Source()];

  const statusSourceFiles: ReadonlyArray<readonly [string, string]> = [
    ['src/status/domain/models/Status.ts', generateStatusDomainModelSource()],
    statusModelSource,
    [
      'src/status/api/builders/StatusV1FromStatusBuilder.ts',
      generateStatusV1FromStatusBuilderSource(apiStyle),
    ],
    [
      'src/status/api/controllers/StatusController.ts',
      generateStatusControllerSource(
        createStatusControllerSourceModel(apiStyle),
      ),
    ],
    [
      'src/status/adapter/inversify/containerModules/StatusContainerModule.ts',
      generateStatusContainerModuleSource(),
    ],
  ];

  await Promise.all(
    statusSourceFiles.map(
      async ([relativePath, source]: readonly [
        string,
        string,
      ]): Promise<void> => {
        const absolutePath: string = path.join(projectPath, relativePath);

        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, source, 'utf8');
      },
    ),
  );
}
