import fs from 'node:fs/promises';
import path from 'node:path';

import { generateBuilderSource } from '../generation/calculations/generateBuilderSource.js';

const BUILDER_RELATIVE_PATH: string = 'src/common/domain/modules/Builder.ts';

export async function writeCommonSourceFiles(
  projectPath: string,
): Promise<void> {
  const builderPath: string = path.join(projectPath, BUILDER_RELATIVE_PATH);

  await fs.mkdir(path.dirname(builderPath), { recursive: true });
  await fs.writeFile(builderPath, generateBuilderSource(), 'utf8');
}
