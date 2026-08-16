import fs from 'node:fs/promises';
import path from 'node:path';

import { type YarnBerryVersionCatalog } from '../models/YarnBerryVersionCatalog.js';

export async function readYarnBerryVersion(
  baseTemplateRoot: string,
): Promise<string> {
  const fileContents: string = await fs.readFile(
    path.join(baseTemplateRoot, 'yarn-berry.json'),
    'utf8',
  );
  const catalog: YarnBerryVersionCatalog = JSON.parse(
    fileContents,
  ) as YarnBerryVersionCatalog;

  return catalog.version;
}
