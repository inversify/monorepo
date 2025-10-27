import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('@inversifyjs/prototype-utils');

import { findInPrototypeChain } from '@inversifyjs/prototype-utils';

import { RequestMethodParameterType } from '../../http/models/RequestMethodParameterType';
import { ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata';
import { getControllerMethodParameterMetadataList } from './getControllerMethodParameterMetadataList';

describe(getControllerMethodParameterMetadataList, () => {
  describe('when called, and findInPrototypeChain() returns undefined', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';

      vitest.mocked(findInPrototypeChain).mockReturnValueOnce(undefined);

      result = getControllerMethodParameterMetadataList(
        controllerFixture,
        controllerMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call findInPrototypeChain()', () => {
      expect(findInPrototypeChain).toHaveBeenCalledExactlyOnceWith(
        controllerFixture,
        expect.any(Function),
      );
    });

    it('should return an empty array', () => {
      expect(result).toStrictEqual([]);
    });
  });

  describe('when called, and findInPrototypeChain() returns an array', () => {
    let controllerFixture: NewableFunction;
    let controllerMethodKeyFixture: string | symbol;
    let parameterMetadataListFixture: ControllerMethodParameterMetadata[];
    let result: unknown;

    beforeAll(() => {
      controllerFixture = class Test {};
      controllerMethodKeyFixture = 'testMethod';
      parameterMetadataListFixture = [
        {
          parameterName: 'userId',
          parameterType: RequestMethodParameterType.Params,
          pipeList: [],
        },
      ];

      vitest
        .mocked(findInPrototypeChain)
        .mockReturnValueOnce(parameterMetadataListFixture);

      result = getControllerMethodParameterMetadataList(
        controllerFixture,
        controllerMethodKeyFixture,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call findInPrototypeChain()', () => {
      expect(findInPrototypeChain).toHaveBeenCalledExactlyOnceWith(
        controllerFixture,
        expect.any(Function),
      );
    });

    it('should return an array', () => {
      expect(result).toBe(parameterMetadataListFixture);
    });
  });
});
