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

import { PipeMetadata } from '@inversifyjs/framework-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import { StandardSchemaV1 } from '@standard-schema/spec';

import { standardSchemaValidationMetadataReflectKey } from '../reflectMetadata/models/standardSchemaValidationMetadataReflectKey';
import { StandardSchemaValidationPipe } from './StandardSchemaValidationPipe';

describe(StandardSchemaValidationPipe, () => {
  describe('.execute', () => {
    describe('when called', () => {
      let schemaMock: Mocked<StandardSchemaV1>;
      let standardSchemaValidationPipe: StandardSchemaValidationPipe;

      let inputFixture: unknown;
      let metadataFixture: PipeMetadata;

      let parameterSchemaMock: Mocked<StandardSchemaV1>;

      let result: unknown;

      beforeAll(async () => {
        schemaMock = {
          ['~standard']: {
            validate: vitest.fn(),
          } as Partial<Mocked<StandardSchemaV1.Props>>,
        } as Mocked<StandardSchemaV1>;

        standardSchemaValidationPipe = new StandardSchemaValidationPipe([
          schemaMock,
        ]);

        inputFixture = Symbol();
        metadataFixture = {
          methodName: 'methodName',
          parameterIndex: 0,
          targetClass: class {},
        };

        parameterSchemaMock = {
          ['~standard']: {
            validate: vitest.fn(),
          } as Partial<Mocked<StandardSchemaV1.Props>>,
        } as Mocked<StandardSchemaV1>;

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce([[parameterSchemaMock]]);

        vitest.mocked(schemaMock['~standard'].validate).mockReturnValueOnce({
          value: inputFixture,
        });

        vitest
          .mocked(parameterSchemaMock['~standard'].validate)
          .mockReturnValueOnce({
            value: inputFixture,
          });

        result = await standardSchemaValidationPipe.execute(
          inputFixture,
          metadataFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          metadataFixture.targetClass,
          standardSchemaValidationMetadataReflectKey,
          metadataFixture.methodName,
        );
      });

      it('should call type["~standard"].validate()', () => {
        expect(
          schemaMock['~standard'].validate,
        ).toHaveBeenCalledExactlyOnceWith(inputFixture);
      });

      it('should call parameterType["~standard"].validate()', () => {
        expect(
          parameterSchemaMock['~standard'].validate,
        ).toHaveBeenCalledExactlyOnceWith(inputFixture);
      });

      it('should return expected value', () => {
        expect(result).toBe(inputFixture);
      });
    });

    describe('when called, and schema["~standard"].validate() returns StandardSchemaV1.Result with issues', () => {
      let schemaMock: Mocked<StandardSchemaV1>;
      let standardSchemaValidationPipe: StandardSchemaValidationPipe;

      let inputFixture: unknown;
      let metadataFixture: PipeMetadata;
      let standardSchemaIssueFixture: StandardSchemaV1.Issue;

      let parameterTypeMock: Mocked<StandardSchemaV1>;

      let result: unknown;

      beforeAll(async () => {
        schemaMock = {
          ['~standard']: {
            validate: vitest.fn(),
          } as Partial<Mocked<StandardSchemaV1.Props>>,
        } as Mocked<StandardSchemaV1>;

        standardSchemaValidationPipe = new StandardSchemaValidationPipe([
          schemaMock,
        ]);

        inputFixture = Symbol();
        metadataFixture = {
          methodName: 'methodName',
          parameterIndex: 0,
          targetClass: class {},
        };

        standardSchemaIssueFixture = {
          message: 'Validation failed',
        };

        parameterTypeMock = {
          ['~standard']: {
            validate: vitest.fn(),
          } as Partial<Mocked<StandardSchemaV1.Props>>,
        } as Mocked<StandardSchemaV1>;

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce([[parameterTypeMock]]);

        vitest.mocked(schemaMock['~standard'].validate).mockReturnValueOnce({
          issues: [standardSchemaIssueFixture],
        });

        try {
          await standardSchemaValidationPipe.execute(
            inputFixture,
            metadataFixture,
          );
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
          standardSchemaValidationMetadataReflectKey,
          metadataFixture.methodName,
        );
      });

      it('should call type["~standard"].validate()', () => {
        expect(
          schemaMock['~standard'].validate,
        ).toHaveBeenCalledExactlyOnceWith(inputFixture);
      });

      it('should throw InversifyValidationError', () => {
        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toStrictEqual(
          expect.objectContaining<Partial<InversifyValidationError>>({
            kind: InversifyValidationErrorKind.validationFailed,
            message: standardSchemaIssueFixture.message,
          }),
        );
      });
    });
  });
});
