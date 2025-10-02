import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { Left } from '@inversifyjs/common';

vitest.mock('./cloneBindingCache');

import { bindingScopeValues } from '../models/BindingScope';
import { bindingTypeValues } from '../models/BindingType';
import { Provider } from '../models/Provider';
import { ProviderBinding } from '../models/ProviderBinding';
import { cloneBindingCache } from './cloneBindingCache';
import { cloneProviderBinding } from './cloneProviderBinding';

describe(cloneProviderBinding, () => {
  let providerBindingFixture: ProviderBinding<Provider<unknown>>; // eslint-disable-line @typescript-eslint/no-deprecated

  beforeAll(() => {
    providerBindingFixture = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 0,
      isSatisfiedBy: () => true,
      moduleId: 1,
      onActivation: vitest.fn(),
      onDeactivation: vitest.fn(),
      provider: vitest.fn(),
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: Symbol(),
      type: bindingTypeValues.Provider,
    };
  });

  describe('when called', () => {
    let cacheFixture: Left<undefined>;

    let result: unknown;

    beforeAll(() => {
      cacheFixture = {
        isRight: false,
        value: undefined,
      };

      vitest.mocked(cloneBindingCache).mockReturnValueOnce(cacheFixture);

      result = cloneProviderBinding(providerBindingFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call cloneBindingCache', () => {
      expect(cloneBindingCache).toHaveBeenCalledExactlyOnceWith(
        providerBindingFixture.cache,
      );
    });

    it('should return a ProviderBinding', () => {
      // eslint-disable-next-line @typescript-eslint/no-deprecated
      const expected: ProviderBinding<Provider<unknown>> = {
        cache: cacheFixture,
        id: providerBindingFixture.id,
        isSatisfiedBy: providerBindingFixture.isSatisfiedBy,
        moduleId: providerBindingFixture.moduleId,
        onActivation: providerBindingFixture.onActivation,
        onDeactivation: providerBindingFixture.onDeactivation,
        provider: providerBindingFixture.provider,
        scope: providerBindingFixture.scope,
        serviceIdentifier: providerBindingFixture.serviceIdentifier,
        type: providerBindingFixture.type,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
