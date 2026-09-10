import fs from 'node:fs/promises';
import path from 'node:path';

import { generateGenerateApiTypesSource } from '../generation/calculations/generateGenerateApiTypesSource.js';
import { GENERATE_API_TYPES_SCRIPT_RELATIVE_PATH } from '../generation/models/generatedApiTypeNames.js';

export async function writeGenerateApiTypesSourceFile(
  projectPath: string,
): Promise<string> {
  const generateApiTypesPath: string = path.join(
    projectPath,
    GENERATE_API_TYPES_SCRIPT_RELATIVE_PATH,
  );

  await fs.mkdir(path.dirname(generateApiTypesPath), { recursive: true });
  await fs.writeFile(
    generateApiTypesPath,
    generateGenerateApiTypesSource(),
    'utf8',
  );

  return generateApiTypesPath;
}
