import { beforeAll, describe, expect, it } from 'vitest';

import { generateIndexSource } from './generateIndexSource.js';

describe(generateIndexSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateIndexSource();
    });

    it('should generate a top-level await bootstrap entrypoint', () => {
      expect(result).toContain(
        "import { bootstrap } from './app/scripts/bootstrap.js';",
      );
      expect(result).toContain('await bootstrap();');
      expect(result).not.toContain('void bootstrap()');
    });
  });
});
