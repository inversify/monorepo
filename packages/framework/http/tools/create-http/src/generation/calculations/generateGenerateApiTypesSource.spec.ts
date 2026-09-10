import { beforeAll, describe, expect, it } from 'vitest';

import { generateGenerateApiTypesSource } from './generateGenerateApiTypesSource.js';

describe(generateGenerateApiTypesSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateGenerateApiTypesSource();
    });

    it('should generate a script that writes TypeScript types without booting the app container', () => {
      expect(result).toContain(
        "import { transformOpenApiToTypeScript } from '@inversifyjs/open-api-2-typescript/v3Dot2';",
      );
      expect(result).toContain("import { Container } from 'inversify';");
      expect(result).toContain(
        "import { provideOpenApi } from './provideOpenApi.js';",
      );
      expect(result).toContain('const container: Container = new Container();');
      expect(result).toContain('provideOpenApi(container)');
      expect(result).toContain('transformOpenApiToTypeScript(');
      expect(result).toContain("path.join(\n  process.cwd(),\n  'src',");
      expect(result).not.toContain('initializeContainer');
    });
  });
});
