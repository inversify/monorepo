import { beforeAll, describe, expect, it, type Mocked, vitest } from 'vitest';

import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type Factory } from '../../binding/models/Factory.js';
import { type FactoryBinding } from '../../binding/models/FactoryBinding.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveFactoryBindingCallback } from './resolveFactoryBindingCallback.js';

describe(resolveFactoryBindingCallback, () => {
  let resolutionParamsFixture: ResolutionParams;

  let factoryValueBindingMock: Mocked<FactoryBinding<Factory<unknown>>>;

  beforeAll(() => {
    resolutionParamsFixture = {
      context: Symbol() as unknown,
    } as Partial<ResolutionParams> as ResolutionParams;

    factoryValueBindingMock = {
      cache: {
        isRight: false,
        value: undefined,
      },
      factory: vitest.fn(),
      id: 1,
      isSatisfiedBy: vitest.fn(),
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: 'service-id',
      type: bindingTypeValues.Factory,
    };
  });

  describe('when called', () => {
    let factoryFixture: () => unknown;

    let result: unknown;

    beforeAll(() => {
      factoryFixture = () => Symbol();

      factoryValueBindingMock.factory.mockReturnValueOnce(factoryFixture);

      result = resolveFactoryBindingCallback(
        resolutionParamsFixture,
        factoryValueBindingMock,
      );
    });

    it('should call factoryValueBinding.factory()', () => {
      expect(factoryValueBindingMock.factory).toHaveBeenCalledExactlyOnceWith(
        resolutionParamsFixture.context,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(factoryFixture);
    });
  });
});
