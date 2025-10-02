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
vitest.mock('class-validator');
vitest.mock('class-transformer');

import { PipeMetadata } from '@inversifyjs/framework-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import { plainToInstance } from 'class-transformer';
import { validate, ValidationError } from 'class-validator';

import { ClassValidationPipe } from './ClassValidationPipe';

describe(ClassValidationPipe, () => {
  let classValidationPipe: ClassValidationPipe;

  beforeAll(() => {
    classValidationPipe = new ClassValidationPipe();
  });

  describe('.execute()', () => {
    let inputFixture: unknown;
    let pipeMetadataFixture: PipeMetadata;

    beforeAll(() => {
      inputFixture = { content: 'hello world' };
      pipeMetadataFixture = {
        methodName: 'someMethod',
        parameterIndex: 0,
        targetClass: class SomeClass {},
      };
    });

    describe('when called, and getOwnReflectMetadata() returns undefined', () => {
      let result: unknown;

      beforeAll(async () => {
        try {
          await classValidationPipe.execute(inputFixture, pipeMetadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          pipeMetadataFixture.targetClass.prototype,
          'design:paramtypes',
          pipeMetadataFixture.methodName,
        );
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.invalidConfiguration,
          message: expect.stringMatching(
            /Param type metadata for SomeClass\.someMethod\[0\] is not defined. Are you enabling "emitDecoratorMetadata" and "experimentalDecorators" Typescript compiler options\?/,
          ),
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });

    describe('when called, and getOwnReflectMetadata() returns type and validate() returns result with errors', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let typeFixture: Function;
      let instanceFixture: object;
      let errorFixtureMock: Mocked<ValidationError>;
      let errorMessageFixture: string;

      let result: unknown;

      beforeAll(async () => {
        typeFixture = class Message {};
        instanceFixture = {
          content: 'hello world',
        };
        errorFixtureMock = {
          toString: vitest.fn(),
        } as Partial<Mocked<ValidationError>> as Mocked<ValidationError>;
        errorMessageFixture = 'Validation failed';

        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce([typeFixture]);
        vitest.mocked(plainToInstance).mockReturnValueOnce(instanceFixture);
        vitest.mocked(validate).mockResolvedValueOnce([errorFixtureMock]);

        errorFixtureMock.toString.mockReturnValueOnce(errorMessageFixture);

        try {
          await classValidationPipe.execute(inputFixture, pipeMetadataFixture);
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          pipeMetadataFixture.targetClass.prototype,
          'design:paramtypes',
          pipeMetadataFixture.methodName,
        );
      });

      it('should call plainToInstance()', () => {
        expect(plainToInstance).toHaveBeenCalledExactlyOnceWith(
          typeFixture,
          inputFixture,
        );
      });

      it('should call validate()', () => {
        expect(validate).toHaveBeenCalledExactlyOnceWith(instanceFixture, {
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
          skipMissingProperties: false,
          skipNullProperties: false,
          skipUndefinedProperties: false,
          stopAtFirstError: false,
          whitelist: true,
        });
      });

      it('should throw an InversifyValidationError', () => {
        const expectedErrorProperties: Partial<InversifyValidationError> = {
          kind: InversifyValidationErrorKind.validationFailed,
          message: expect.stringContaining(errorMessageFixture),
        };

        expect(result).toBeInstanceOf(InversifyValidationError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });

    describe('when called, and getOwnReflectMetadata() returns type and validate() returns result with no errors', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      let typeFixture: Function;
      let instanceFixture: object;

      let result: unknown;

      beforeAll(async () => {
        typeFixture = class Message {};
        instanceFixture = {
          content: 'hello world',
        };

        vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce([typeFixture]);
        vitest.mocked(plainToInstance).mockReturnValueOnce(instanceFixture);
        vitest.mocked(validate).mockResolvedValueOnce([]);

        result = await classValidationPipe.execute(
          inputFixture,
          pipeMetadataFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledExactlyOnceWith(
          pipeMetadataFixture.targetClass.prototype,
          'design:paramtypes',
          pipeMetadataFixture.methodName,
        );
      });

      it('should call validate()', () => {
        expect(validate).toHaveBeenCalledExactlyOnceWith(instanceFixture, {
          forbidNonWhitelisted: true,
          forbidUnknownValues: true,
          skipMissingProperties: false,
          skipNullProperties: false,
          skipUndefinedProperties: false,
          stopAtFirstError: false,
          whitelist: true,
        });
      });

      it('should return expected result', () => {
        expect(result).toBe(instanceFixture);
      });
    });
  });
});
