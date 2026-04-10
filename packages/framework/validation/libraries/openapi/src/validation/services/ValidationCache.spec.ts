import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { ValidationCache } from './ValidationCache.js';

class ValidationCacheMock extends ValidationCache<unknown> {
  readonly #createCacheEntryMock: Mock<() => unknown>;

  constructor(createCacheEntryMock: Mock<() => unknown>) {
    super();

    this.#createCacheEntryMock = createCacheEntryMock;
  }

  protected override _createCacheEntry(): unknown {
    return this.#createCacheEntryMock();
  }
}

describe(ValidationCache, () => {
  let createCacheEntryMock: Mock<() => unknown>;
  let validationCache: ValidationCacheMock;

  beforeAll(() => {
    createCacheEntryMock = vitest.fn();
    validationCache = new ValidationCacheMock(createCacheEntryMock);
  });

  describe('.get', () => {
    describe('having a cache with no entries', () => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = validationCache.get('/path', 'get');
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having a cache with an entry', () => {
      let pathFixture: string;
      let methodFixture: string;
      let cacheEntryFixture: unknown;

      beforeAll(() => {
        pathFixture = '/users';
        methodFixture = 'post';
        cacheEntryFixture = Symbol();

        validationCache.set(pathFixture, methodFixture, cacheEntryFixture);
      });

      describe('when called with matching path and method', () => {
        let result: unknown;

        beforeAll(() => {
          result = validationCache.get(pathFixture, methodFixture);
        });

        it('should return the cache entry', () => {
          expect(result).toBe(cacheEntryFixture);
        });
      });

      describe('when called with non-matching path', () => {
        let result: unknown;

        beforeAll(() => {
          result = validationCache.get('/other', methodFixture);
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called with non-matching method', () => {
        let result: unknown;

        beforeAll(() => {
          result = validationCache.get(pathFixture, 'delete');
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  });

  describe('.set', () => {
    describe('when called', () => {
      let pathFixture: string;
      let methodFixture: string;
      let cacheEntryFixture: unknown;

      beforeAll(() => {
        pathFixture = '/items';
        methodFixture = 'put';
        cacheEntryFixture = Symbol();

        validationCache.set(pathFixture, methodFixture, cacheEntryFixture);
      });

      it('should store the entry retrievable via get', () => {
        expect(validationCache.get(pathFixture, methodFixture)).toBe(
          cacheEntryFixture,
        );
      });
    });

    describe('when called with existing path but new method', () => {
      let pathFixture: string;
      let firstMethodFixture: string;
      let secondMethodFixture: string;
      let firstEntryFixture: unknown;
      let secondEntryFixture: unknown;

      beforeAll(() => {
        pathFixture = '/products';
        firstMethodFixture = 'get';
        secondMethodFixture = 'post';
        firstEntryFixture = Symbol();
        secondEntryFixture = Symbol();

        validationCache.set(pathFixture, firstMethodFixture, firstEntryFixture);
        validationCache.set(
          pathFixture,
          secondMethodFixture,
          secondEntryFixture,
        );
      });

      it('should store both entries', () => {
        expect(validationCache.get(pathFixture, firstMethodFixture)).toBe(
          firstEntryFixture,
        );
        expect(validationCache.get(pathFixture, secondMethodFixture)).toBe(
          secondEntryFixture,
        );
      });
    });
  });

  describe('.getOrCreate', () => {
    let freshCache: ValidationCacheMock;
    let freshCreateCacheEntryMock: Mock<() => unknown>;

    beforeAll(() => {
      freshCreateCacheEntryMock = vitest.fn();
      freshCache = new ValidationCacheMock(freshCreateCacheEntryMock);
    });

    describe('when called, and no entry exists', () => {
      let pathFixture: string;
      let methodFixture: string;
      let createdEntryFixture: unknown;
      let result: unknown;

      beforeAll(() => {
        pathFixture = '/orders';
        methodFixture = 'post';
        createdEntryFixture = Symbol();

        freshCreateCacheEntryMock.mockReturnValueOnce(createdEntryFixture);

        result = freshCache.getOrCreate(pathFixture, methodFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call _createCacheEntry()', () => {
        expect(freshCreateCacheEntryMock).toHaveBeenCalledExactlyOnceWith();
      });

      it('should return the created entry', () => {
        expect(result).toBe(createdEntryFixture);
      });

      it('should store the created entry in the cache', () => {
        expect(freshCache.get(pathFixture, methodFixture)).toBe(
          createdEntryFixture,
        );
      });
    });

    describe('when called, and an entry already exists', () => {
      let pathFixture: string;
      let methodFixture: string;
      let existingEntryFixture: unknown;
      let result: unknown;

      beforeAll(() => {
        pathFixture = '/existing';
        methodFixture = 'get';
        existingEntryFixture = Symbol();

        freshCache.set(pathFixture, methodFixture, existingEntryFixture);

        result = freshCache.getOrCreate(pathFixture, methodFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call _createCacheEntry()', () => {
        expect(freshCreateCacheEntryMock).not.toHaveBeenCalled();
      });

      it('should return the existing entry', () => {
        expect(result).toBe(existingEntryFixture);
      });
    });
  });
});
