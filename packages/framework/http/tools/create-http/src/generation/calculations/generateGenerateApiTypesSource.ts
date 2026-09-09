export function generateGenerateApiTypesSource(): string {
  return `import fs from 'node:fs/promises';
import path from 'node:path';

import { type SwaggerUiProvider } from '@inversifyjs/http-open-api/v3Dot2';
import { transformOpenApiToTypeScript } from '@inversifyjs/open-api-2-typescript/v3Dot2';
import { Container } from 'inversify';
import prettier from 'prettier';

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

const prettierOptions: prettier.Options | null = await prettier.resolveConfig(
  GENERATED_API_SOURCE_PATH,
);

const formattedGeneratedApiSource: string = await prettier.format(
  generatedApiSource,
  {
    ...prettierOptions,
    filepath: GENERATED_API_SOURCE_PATH,
    parser: 'typescript',
  },
);

await fs.mkdir(GENERATED_API_DIRECTORY_PATH, { recursive: true });
await fs.writeFile(
  GENERATED_API_SOURCE_PATH,
  formattedGeneratedApiSource,
  'utf8',
);
`;
}
