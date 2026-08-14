import fs from 'node:fs/promises';
import path from 'node:path';

import { generateCreateTodoV1RequestBodySource } from '../generation/calculations/generateCreateTodoV1RequestBodySource.js';
import { generatePaginatedTodosV1ResponseSource } from '../generation/calculations/generatePaginatedTodosV1ResponseSource.js';
import { generatePrismaTodoPersistenceAdapterSource } from '../generation/calculations/generatePrismaTodoPersistenceAdapterSource.js';
import { generateTodoContainerModuleSource } from '../generation/calculations/generateTodoContainerModuleSource.js';
import { generateTodoControllerSource } from '../generation/calculations/generateTodoControllerSource.js';
import { generateTodoDomainModelSource } from '../generation/calculations/generateTodoDomainModelSource.js';
import { generateTodoFromPrismaTodoBuilderSource } from '../generation/calculations/generateTodoFromPrismaTodoBuilderSource.js';
import { generateTodoPersistencePortIdentifierSource } from '../generation/calculations/generateTodoPersistencePortIdentifierSource.js';
import { generateTodoPersistencePortSource } from '../generation/calculations/generateTodoPersistencePortSource.js';
import { generateTodoPrismaContainerModuleSource } from '../generation/calculations/generateTodoPrismaContainerModuleSource.js';
import { generateTodoV1FromTodoBuilderSource } from '../generation/calculations/generateTodoV1FromTodoBuilderSource.js';
import { generateTodoV1Source } from '../generation/calculations/generateTodoV1Source.js';
import { generateUpdateTodoV1RequestBodySource } from '../generation/calculations/generateUpdateTodoV1RequestBodySource.js';
import { type TodoControllerSourceModel } from '../generation/models/TodoControllerSourceModel.js';

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
  ['src/todo/api/models/TodoV1.ts', generateTodoV1Source],
  [
    'src/todo/api/models/CreateTodoV1RequestBody.ts',
    generateCreateTodoV1RequestBodySource,
  ],
  [
    'src/todo/api/models/PaginatedTodosV1Response.ts',
    generatePaginatedTodosV1ResponseSource,
  ],
  [
    'src/todo/api/models/UpdateTodoV1RequestBody.ts',
    generateUpdateTodoV1RequestBodySource,
  ],
  [
    'src/todo/api/builders/TodoV1FromTodoBuilder.ts',
    generateTodoV1FromTodoBuilderSource,
  ],
  [
    'src/todo/adapter/prisma/adapters/PrismaTodoPersistenceAdapter.ts',
    generatePrismaTodoPersistenceAdapterSource,
  ],
  [
    'src/todo/adapter/prisma/builders/TodoFromPrismaTodoBuilder.ts',
    generateTodoFromPrismaTodoBuilderSource,
  ],
  [
    'src/todo/adapter/inversify/containerModules/TodoContainerModule.ts',
    generateTodoContainerModuleSource,
  ],
  [
    'src/todo/adapter/inversify/containerModules/TodoPrismaContainerModule.ts',
    generateTodoPrismaContainerModuleSource,
  ],
];

const TODO_CONTROLLER_SOURCE_RELATIVE_PATH: string =
  'src/todo/api/controllers/TodoController.ts';

export async function writeTodoSourceFiles(
  projectPath: string,
  todoControllerSourceModel: TodoControllerSourceModel,
): Promise<void> {
  await Promise.all([
    ...TODO_SOURCE_FILES.map(
      async ([relativePath, generateSource]: readonly [
        string,
        () => string,
      ]): Promise<void> => {
        const absolutePath: string = path.join(projectPath, relativePath);

        await fs.mkdir(path.dirname(absolutePath), { recursive: true });
        await fs.writeFile(absolutePath, generateSource(), 'utf8');
      },
    ),
    (async (): Promise<void> => {
      const absolutePath: string = path.join(
        projectPath,
        TODO_CONTROLLER_SOURCE_RELATIVE_PATH,
      );

      await fs.mkdir(path.dirname(absolutePath), { recursive: true });
      await fs.writeFile(
        absolutePath,
        await generateTodoControllerSource(todoControllerSourceModel),
        'utf8',
      );
    })(),
  ]);
}
