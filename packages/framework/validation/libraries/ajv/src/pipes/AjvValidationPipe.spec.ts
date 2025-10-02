import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');
vitest.mock('../calculations/stringifyAjvErrors');

import { PipeMetadata } from '@inversifyjs/framework-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import Ajv, { AnySchema, ValidationError } from 'ajv';

import { stringifyAjvErrors } from '../calculations/stringifyAjvErrors';
import { ajvValidationMetadataReflectKey } from '../reflectMetadata/models/ajvValidationMetadataReflectKey';
import { AjvValidationPipe } from './AjvValidationPipe';

describe(AjvValidationPipe, () => {
  let ajvMock: Mocked<Ajv>;
  let ajvValidationPipe: AjvValidationPipe;
  let schemaListElemFixture: AnySchema;

  beforeAll(() => {
    ajvMock = {
      errors: null,
      validate: vitest.fn() as unknown,
    } as Partial<Mocked<Ajv>> as Mocked<Ajv>;
    schemaListElemFixture = { type: 'object' };

    ajvValidationPipe = new AjvValidationPipe(ajvMock, [schemaListElemFixture]);
  });

  describe('.execute', () => {
    let inputFixture: unknown;
    let metadataFixture: PipeMetadata;

    beforeAll(() => {
      inputFixture = { test: 'value' };
      metadataFixture = {
        methodName: 'testMethod',
        parameterIndex: 0,
        targetClass: class TestClass {},
      };
    });

    describe('when called, and getOwnReflectMetadata() returns undefined and this._ajv.validate() returns true', () => {
      let result: unknown;

      beforeAll(async () => {
        vitest.mocked(ajvMock.validate).mockReturnValueOnce(true);

        result = await ajvValidationPipe.execute(inputFixture, metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          metadataFixture.targetClass,
          ajvValidationMetadataReflectKey,
          metadataFixture.methodName,
        );
      });

      it('should call ajv.validate()', () => {
        expect(ajvMock.validate).toHaveBeenCalledExactlyOnceWith(
          schemaListElemFixture,
          inputFixture,
        );
      });

      it('should return input unchanged', () => {
        expect(result).toBe(inputFixture);
      });
    });

    describe('when called, and getOwnReflectMetadata() returns undefined and this._ajv.validate() returns false', () => {
      let stringifyAjvErrorsResultFixture: string;

      let result: unknown;

      beforeAll(async () => {
        stringifyAjvErrorsResultFixture = 'error1\nerror2';

        vitest.mocked(ajvMock.validate).mockReturnValueOnce(false);

        vitest
          .mocked(stringifyAjvErrors)
          .mockReturnValueOnce(stringifyAjvErrorsResultFixture);

        try {
          await ajvValidationPipe.execute(inputFixture, metadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          metadataFixture.targetClass,
          ajvValidationMetadataReflectKey,
          metadataFixture.methodName,
        );
      });

      it('should call ajv.validate()', () => {
        expect(ajvMock.validate).toHaveBeenCalledExactlyOnceWith(
          schemaListElemFixture,
          inputFixture,
        );
      });

      it('should call stringifyAjvErrors()', () => {
        expect(stringifyAjvErrors).toHaveBeenCalledExactlyOnceWith([]);
      });

      it('should throw expected Error', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: stringifyAjvErrorsResultFixture,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });

    describe('when called, and getOwnReflectMetadata() returns undefined and this._ajv.validate() returns resolved Promise', () => {
      let result: unknown;

      beforeAll(async () => {
        vitest
          .mocked(
            ajvMock.validate as (
              schemaKeyRef: AnySchema | string,
              data: unknown,
            ) => Promise<unknown>,
          )
          .mockResolvedValueOnce(inputFixture);

        result = await ajvValidationPipe.execute(inputFixture, metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          metadataFixture.targetClass,
          ajvValidationMetadataReflectKey,
          metadataFixture.methodName,
        );
      });

      it('should call ajv.validate()', () => {
        expect(ajvMock.validate).toHaveBeenCalledExactlyOnceWith(
          schemaListElemFixture,
          inputFixture,
        );
      });

      it('should return input unchanged', () => {
        expect(result).toBe(inputFixture);
      });
    });

    describe('when called, and getOwnReflectMetadata() returns undefined and this._ajv.validate() returns rejected Promise', () => {
      let errorFixture: ValidationError;
      let stringifyAjvErrorsResultFixture: string;

      let result: unknown;

      beforeAll(async () => {
        errorFixture = new Ajv.ValidationError([]);
        stringifyAjvErrorsResultFixture = 'error1\nerror2';

        vitest.mocked(ajvMock.validate).mockRejectedValueOnce(errorFixture);

        vitest
          .mocked(stringifyAjvErrors)
          .mockReturnValueOnce(stringifyAjvErrorsResultFixture);

        try {
          await ajvValidationPipe.execute(inputFixture, metadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          metadataFixture.targetClass,
          ajvValidationMetadataReflectKey,
          metadataFixture.methodName,
        );
      });

      it('should call ajv.validate()', () => {
        expect(ajvMock.validate).toHaveBeenCalledExactlyOnceWith(
          schemaListElemFixture,
          inputFixture,
        );
      });

      it('should call stringifyAjvErrors()', () => {
        expect(stringifyAjvErrors).toHaveBeenCalledExactlyOnceWith([]);
      });

      it('should throw expected Error', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: stringifyAjvErrorsResultFixture,
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });

    describe('when called, and getOwnReflectMetadata() returns AnySchema[] and this._ajv.validate() returns true', () => {
      let schemaListMetadataElementFixture: AnySchema;

      let result: unknown;

      beforeAll(async () => {
        schemaListMetadataElementFixture = { type: 'string' };

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce([[schemaListMetadataElementFixture]]);

        vitest
          .mocked(ajvMock.validate)
          .mockReturnValueOnce(true)
          .mockReturnValueOnce(true);

        result = await ajvValidationPipe.execute(inputFixture, metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          metadataFixture.targetClass,
          ajvValidationMetadataReflectKey,
          metadataFixture.methodName,
        );
      });

      it('should call ajv.validate()', () => {
        expect(ajvMock.validate).toHaveBeenCalledTimes(2);
        expect(ajvMock.validate).toHaveBeenNthCalledWith(
          1,
          schemaListElemFixture,
          inputFixture,
        );
        expect(ajvMock.validate).toHaveBeenNthCalledWith(
          2,
          schemaListMetadataElementFixture,
          inputFixture,
        );
      });

      it('should return input', () => {
        expect(result).toBe(inputFixture);
      });
    });
  });
});
