import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { type Left } from '@inversifyjs/common';

vitest.mock(import('./cloneBindingCache.js'));

import { bindingScopeValues } from '../models/BindingScope.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type Factory } from '../models/Factory.js';
import { type FactoryBinding } from '../models/FactoryBinding.js';
import { cloneBindingCache } from './cloneBindingCache.js';
import { cloneFactoryBinding } from './cloneFactoryBinding.js';

describe(cloneFactoryBinding, () => {
  let factoryBindingFixture: FactoryBinding<Factory<unknown>>;

  beforeAll(() => {
    factoryBindingFixture = {
      cache: {
        isRight: false,
        value: undefined,
      },
      factory: vitest.fn(),
      id: 0,
      isSatisfiedBy: () => true,
      moduleId: 1,
      onActivation: vitest.fn(),
      onDeactivation: vitest.fn(),
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: Symbol(),
      type: bindingTypeValues.Factory,
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

      result = cloneFactoryBinding(factoryBindingFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call cloneBindingCache', () => {
      expect(cloneBindingCache).toHaveBeenCalledExactlyOnceWith(
        factoryBindingFixture.cache,
      );
    });

    it('should return a FactoryBinding', () => {
      const expected: FactoryBinding<Factory<unknown>> = {
        cache: cacheFixture,
        factory: factoryBindingFixture.factory,
        id: factoryBindingFixture.id,
        isSatisfiedBy: factoryBindingFixture.isSatisfiedBy,
        moduleId: factoryBindingFixture.moduleId,
        onActivation: factoryBindingFixture.onActivation,
        onDeactivation: factoryBindingFixture.onDeactivation,
        scope: factoryBindingFixture.scope,
        serviceIdentifier: factoryBindingFixture.serviceIdentifier,
        type: factoryBindingFixture.type,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
