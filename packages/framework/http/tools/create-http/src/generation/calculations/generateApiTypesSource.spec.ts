import { beforeAll, describe, expect, it } from 'vitest';

import { ApiTypesSourceFixtures } from '../fixtures/ApiTypesSourceFixtures.js';
import { buildGeneratedApiSourceRelativePath } from '../models/generatedApiTypesPath.js';
import { generateApiTypesSource } from './generateApiTypesSource.js';

describe(generateApiTypesSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = ApiTypesSourceFixtures.any;
    });

    it('should generate an OpenAPI to TypeScript script that writes formatted types', () => {
      expect(result).toContain(
        "import { transformOpenApiToTypeScript } from '@inversifyjs/open-api-2-typescript/v3Dot2';",
      );
      expect(result).toContain("import prettier from 'prettier';");
      expect(result).toContain(
        "import { initializeContainer } from './initializeContainer.js';",
      );
      expect(result).toContain(
        "import { provideOpenApi } from './provideOpenApi.js';",
      );
      expect(result).toContain(
        'const container: Container = await initializeContainer();',
      );
      expect(result).toContain(
        'const swaggerUiProvider: SwaggerUiProvider = provideOpenApi(container);',
      );
      expect(result).toContain(
        'transformOpenApiToTypeScript(\n  swaggerUiProvider.openApiObject,',
      );
      expect(result).toContain(
        'prettier.resolveConfig(GENERATED_API_SOURCE_PATH)',
      );
      expect(result).toContain('prettier.format(');
      expect(result).toContain("parser: 'typescript'");
      expect(buildGeneratedApiSourceRelativePath()).toBe(
        'src/generated/api/index.ts',
      );
      expect(result).toContain("'src',");
      expect(result).toContain("'generated',");
      expect(result).toContain("'api',");
      expect(result).toContain("'index.ts'");
      expect(result).toContain('await fs.writeFile(');
    });
  });
});
