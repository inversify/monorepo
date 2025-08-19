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

import {
  PipeMetadata,
  RequestMethodParameterType,
} from '@inversifyjs/http-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { ZodType } from 'zod';

import { zodValidationMetadataReflectKey } from '../reflectMetadata/data/zodValidationMetadataReflectKey';
import { ZodValidationPipe } from './ZodValidationPipe';

describe(ZodValidationPipe, () => {
  describe('.execute', () => {
    describe('when called', () => {
      let typeMock: Mocked<ZodType>;
      let zodValidationPipe: ZodValidationPipe;

      let inputFixture: unknown;
      let metadataFixture: PipeMetadata;

      let parameterTypeMock: Mocked<ZodType>;

      let result: unknown;

      beforeAll(() => {
        typeMock = {
          safeParse: vitest.fn(),
        } as Partial<Mocked<ZodType>> as Mocked<ZodType>;

        zodValidationPipe = new ZodValidationPipe([typeMock]);

        inputFixture = Symbol();
        metadataFixture = {
          methodName: 'methodName',
          parameterIndex: 0,
          parameterMethodType: RequestMethodParameterType.Body,
          targetClass: class {},
        };

        parameterTypeMock = {
          safeParse: vitest.fn(),
        } as Partial<Mocked<ZodType>> as Mocked<ZodType>;

        vitest
          .mocked(getOwnReflectMetadata)
          .mockReturnValueOnce([[parameterTypeMock]]);

        typeMock.safeParse.mockReturnValueOnce({
          data: inputFixture,
          success: true,
        });

        parameterTypeMock.safeParse.mockReturnValueOnce({
          data: inputFixture,
          success: true,
        });

        result = zodValidationPipe.execute(inputFixture, metadataFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getOwnReflectMetadata()', () => {
        expect(getOwnReflectMetadata).toHaveBeenCalledTimes(1);
        expect(getOwnReflectMetadata).toHaveBeenCalledWith(
          metadataFixture.targetClass,
          zodValidationMetadataReflectKey,
          metadataFixture.methodName,
        );
      });

      it('should call type.safeParse()', () => {
        expect(typeMock.safeParse).toHaveBeenCalledTimes(1);
        expect(typeMock.safeParse).toHaveBeenCalledWith(inputFixture);
      });

      it('should call parameterType.safeParse()', () => {
        expect(parameterTypeMock.safeParse).toHaveBeenCalledTimes(1);
        expect(parameterTypeMock.safeParse).toHaveBeenCalledWith(inputFixture);
      });

      it('should return expected value', () => {
        expect(result).toBe(inputFixture);
      });
    });
  });
});
