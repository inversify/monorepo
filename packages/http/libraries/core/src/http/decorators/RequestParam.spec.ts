import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('@inversifyjs/reflect-metadata-utils');

import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { requestParam } from './RequestParam';

describe(requestParam.name, () => {
  describe('having an undefined key', () => {
    describe('when called', () => {
      let targetFixture: object;
      let keyFixture: undefined;
      let indexFixture: number;
      let parameterTypeFixture: RequestMethodParameterType;
      let result: unknown;

      beforeAll(() => {
        targetFixture = {};
        keyFixture = undefined;
        indexFixture = 0;
        parameterTypeFixture = RequestMethodParameterType.QUERY;

        try {
          result = requestParam(parameterTypeFixture)(
            targetFixture,
            keyFixture,
            indexFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should throw an InversifyHttpAdapterError', () => {
        expect(InversifyHttpAdapterError.is(result)).toBe(true);
        expect((result as InversifyHttpAdapterError).kind).toBe(
          InversifyHttpAdapterErrorKind.requestParamIncorrectUse,
        );
      });
    });
  });

  describe('having a string key', () => {
    describe('when called and no previous metadata exists', () => {
      let targetFixture: { [key: string | symbol]: unknown };
      let keyFixture: string;
      let indexFixture: number;
      let parameterTypeFixture: RequestMethodParameterType;

      beforeAll(() => {
        keyFixture = 'keyFixture';
        targetFixture = {
          [keyFixture]: jest.fn(),
        };
        indexFixture = 0;
        parameterTypeFixture = RequestMethodParameterType.QUERY;

        requestParam(parameterTypeFixture)(
          targetFixture,
          keyFixture,
          indexFixture,
        );
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call getReflectMetadata', () => {
        expect(getReflectMetadata).toHaveBeenCalledTimes(1);
        expect(getReflectMetadata).toHaveBeenCalledWith(
          targetFixture[keyFixture],
          controllerMethodParameterMetadataReflectKey,
        );
      });

      it('should call setReflectMetadata', () => {
        expect(setReflectMetadata).toHaveBeenCalledTimes(1);
        expect(setReflectMetadata).toHaveBeenCalledWith(
          targetFixture[keyFixture],
          controllerMethodParameterMetadataReflectKey,
          [
            {
              index: indexFixture,
              parameterName: undefined,
              parameterType: parameterTypeFixture,
            },
          ],
        );
      });
    });

    describe('when called and previous metadata exists', () => {
      let targetFixture: { [key: string | symbol]: unknown };
      let keyFixture: string;
      let indexFixture: number;
      let parameterTypeFixture: RequestMethodParameterType;

      beforeAll(() => {
        keyFixture = 'keyFixture';
        targetFixture = {
          [keyFixture]: jest.fn(),
        };
        indexFixture = 1;
        parameterTypeFixture = RequestMethodParameterType.QUERY;

        (
          getReflectMetadata as jest.Mock<typeof getReflectMetadata>
        ).mockReturnValueOnce([
          {
            index: 0,
            parameterName: 'parameterNameFixture',
            parameterType: RequestMethodParameterType.BODY,
          },
        ]);

        requestParam(parameterTypeFixture)(
          targetFixture,
          keyFixture,
          indexFixture,
        );
      });

      afterAll(() => {
        jest.clearAllMocks();
      });

      it('should call getReflectMetadata', () => {
        expect(getReflectMetadata).toHaveBeenCalledWith(
          targetFixture[keyFixture],
          controllerMethodParameterMetadataReflectKey,
        );
      });

      it('should call setReflectMetadata', () => {
        expect(setReflectMetadata).toHaveBeenCalledWith(
          targetFixture[keyFixture],
          controllerMethodParameterMetadataReflectKey,
          [
            {
              index: 0,
              parameterName: 'parameterNameFixture',
              parameterType: RequestMethodParameterType.BODY,
            },
            {
              index: indexFixture,
              parameterName: undefined,
              parameterType: parameterTypeFixture,
            },
          ],
        );
      });
    });
  });
});
