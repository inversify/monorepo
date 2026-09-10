import fs from 'node:fs/promises';
import path from 'node:path';

import { generateInitialApiTypesSource } from '../generation/calculations/generateInitialApiTypesSource.js';
import { GENERATED_API_TYPES_RELATIVE_PATH } from '../generation/models/generatedApiTypeNames.js';

export async function writeInitialApiTypesSourceFile(
  projectPath: string,
): Promise<string> {
  const generatedApiTypesPath: string = path.join(
    projectPath,
    GENERATED_API_TYPES_RELATIVE_PATH,
  );

  await fs.mkdir(path.dirname(generatedApiTypesPath), { recursive: true });
  await fs.writeFile(
    generatedApiTypesPath,
    generateInitialApiTypesSource(),
    'utf8',
  );

  return generatedApiTypesPath;
}
