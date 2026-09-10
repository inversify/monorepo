import fs from 'node:fs/promises';
import path from 'node:path';

import { generateInitializeContainerSource } from '../generation/calculations/generateInitializeContainerSource.js';
import { type InitializeContainerSourceModel } from '../generation/models/InitializeContainerSourceModel.js';

const INITIALIZE_CONTAINER_SOURCE_RELATIVE_PATH: string =
  'src/app/scripts/initializeContainer.ts';

export async function writeInitializeContainerSourceFile(
  projectPath: string,
  model: InitializeContainerSourceModel,
): Promise<string> {
  const initializeContainerPath: string = path.join(
    projectPath,
    INITIALIZE_CONTAINER_SOURCE_RELATIVE_PATH,
  );

  await fs.mkdir(path.dirname(initializeContainerPath), { recursive: true });
  await fs.writeFile(
    initializeContainerPath,
    await generateInitializeContainerSource(model),
    'utf8',
  );

  return initializeContainerPath;
}
