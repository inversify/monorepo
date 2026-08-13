import fs from 'node:fs/promises';
import path from 'node:path';

import { generateLoggerContainerModuleSource } from '../generation/calculations/generateLoggerContainerModuleSource.js';
import { generateLoggerFactoryIdentifierSource } from '../generation/calculations/generateLoggerFactoryIdentifierSource.js';

const LOGGER_CONTAINER_MODULE_RELATIVE_PATH: string =
  'src/logger/containerModules/LoggerContainerModule.ts';

const LOGGER_FACTORY_IDENTIFIER_RELATIVE_PATH: string =
  'src/logger/models/loggerFactoryIdentifier.ts';

export async function writeLoggerSourceFiles(
  projectPath: string,
): Promise<void> {
  const loggerContainerModulePath: string = path.join(
    projectPath,
    LOGGER_CONTAINER_MODULE_RELATIVE_PATH,
  );
  const loggerFactoryIdentifierPath: string = path.join(
    projectPath,
    LOGGER_FACTORY_IDENTIFIER_RELATIVE_PATH,
  );

  await fs.mkdir(path.dirname(loggerContainerModulePath), { recursive: true });
  await fs.mkdir(path.dirname(loggerFactoryIdentifierPath), {
    recursive: true,
  });

  await fs.writeFile(
    loggerContainerModulePath,
    generateLoggerContainerModuleSource(),
    'utf8',
  );
  await fs.writeFile(
    loggerFactoryIdentifierPath,
    generateLoggerFactoryIdentifierSource(),
    'utf8',
  );
}
