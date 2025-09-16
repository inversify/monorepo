import { beforeAll, describe, expect, it } from 'vitest';

import { ErrorObject } from 'ajv';

import { stringifyAjvErrors } from './stringifyAjvErrors';

describe(stringifyAjvErrors, () => {
  describe('having empty errors', () => {
    let errorFixture: Partial<ErrorObject>;

    beforeAll(() => {
      errorFixture = {};
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = stringifyAjvErrors([errorFixture]);
      });

      it('should return the expected string', () => {
        expect(result).toBe('[schema: -, instance: -]: "-"');
      });
    });
  });

  describe('having errors with all properties', () => {
    let errorFixture: Partial<ErrorObject>;

    beforeAll(() => {
      errorFixture = {
        instancePath: '/instancePathFixture',
        message: 'messageFixture',
        schemaPath: '/schemaPathFixture',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = stringifyAjvErrors([errorFixture]);
      });

      it('should return the expected string', () => {
        expect(result).toBe(
          '[schema: /schemaPathFixture, instance: /instancePathFixture]: "messageFixture"',
        );
      });
    });
  });
});
