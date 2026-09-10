import { type SourceImport } from '../models/BootstrapSourceModel.js';
import { type ProvideOpenApiSourceModel } from '../models/ProvideOpenApiSourceModel.js';
import { printSourceImport } from './printSourceImport.js';

function printComponentSchemasObject(model: ProvideOpenApiSourceModel): string {
  if (model.componentSchemas.length === 0) {
    return '';
  }

  const schemaEntries: string = model.componentSchemas
    .map(
      (
        componentSchema: ProvideOpenApiSourceModel['componentSchemas'][number],
      ) => `          ${componentSchema.name}: ${componentSchema.identifier},`,
    )
    .join('\n');

  return `
        components: {
          schemas: {
${schemaEntries}
          },
        },`;
}

export function generateProvideOpenApiSource(
  model: ProvideOpenApiSourceModel,
): string {
  const schemaImports: string = model.schemaImports
    .map((schemaImport: SourceImport) => printSourceImport(schemaImport))
    .join('\n');

  return `import { SwaggerUiProvider } from '@inversifyjs/http-open-api/v3Dot2';
import { type Container } from 'inversify';
${schemaImports === '' ? '' : `\n${schemaImports}\n`}
export function provideOpenApi(container: Container): SwaggerUiProvider {
  const swaggerUiProvider: SwaggerUiProvider = new SwaggerUiProvider({
    api: {
      openApiObject: {${printComponentSchemasObject(model)}
        info: {
          title: 'API',
          version: '1.0.0',
        },
        openapi: '3.2.0',
      },
      path: '/docs',
    },
    ui: {
      title: 'API docs',
    },
  });

  swaggerUiProvider.provide(container);

  return swaggerUiProvider;
}
`;
}
