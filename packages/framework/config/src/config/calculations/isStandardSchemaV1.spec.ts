import { beforeAll, describe, expect, it } from 'vitest';

import { type StandardSchemaV1 } from '@standard-schema/spec';

import { isStandardSchemaV1 } from './isStandardSchemaV1.js';

describe(isStandardSchemaV1, () => {
  describe('having a Standard Schema value', () => {
    describe('when called', () => {
      let schemaFixture: StandardSchemaV1;
      let result: unknown;

      beforeAll(() => {
        schemaFixture = {
          ['~standard']: {
            validate: (): StandardSchemaV1.Result<unknown> => ({
              value: {},
            }),
          },
        } as unknown as StandardSchemaV1;

        result = isStandardSchemaV1(schemaFixture);
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });

  describe('having a ConfigValidator-like value', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isStandardSchemaV1({
          validate: (): unknown => ({}),
        });
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('having a non-object value', () => {
    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isStandardSchemaV1(undefined);
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });
});
