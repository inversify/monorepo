import { beforeAll, describe, expect, it } from 'vitest';

import { basename, isAbsolute } from 'node:path';

import { httpInsightsUiBundleDirectory } from './index.js';

describe(httpInsightsUiBundleDirectory, () => {
  describe('when read', () => {
    let bundleDirectory: string;

    beforeAll(() => {
      bundleDirectory = httpInsightsUiBundleDirectory;
    });

    it('should point at the dist directory', () => {
      expect(isAbsolute(bundleDirectory)).toBe(true);
      expect(basename(bundleDirectory)).toBe('dist');
    });
  });
});
