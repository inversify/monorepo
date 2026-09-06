import { beforeAll, describe, expect, it } from 'vitest';

import { ProvideOpenApiSourceFixtures } from '../fixtures/ProvideOpenApiSourceFixtures.js';
import { generateProvideOpenApiSource } from './generateProvideOpenApiSource.js';

describe(generateProvideOpenApiSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = ProvideOpenApiSourceFixtures.any;
    });

    it('should generate a provideOpenApi helper that builds and provides SwaggerUiProvider', () => {
      expect(result).toContain(
        "import { SwaggerUiProvider } from '@inversifyjs/http-open-api/v3Dot2';",
      );
      expect(result).toContain("import { type Container } from 'inversify';");
      expect(result).toContain(
        'export function provideOpenApi(container: Container): SwaggerUiProvider',
      );
      expect(result).toContain(
        'const swaggerUiProvider: SwaggerUiProvider = new SwaggerUiProvider({',
      );
      expect(result).toContain("openapi: '3.2.0'");
      expect(result).toContain("path: '/docs'");
      expect(result).toContain('swaggerUiProvider.provide(container);');
      expect(result).toContain('return swaggerUiProvider;');
    });
  });
});
