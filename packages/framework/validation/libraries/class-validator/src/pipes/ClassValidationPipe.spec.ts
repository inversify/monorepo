import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('@inversifyjs/reflect-metadata-utils'));
vitest.mock(import('class-validator'));
vitest.mock(import('class-transformer'));

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
    let pipeMetadataFixture: PipeMetadata;

    beforeAll(() => {
      pipeMetadataFixture = {
        methodName: 'someMethod',
        parameterIndex: 0,
        targetClass: class SomeClass {},
      };
    });

    describe('having an undefined input', () => {
      let inputFixture: undefined;

      beforeAll(() => {
        inputFixture = undefined;
      });

      describe('when called, and getOwnReflectMetadata() returns type Object', () => {
        let result: unknown;

        beforeAll(async () => {
          vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce([Object]);

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

        it('should not call plainToInstance()', () => {
          expect(plainToInstance).not.toHaveBeenCalled();
        });

        it('should not call validate()', () => {
          expect(validate).not.toHaveBeenCalled();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and getOwnReflectMetadata() returns type undefined', () => {
        let result: unknown;

        beforeAll(async () => {
          vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce([undefined]);

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

        it('should not call plainToInstance()', () => {
          expect(plainToInstance).not.toHaveBeenCalled();
        });

        it('should not call validate()', () => {
          expect(validate).not.toHaveBeenCalled();
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });

      describe('when called, and getOwnReflectMetadata() returns a validated type', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let typeFixture: Function;
        let result: unknown;

        beforeAll(async () => {
          typeFixture = class Message {};

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce([typeFixture]);

          try {
            await classValidationPipe.execute(
              inputFixture,
              pipeMetadataFixture,
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
            pipeMetadataFixture.targetClass.prototype,
            'design:paramtypes',
            pipeMetadataFixture.methodName,
          );
        });

        it('should not call plainToInstance()', () => {
          expect(plainToInstance).not.toHaveBeenCalled();
        });

        it('should not call validate()', () => {
          expect(validate).not.toHaveBeenCalled();
        });

        it('should throw an InversifyValidationError', () => {
          const expectedErrorProperties: Partial<InversifyValidationError> = {
            kind: InversifyValidationErrorKind.validationFailed,
            message: expect.stringMatching(
              /Validation failed\. Found nullish value but expected type "Message" at SomeClass\.someMethod\[0\]\./,
            ),
          };

          expect(result).toBeInstanceOf(InversifyValidationError);
          expect(result).toMatchObject(expectedErrorProperties);
        });
      });
    });

    describe('having a null input', () => {
      let inputFixture: null;

      beforeAll(() => {
        inputFixture = null;
      });

      describe('when called, and getOwnReflectMetadata() returns type Object', () => {
        let result: unknown;

        beforeAll(async () => {
          vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce([Object]);

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

        it('should not call plainToInstance()', () => {
          expect(plainToInstance).not.toHaveBeenCalled();
        });

        it('should not call validate()', () => {
          expect(validate).not.toHaveBeenCalled();
        });

        it('should return null', () => {
          expect(result).toBeNull();
        });
      });

      describe('when called, and getOwnReflectMetadata() returns a validated type', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let typeFixture: Function;
        let result: unknown;

        beforeAll(async () => {
          typeFixture = class Message {};

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce([typeFixture]);

          try {
            await classValidationPipe.execute(
              inputFixture,
              pipeMetadataFixture,
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
            pipeMetadataFixture.targetClass.prototype,
            'design:paramtypes',
            pipeMetadataFixture.methodName,
          );
        });

        it('should not call plainToInstance()', () => {
          expect(plainToInstance).not.toHaveBeenCalled();
        });

        it('should not call validate()', () => {
          expect(validate).not.toHaveBeenCalled();
        });

        it('should throw an InversifyValidationError', () => {
          const expectedErrorProperties: Partial<InversifyValidationError> = {
            kind: InversifyValidationErrorKind.validationFailed,
            message: expect.stringMatching(
              /Validation failed\. Found nullish value but expected type "Message" at SomeClass\.someMethod\[0\]\./,
            ),
          };

          expect(result).toBeInstanceOf(InversifyValidationError);
          expect(result).toMatchObject(expectedErrorProperties);
        });
      });
    });

    describe('having a string input', () => {
      let inputFixture: string;

      beforeAll(() => {
        inputFixture = 'hello world';
      });

      describe('when called, and getOwnReflectMetadata() returns type String', () => {
        let result: unknown;

        beforeAll(async () => {
          vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce([String]);

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

        it('should not call plainToInstance()', () => {
          expect(plainToInstance).not.toHaveBeenCalled();
        });

        it('should not call validate()', () => {
          expect(validate).not.toHaveBeenCalled();
        });

        it('should return the input', () => {
          expect(result).toBe(inputFixture);
        });
      });
    });

    describe('having a number input', () => {
      let inputFixture: number;

      beforeAll(() => {
        inputFixture = 42;
      });

      describe('when called, and getOwnReflectMetadata() returns type Number', () => {
        let result: unknown;

        beforeAll(async () => {
          vitest.mocked(getOwnReflectMetadata).mockReturnValueOnce([Number]);

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

        it('should not call plainToInstance()', () => {
          expect(plainToInstance).not.toHaveBeenCalled();
        });

        it('should not call validate()', () => {
          expect(validate).not.toHaveBeenCalled();
        });

        it('should return the input', () => {
          expect(result).toBe(inputFixture);
        });
      });
    });

    describe('having an object input', () => {
      let inputFixture: object;

      beforeAll(() => {
        inputFixture = { content: 'hello world' };
      });

      describe('when called, and getOwnReflectMetadata() returns undefined', () => {
        let result: unknown;

        beforeAll(async () => {
          try {
            await classValidationPipe.execute(
              inputFixture,
              pipeMetadataFixture,
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

      describe('when called, and getOwnReflectMetadata() returns a validated type and validate() returns errors', () => {
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

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce([typeFixture]);
          vitest.mocked(plainToInstance).mockReturnValueOnce(instanceFixture);
          vitest.mocked(validate).mockResolvedValueOnce([errorFixtureMock]);

          errorFixtureMock.toString.mockReturnValueOnce(errorMessageFixture);

          try {
            await classValidationPipe.execute(
              inputFixture,
              pipeMetadataFixture,
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

      describe('when called, and getOwnReflectMetadata() returns a validated type and validate() returns no errors', () => {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
        let typeFixture: Function;
        let instanceFixture: object;

        let result: unknown;

        beforeAll(async () => {
          typeFixture = class Message {};
          instanceFixture = {
            content: 'hello world',
          };

          vitest
            .mocked(getOwnReflectMetadata)
            .mockReturnValueOnce([typeFixture]);
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
});
