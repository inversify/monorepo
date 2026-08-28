import { beforeAll, describe, expect, it } from 'vitest';

import { pointerPrefixFromResolutionChain } from './pointerPrefixFromResolutionChain.js';

describe(pointerPrefixFromResolutionChain, () => {
  describe('having an empty chain', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = pointerPrefixFromResolutionChain([]);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a chain whose last canonicalId has no fragment', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = pointerPrefixFromResolutionChain([
          {
            canonicalId: 'urn:inversifyjs:openapi-v3dot2-spec',
          },
        ]);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a chain whose last canonicalId fragment does not start with "/"', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = pointerPrefixFromResolutionChain([
          {
            canonicalId: 'urn:inversifyjs:openapi-v3dot2-spec#anchor',
          },
        ]);
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a chain whose last canonicalId has a JSON pointer fragment', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = pointerPrefixFromResolutionChain([
          {
            canonicalId:
              'urn:inversifyjs:openapi-v3dot2-spec#/components/parameters/First',
          },
          {
            canonicalId:
              'urn:inversifyjs:openapi-v3dot2-spec#/components/parameters/PageParam',
          },
        ]);
      });

      it('should return the last hop JSON pointer without a leading slash', () => {
        expect(result).toBe('components/parameters/PageParam');
      });
    });
  });
});
