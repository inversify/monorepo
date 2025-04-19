import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/reflect-metadata-utils');

import {
  getReflectMetadata,
  setReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { InversifyHttpAdapterError } from '../../error/models/InversifyHttpAdapterError';
import { InversifyHttpAdapterErrorKind } from '../../error/models/InversifyHttpAdapterErrorKind';
import { controllerMethodParameterMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodParameterMetadataReflectKey';
import { controllerMethodUseNativeHandlerMetadataReflectKey } from '../../reflectMetadata/data/controllerMethodUseNativeHandlerMetadataReflectKey';
import { ControllerMethodParameterMetadata } from '../../routerExplorer/model/ControllerMethodParameterMetadata';
import { RequestMethodParameterType } from '../models/RequestMethodParameterType';
import { requestParam } from './requestParam';

describe(requestParam.name, () => {
  describe('having a parameterType RESPONSE or NEXT', () => {
    describe('when called', () => {
      let targetFixture: { [key: string | symbol]: unknown };
      let keyFixture: string;
      let indexFixture: number;
      let controllerMethodParameterMetadataFixture: ControllerMethodParameterMetadata;

      beforeAll(() => {
        keyFixture = 'keyFixture';
        targetFixture = {
          [keyFixture]: vitest.fn(),
        };
        indexFixture = 0;
        controllerMethodParameterMetadataFixture = {
          parameterType: RequestMethodParameterType.RESPONSE,
          pipeList: [],
        };

        requestParam(controllerMethodParameterMetadataFixture)(
          targetFixture,
          keyFixture,
          indexFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call setReflectMetadata', () => {
        expect(setReflectMetadata).toHaveBeenCalledTimes(2);
        expect(setReflectMetadata).toHaveBeenCalledWith(
          targetFixture[keyFixture],
          controllerMethodParameterMetadataReflectKey,
          [controllerMethodParameterMetadataFixture],
        );
        expect(setReflectMetadata).toHaveBeenCalledWith(
          targetFixture[keyFixture],
          controllerMethodUseNativeHandlerMetadataReflectKey,
          true,
        );
      });
    });
  });

  describe('having an undefined key', () => {
    describe('when called', () => {
      let targetFixture: object;
      let keyFixture: undefined;
      let indexFixture: number;
      let controllerMethodParameterMetadataFixture: ControllerMethodParameterMetadata;
      let result: unknown;

      beforeAll(() => {
        targetFixture = {};
        keyFixture = undefined;
        indexFixture = 0;
        controllerMethodParameterMetadataFixture = {
          parameterType: RequestMethodParameterType.QUERY,
          pipeList: [],
        };

        try {
          result = requestParam(controllerMethodParameterMetadataFixture)(
            targetFixture,
            keyFixture,
            indexFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      afterAll(() => {
        vitest.clearAllMocks();
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
      let controllerMethodParameterMetadataFixture: ControllerMethodParameterMetadata;

      beforeAll(() => {
        keyFixture = 'keyFixture';
        targetFixture = {
          [keyFixture]: vitest.fn(),
        };
        indexFixture = 2;
        controllerMethodParameterMetadataFixture = {
          parameterType: RequestMethodParameterType.QUERY,
          pipeList: [],
        };

        requestParam(controllerMethodParameterMetadataFixture)(
          targetFixture,
          keyFixture,
          indexFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getReflectMetadata', () => {
        expect(getReflectMetadata).toHaveBeenCalledTimes(1);
        expect(getReflectMetadata).toHaveBeenCalledWith(
          targetFixture[keyFixture],
          controllerMethodParameterMetadataReflectKey,
        );
      });

      it('should call setReflectMetadata', () => {
        const expectedControllerMethodParameterMetadata: (
          | ControllerMethodParameterMetadata
          | undefined
        )[] = [];
        expectedControllerMethodParameterMetadata[indexFixture] =
          controllerMethodParameterMetadataFixture;

        expect(setReflectMetadata).toHaveBeenCalledTimes(1);
        expect(setReflectMetadata).toHaveBeenCalledWith(
          targetFixture[keyFixture],
          controllerMethodParameterMetadataReflectKey,
          expectedControllerMethodParameterMetadata,
        );
      });
    });

    describe('when called and previous metadata exists', () => {
      let targetFixture: { [key: string | symbol]: unknown };
      let keyFixture: string;
      let indexFixture: number;
      let controllerMethodParameterMetadataFixture: ControllerMethodParameterMetadata;

      beforeAll(() => {
        keyFixture = 'keyFixture';
        targetFixture = {
          [keyFixture]: vitest.fn(),
        };
        indexFixture = 2;
        controllerMethodParameterMetadataFixture = {
          parameterType: RequestMethodParameterType.QUERY,
          pipeList: [],
        };

        vitest.mocked(getReflectMetadata).mockReturnValueOnce([
          {
            parameterName: 'parameterNameFixture',
            parameterType: RequestMethodParameterType.BODY,
            pipeList: [],
          },
        ]);

        requestParam(controllerMethodParameterMetadataFixture)(
          targetFixture,
          keyFixture,
          indexFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call getReflectMetadata', () => {
        expect(getReflectMetadata).toHaveBeenCalledWith(
          targetFixture[keyFixture],
          controllerMethodParameterMetadataReflectKey,
        );
      });

      it('should call setReflectMetadata', () => {
        const expectedControllerMethodParameterMetadata: (
          | ControllerMethodParameterMetadata
          | undefined
        )[] = [
          {
            parameterName: 'parameterNameFixture',
            parameterType: RequestMethodParameterType.BODY,
            pipeList: [],
          },
        ];
        expectedControllerMethodParameterMetadata[indexFixture] =
          controllerMethodParameterMetadataFixture;

        expect(setReflectMetadata).toHaveBeenCalledWith(
          targetFixture[keyFixture],
          controllerMethodParameterMetadataReflectKey,
          expectedControllerMethodParameterMetadata,
        );
      });
    });
  });
});
