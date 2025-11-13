import { beforeAll, describe, expect, it } from 'vitest';

import { concatenateHeaders } from './concatenateHeaders';

describe(concatenateHeaders, () => {
  describe('having lf separated lowercase headers', () => {
    let lowercaseHeaderNameFixture: string;

    let firstValueFixture: string;
    let secondValueFixture: string;

    beforeAll(() => {
      lowercaseHeaderNameFixture = 'set-cookie';

      firstValueFixture = 'firstValue';
      secondValueFixture = 'secondValue';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = concatenateHeaders(
          lowercaseHeaderNameFixture,
          firstValueFixture,
          secondValueFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(`${firstValueFixture}\n${secondValueFixture}`);
      });
    });
  });

  describe('having comma separated lowercase headers', () => {
    let lowercaseHeaderNameFixture: string;

    let firstValueFixture: string;
    let secondValueFixture: string;

    beforeAll(() => {
      lowercaseHeaderNameFixture = 'authorization';

      firstValueFixture = 'firstValue';
      secondValueFixture = 'secondValue';
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = concatenateHeaders(
          lowercaseHeaderNameFixture,
          firstValueFixture,
          secondValueFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(`${firstValueFixture}, ${secondValueFixture}`);
      });
    });
  });
});
