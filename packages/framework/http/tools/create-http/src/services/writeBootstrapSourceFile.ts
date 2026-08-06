import fs from 'node:fs/promises';
import path from 'node:path';

import { generateBootstrapSource } from '../generation/calculations/generateBootstrapSource.js';
import { type BootstrapSourceModel } from '../generation/models/BootstrapSourceModel.js';

const BOOTSTRAP_SOURCE_RELATIVE_PATH: string = 'src/app/scripts/bootstrap.ts';

export async function writeBootstrapSourceFile(
  projectPath: string,
  model: BootstrapSourceModel,
): Promise<string> {
  const bootstrapPath: string = path.join(
    projectPath,
    BOOTSTRAP_SOURCE_RELATIVE_PATH,
  );

  await fs.mkdir(path.dirname(bootstrapPath), { recursive: true });
  await fs.writeFile(bootstrapPath, generateBootstrapSource(model), 'utf8');

  return bootstrapPath;
}
