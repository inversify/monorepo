import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { type StandardSchemaV1 } from '@standard-schema/spec';

import { type ConfigObject } from '../models/ConfigObject.js';
import { type ConfigValidator } from '../models/ConfigValidator.js';
import { InversifyConfigError } from '../models/InversifyConfigError.js';
import { validateConfig } from './validateConfig.js';

describe(validateConfig, () => {
  describe('having a Standard Schema validator', () => {
    describe('when called, and validation succeeds', () => {
      let inputFixture: ConfigObject;
      let outputFixture: { port: number };
      let schemaMock: StandardSchemaV1<{ port: number }>;
      let result: unknown;

      beforeAll(async () => {
        inputFixture = { port: '3000' };
        outputFixture = { port: 3000 };
        schemaMock = {
          ['~standard']: {
            validate: vitest.fn().mockResolvedValueOnce({
              value: outputFixture,
            }),
          },
        } as unknown as StandardSchemaV1<{ port: number }>;

        result = await validateConfig(inputFixture, schemaMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call schema["~standard"].validate()', () => {
        expect(
          schemaMock['~standard'].validate,
        ).toHaveBeenCalledExactlyOnceWith(inputFixture);
      });

      it('should return validated config', () => {
        expect(result).toBe(outputFixture);
      });
    });

    describe('when called, and validation fails', () => {
      let inputFixture: ConfigObject;
      let schemaMock: StandardSchemaV1;
      let result: unknown;

      beforeAll(async () => {
        inputFixture = {};
        schemaMock = {
          ['~standard']: {
            validate: vitest.fn().mockResolvedValueOnce({
              issues: [{ message: 'port is required' }],
            }),
          },
        } as unknown as StandardSchemaV1;

        try {
          await validateConfig(inputFixture, schemaMock);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should throw an InversifyConfigError', () => {
        expect(result).toBeInstanceOf(InversifyConfigError);
        expect((result as Error).message).toBe('port is required');
      });
    });
  });

  describe('having a ConfigValidator', () => {
    describe('when called', () => {
      let inputFixture: ConfigObject;
      let outputFixture: { host: string };
      let validatorMock: ConfigValidator<{ host: string }>;
      let result: unknown;

      beforeAll(async () => {
        inputFixture = { host: 'localhost' };
        outputFixture = { host: 'localhost' };
        validatorMock = {
          validate: vitest.fn().mockResolvedValueOnce(outputFixture),
        };

        result = await validateConfig(inputFixture, validatorMock);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call validator.validate()', () => {
        expect(validatorMock.validate).toHaveBeenCalledExactlyOnceWith(
          inputFixture,
        );
      });

      it('should return validated config', () => {
        expect(result).toBe(outputFixture);
      });
    });
  });
});
