import { beforeAll, describe, expect, it } from 'vitest';

import { readServiceIdentifier } from './readServiceIdentifier.js';

describe(readServiceIdentifier, () => {
  describe('when called', () => {
    describe('having a class', () => {
      class HandlerFixture {}

      let result: unknown;

      beforeAll(() => {
        result = readServiceIdentifier(HandlerFixture);
      });

      it('should return the class', () => {
        expect(result).toBe(HandlerFixture);
      });
    });

    describe('having a string', () => {
      let result: unknown;

      beforeAll(() => {
        result = readServiceIdentifier('handler');
      });

      it('should return the string', () => {
        expect(result).toBe('handler');
      });
    });

    describe('having a symbol', () => {
      let identifierFixture: symbol;
      let result: unknown;

      beforeAll(() => {
        identifierFixture = Symbol('handler');
        result = readServiceIdentifier(identifierFixture);
      });

      it('should return the symbol', () => {
        expect(result).toBe(identifierFixture);
      });
    });

    describe('having a value that is not a service identifier', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          readServiceIdentifier(1);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw', () => {
        expect((result as Error).message).toBe(
          'Handler is not a service identifier',
        );
      });
    });
  });
});
