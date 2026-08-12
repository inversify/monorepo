import { beforeAll, describe, expect, it } from 'vitest';

import { generateYarnRcSource } from './generateYarnRcSource.js';

describe(generateYarnRcSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateYarnRcSource();
    });

    it('should enable scripts and the node-modules linker', () => {
      expect(result).toContain('enableScripts: true');
      expect(result).toContain('nodeLinker: node-modules');
    });
  });
});
