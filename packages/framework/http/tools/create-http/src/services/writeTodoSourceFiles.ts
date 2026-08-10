import fs from 'node:fs/promises';
import path from 'node:path';

import { generateCreateTodoRequestSource } from '../generation/calculations/generateCreateTodoRequestSource.js';
import { generatePrismaTodoPersistenceAdapterSource } from '../generation/calculations/generatePrismaTodoPersistenceAdapterSource.js';
import { generateTodoContainerModuleSource } from '../generation/calculations/generateTodoContainerModuleSource.js';
import { generateTodoControllerSource } from '../generation/calculations/generateTodoControllerSource.js';
import { generateTodoDomainModelSource } from '../generation/calculations/generateTodoDomainModelSource.js';
import { generateTodoPersistencePortIdentifierSource } from '../generation/calculations/generateTodoPersistencePortIdentifierSource.js';
import { generateTodoPersistencePortSource } from '../generation/calculations/generateTodoPersistencePortSource.js';
import { generateTodoPrismaContainerModuleSource } from '../generation/calculations/generateTodoPrismaContainerModuleSource.js';

const TODO_SOURCE_FILES: ReadonlyArray<readonly [string, () => string]> = [
  ['src/todo/domain/models/Todo.ts', generateTodoDomainModelSource],
  [
    'src/todo/application/ports/TodoPersistencePort.ts',
    generateTodoPersistencePortSource,
  ],
  [
    'src/todo/application/models/todoPersistencePortIdentifier.ts',
    generateTodoPersistencePortIdentifierSource,
  ],
  ['src/todo/api/models/CreateTodoRequest.ts', generateCreateTodoRequestSource],
  ['src/todo/api/controllers/TodoController.ts', generateTodoControllerSource],
  [
    'src/todo/adapter/prisma/PrismaTodoPersistenceAdapter.ts',
    generatePrismaTodoPersistenceAdapterSource,
  ],
  [
    'src/todo/adapter/inversify/TodoContainerModule.ts',
    generateTodoContainerModuleSource,
  ],
  [
    'src/todo/adapter/inversify/TodoPrismaContainerModule.ts',
    generateTodoPrismaContainerModuleSource,
  ],
];

export async function writeTodoSourceFiles(projectPath: string): Promise<void> {
  await Promise.all(
    TODO_SOURCE_FILES.map(
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
