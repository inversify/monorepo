import fs from 'node:fs/promises';
import path from 'node:path';

import { generateProvideOpenApiSource } from '../generation/calculations/generateProvideOpenApiSource.js';
import { type ProvideOpenApiSourceModel } from '../generation/models/ProvideOpenApiSourceModel.js';

const PROVIDE_OPEN_API_SOURCE_RELATIVE_PATH: string =
  'src/app/scripts/provideOpenApi.ts';

export async function writeProvideOpenApiSourceFile(
  projectPath: string,
  model: ProvideOpenApiSourceModel,
): Promise<string> {
  const provideOpenApiPath: string = path.join(
    projectPath,
    PROVIDE_OPEN_API_SOURCE_RELATIVE_PATH,
  );

  await fs.mkdir(path.dirname(provideOpenApiPath), { recursive: true });
  await fs.writeFile(
    provideOpenApiPath,
    generateProvideOpenApiSource(model),
    'utf8',
  );

  return provideOpenApiPath;
}
