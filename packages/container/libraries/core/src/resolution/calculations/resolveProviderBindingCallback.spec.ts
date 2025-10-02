import { beforeAll, describe, expect, it, Mocked, vitest } from 'vitest';

import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { Provider } from '../../binding/models/Provider';
import { ProviderBinding } from '../../binding/models/ProviderBinding';
import { ResolutionParams } from '../models/ResolutionParams';
import { resolveProviderBindingCallback } from './resolveProviderBindingCallback';

describe(resolveProviderBindingCallback, () => {
  let resolutionParamsFixture: ResolutionParams;

  let providerBindingMock: Mocked<ProviderBinding<Provider<unknown>>>; // eslint-disable-line @typescript-eslint/no-deprecated

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
      isSatisfiedBy: vitest.fn(),
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      provider: vitest.fn(),
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: 'service-id',
      type: bindingTypeValues.Provider,
    };
  });

  describe('when called', () => {
    let providerFixture: Provider<unknown>; // eslint-disable-line @typescript-eslint/no-deprecated

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
      expect(providerBindingMock.provider).toHaveBeenCalledExactlyOnceWith(
        resolutionParamsFixture.context,
      );
    });

    it('should return expected result', () => {
      expect(result).toBe(providerFixture);
    });
  });
});
