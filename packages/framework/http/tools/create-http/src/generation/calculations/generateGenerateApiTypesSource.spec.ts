import { beforeAll, describe, expect, it } from 'vitest';

import { generateGenerateApiTypesSource } from './generateGenerateApiTypesSource.js';

describe(generateGenerateApiTypesSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateGenerateApiTypesSource();
    });

    it('should generate a script that boots the container and writes TypeScript types', () => {
      expect(result).toContain(
        "import { transformOpenApiToTypeScript } from '@inversifyjs/open-api-2-typescript/v3Dot2';",
      );
      expect(result).toContain(
        "import { initializeContainer } from './initializeContainer.js';",
      );
      expect(result).toContain(
        "import { provideOpenApi } from './provideOpenApi.js';",
      );
      expect(result).toContain('transformOpenApiToTypeScript(');
      expect(result).toContain("path.join(\n  process.cwd(),\n  'src',");
    });
  });
});
