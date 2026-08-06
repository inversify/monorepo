import { beforeAll, describe, expect, it } from 'vitest';

import {
  resolvePackageName,
  resolveProjectPath,
} from './resolveProjectPath.js';

describe(resolveProjectPath, () => {
  describe('having a relative path', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = resolveProjectPath('./demo-app');
      });

      it('should return an absolute path', () => {
        expect(result.startsWith('/')).toBe(true);
        expect(result.endsWith('demo-app')).toBe(true);
      });
    });
  });
});

describe(resolvePackageName, () => {
  describe('having an absolute project path', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = resolvePackageName('/tmp/demo-app');
      });

      it('should return the directory basename', () => {
        expect(result).toBe('demo-app');
      });
    });
  });
});
