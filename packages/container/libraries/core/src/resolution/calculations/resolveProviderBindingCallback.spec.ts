import { beforeAll, describe, expect, it, jest } from '@jest/globals';

import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { Provider } from '../../binding/models/Provider';
import { ProviderBinding } from '../../binding/models/ProviderBinding';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolveProviderBindingCallback } from './resolveProviderBindingCallback';

describe(resolveProviderBindingCallback.name, () => {
  let resolutionParamsFixture: ResolutionParams;

  let providerBindingMock: jest.Mocked<ProviderBinding<unknown>>;

  beforeAll(() => {
    resolutionParamsFixture = {
      context: Symbol() as unknown,
    } as Partial<ResolutionParams> as ResolutionParams;

    providerBindingMock = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 1,
      isSatisfiedBy: jest.fn(),
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      provider: jest.fn(),
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: 'service-id',
      type: bindingTypeValues.Provider,
    };
  });

  describe('when called', () => {
    let providerFixture: Provider<unknown>;

    let result: unknown;

    beforeAll(() => {
      providerFixture = async () => undefined;

      providerBindingMock.provider.mockReturnValueOnce(providerFixture);

      result = resolveProviderBindingCallback(
        resolutionParamsFixture,
        providerBindingMock,
      );
    });

    it('should call binding.provider()', () => {
      expect(providerBindingMock.provider).toHaveBeenCalledTimes(1);
      expect(providerBindingMock.provider).toHaveBeenCalledWith(
        resolutionParamsFixture.context,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(providerFixture);
    });
  });
});
