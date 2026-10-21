import { beforeAll, describe, expect, it } from 'vitest';

import {
  buildSearchWithRequestUrlLike,
  readRequestUrlLike,
} from './requestUrlLike.js';

describe(readRequestUrlLike, () => {
  describe('having a requestUrlLike query parameter', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = readRequestUrlLike('?requestUrlLike=%2Fusers');
      });

      it('should return the decoded value', () => {
        expect(result).toBe('/users');
      });
    });
  });

  describe('having no requestUrlLike query parameter', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = readRequestUrlLike('');
      });

      it('should return an empty string', () => {
        expect(result).toBe('');
      });
    });
  });
});

describe(buildSearchWithRequestUrlLike, () => {
  describe('having a URL fragment and another query parameter', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildSearchWithRequestUrlLike('?page=2', '/users');
      });

      it('should keep the other parameter and set requestUrlLike', () => {
        expect(result).toBe('?page=2&requestUrlLike=%2Fusers');
      });
    });
  });

  describe('having an empty URL fragment', () => {
    describe('when called', () => {
      let result: string;

      beforeAll(() => {
        result = buildSearchWithRequestUrlLike('?requestUrlLike=%2Fusers', '');
      });

      it('should remove requestUrlLike', () => {
        expect(result).toBe('');
      });
    });
  });
});
