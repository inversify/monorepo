export function generateGenerateApiTypesSource(): string {
  return `import { execFile } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';

import { type SwaggerUiProvider } from '@inversifyjs/http-open-api/v3Dot2';
import { transformOpenApiToTypeScript } from '@inversifyjs/open-api-2-typescript/v3Dot2';
import { Container } from 'inversify';

import { provideOpenApi } from './provideOpenApi.js';

const GENERATED_API_DIRECTORY_PATH: string = path.join(
  process.cwd(),
  'src',
  'generated',
  'api',
);
const GENERATED_API_SOURCE_PATH: string = path.join(
  GENERATED_API_DIRECTORY_PATH,
  'index.ts',
);

const container: Container = new Container();
const swaggerUiProvider: SwaggerUiProvider = provideOpenApi(container);

const generatedApiSource: string = transformOpenApiToTypeScript(
  swaggerUiProvider.openApiObject,
);

await fs.mkdir(GENERATED_API_DIRECTORY_PATH, { recursive: true });
await fs.writeFile(GENERATED_API_SOURCE_PATH, generatedApiSource, 'utf8');
await new Promise<void>((resolve, reject): void => {
  execFile(
    'oxfmt',
    ['--write', GENERATED_API_SOURCE_PATH],
    (error: Error | null): void => {
      if (error !== null) {
        reject(error);

        return;
      }

      resolve();
    },
  );
});
`;
}
