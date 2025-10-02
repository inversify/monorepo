import { beforeAll, describe, expect, it, Mocked, vitest } from 'vitest';

import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { DynamicValueBinding } from '../../binding/models/DynamicValueBinding';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolveDynamicValueBindingCallback } from './resolveDynamicValueBindingCallback';

describe(resolveDynamicValueBindingCallback, () => {
  let resolutionParamsFixture: ResolutionParams;

  let dynamicValueBindingMock: Mocked<DynamicValueBinding<unknown>>;

  beforeAll(() => {
    resolutionParamsFixture = {
      context: Symbol() as unknown,
    } as Partial<ResolutionParams> as ResolutionParams;

    dynamicValueBindingMock = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 1,
      isSatisfiedBy: vitest.fn(),
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: 'service-id',
      type: bindingTypeValues.DynamicValue,
      value: vitest.fn(),
    };
  });

  describe('when called', () => {
    let dynamicValueFixture: unknown;

    let result: unknown;

    beforeAll(() => {
      dynamicValueFixture = Symbol();

      dynamicValueBindingMock.value.mockReturnValueOnce(dynamicValueFixture);

      result = resolveDynamicValueBindingCallback(
        resolutionParamsFixture,
        dynamicValueBindingMock,
      );
    });

    it('should call dynamicValueBinding.value()', () => {
      expect(dynamicValueBindingMock.value).toHaveBeenCalledExactlyOnceWith(
        resolutionParamsFixture.context,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(dynamicValueFixture);
    });
  });
});
