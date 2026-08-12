import { beforeAll, describe, expect, it } from 'vitest';

import { generateYarnRcSource } from './generateYarnRcSource.js';

describe(generateYarnRcSource, () => {
  describe('when called', () => {
    let result: string;

    beforeAll(() => {
      result = generateYarnRcSource();
    });

    it('should disable scripts and keep the node-modules linker', () => {
      expect(result)
        .toBe(`# Disable third-party install scripts by default; opt in packages that need native builds via package.json dependenciesMeta.
enableScripts: false
nodeLinker: node-modules
`);
      expect(result).not.toContain('dependenciesMeta:');
    });
  });
});
