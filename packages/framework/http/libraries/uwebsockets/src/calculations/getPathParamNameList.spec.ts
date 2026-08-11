import { beforeAll, describe, expect, it } from 'vitest';

import { getPathParamNameList } from './getPathParamNameList.js';

describe(getPathParamNameList, () => {
  describe('having a path with no params', () => {
    let pathFixture: string;

    beforeAll(() => {
      pathFixture = '/users/list';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getPathParamNameList(pathFixture);
      });

      it('should return an empty array', () => {
        expect(result).toStrictEqual([]);
      });
    });
  });

  describe('having a path with params', () => {
    let pathFixture: string;

    beforeAll(() => {
      pathFixture = '/users/:userId/items/:itemId';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getPathParamNameList(pathFixture);
      });

      it('should return the param names in path order', () => {
        expect(result).toStrictEqual(['userId', 'itemId']);
      });
    });
  });

  describe('having a path with a wildcard and an empty param name', () => {
    let pathFixture: string;

    beforeAll(() => {
      pathFixture = '/users/:userId/*/:';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = getPathParamNameList(pathFixture);
      });

      it('should return the named params only', () => {
        expect(result).toStrictEqual(['userId']);
      });
    });
  });
});
