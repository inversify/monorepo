import { beforeAll, describe, expect, it } from 'vitest';

import path from 'node:path';

import {
  normalizePackageName,
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
        expect(path.isAbsolute(result)).toBe(true);
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

  describe('having a project path with npm-invalid characters', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = resolvePackageName('/tmp/My Cool App!');
      });

      it('should return a normalized package name', () => {
        expect(result).toBe('my-cool-app');
      });
    });
  });
});

describe(normalizePackageName, () => {
  describe('having a name that normalizes to an empty string', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = normalizePackageName('!!!');
      });

      it('should return the fallback package name', () => {
        expect(result).toBe('app');
      });
    });
  });
});
