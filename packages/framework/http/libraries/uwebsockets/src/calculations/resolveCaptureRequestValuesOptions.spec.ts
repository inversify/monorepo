import { beforeAll, describe, expect, it } from 'vitest';

import { type CaptureRequestValuesOptions } from '../models/CaptureRequestValuesOptions.js';
import { resolveCaptureRequestValuesOptions } from './resolveCaptureRequestValuesOptions.js';

describe(resolveCaptureRequestValuesOptions, () => {
  describe('having options without url', () => {
    let optionsFixture: CaptureRequestValuesOptions;

    beforeAll(() => {
      optionsFixture = {
        headers: true,
        query: true,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveCaptureRequestValuesOptions(optionsFixture);
      });

      it('should return the same options', () => {
        expect(result).toBe(optionsFixture);
      });
    });
  });

  describe('having url true without query', () => {
    let optionsFixture: CaptureRequestValuesOptions;

    beforeAll(() => {
      optionsFixture = {
        method: true,
        url: true,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveCaptureRequestValuesOptions(optionsFixture);
      });

      it('should return options with query enabled', () => {
        const expected: CaptureRequestValuesOptions = {
          method: true,
          query: true,
          url: true,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having url true and query false', () => {
    let optionsFixture: CaptureRequestValuesOptions;

    beforeAll(() => {
      optionsFixture = {
        query: false,
        url: true,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = resolveCaptureRequestValuesOptions(optionsFixture);
      });

      it('should return options with query enabled', () => {
        const expected: CaptureRequestValuesOptions = {
          query: true,
          url: true,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
