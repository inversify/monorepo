import { beforeAll, describe, expect, it } from 'vitest';

import { basename, isAbsolute } from 'node:path';

import { httpInsightsUiBundleDirectory, httpInsightsUiPath } from './index.js';

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

describe(httpInsightsUiPath, () => {
  describe('when read', () => {
    it('should be the path the insights server uses', () => {
      expect(httpInsightsUiPath).toBe('/.inversify/http-insights-ui');
    });
  });
});
