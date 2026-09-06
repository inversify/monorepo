import fs from 'node:fs/promises';
import path from 'node:path';

import { generateApiTypesSource } from '../generation/calculations/generateApiTypesSource.js';

const GENERATE_API_TYPES_SOURCE_RELATIVE_PATH: string =
  'src/app/scripts/generateApiTypes.ts';

export async function writeGenerateApiTypesSourceFile(
  projectPath: string,
): Promise<string> {
  const generateApiTypesPath: string = path.join(
    projectPath,
    GENERATE_API_TYPES_SOURCE_RELATIVE_PATH,
  );

  await fs.mkdir(path.dirname(generateApiTypesPath), { recursive: true });
  await fs.writeFile(generateApiTypesPath, generateApiTypesSource(), 'utf8');

  return generateApiTypesPath;
}
