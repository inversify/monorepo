import fs from 'node:fs/promises';
import path from 'node:path';

import { generateStatusContainerModuleSource } from '../generation/calculations/generateStatusContainerModuleSource.js';
import { generateStatusControllerSource } from '../generation/calculations/generateStatusControllerSource.js';
import { generateStatusResponseSource } from '../generation/calculations/generateStatusResponseSource.js';

export const STATUS_CONTROLLER_RELATIVE_PATH: string =
  'src/status/controllers/StatusController.ts';

export const STATUS_CONTAINER_MODULE_RELATIVE_PATH: string =
  'src/status/containerModules/StatusContainerModule.ts';

export const STATUS_RESPONSE_RELATIVE_PATH: string =
  'src/status/models/StatusResponse.ts';

export async function writeStatusSourceFiles(
  projectPath: string,
): Promise<void> {
  const statusControllerPath: string = path.join(
    projectPath,
    STATUS_CONTROLLER_RELATIVE_PATH,
  );
  const statusContainerModulePath: string = path.join(
    projectPath,
    STATUS_CONTAINER_MODULE_RELATIVE_PATH,
  );
  const statusResponsePath: string = path.join(
    projectPath,
    STATUS_RESPONSE_RELATIVE_PATH,
  );

  await fs.mkdir(path.dirname(statusControllerPath), { recursive: true });
  await fs.mkdir(path.dirname(statusContainerModulePath), { recursive: true });
  await fs.mkdir(path.dirname(statusResponsePath), { recursive: true });

  await fs.writeFile(
    statusControllerPath,
    generateStatusControllerSource(),
    'utf8',
  );
  await fs.writeFile(
    statusContainerModulePath,
    generateStatusContainerModuleSource(),
    'utf8',
  );
  await fs.writeFile(
    statusResponsePath,
    generateStatusResponseSource(),
    'utf8',
  );
}
