import { beforeAll, describe, expect, it, Mocked, vitest } from 'vitest';

import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { Factory } from '../../binding/models/Factory';
import { FactoryBinding } from '../../binding/models/FactoryBinding';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolveFactoryBindingCallback } from './resolveFactoryBindingCallback';

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
