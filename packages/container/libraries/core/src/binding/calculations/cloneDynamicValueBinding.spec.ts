import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { type Left } from '@inversifyjs/common';

vitest.mock(import('./cloneBindingCache.js'));

import { bindingScopeValues } from '../models/BindingScope.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type DynamicValueBinding } from '../models/DynamicValueBinding.js';
import { cloneBindingCache } from './cloneBindingCache.js';
import { cloneDynamicValueBinding } from './cloneDynamicValueBinding.js';

describe(cloneDynamicValueBinding, () => {
  let dynamicValueBindingFixture: DynamicValueBinding<unknown>;

  beforeAll(() => {
    dynamicValueBindingFixture = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 0,
      isSatisfiedBy: () => true,
      moduleId: 1,
      onActivation: () => {},
      onDeactivation: () => {},
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: Symbol(),
      type: bindingTypeValues.DynamicValue,
      value: vitest.fn(),
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

      result = cloneDynamicValueBinding(dynamicValueBindingFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call cloneBindingCache', () => {
      expect(cloneBindingCache).toHaveBeenCalledExactlyOnceWith(
        dynamicValueBindingFixture.cache,
      );
    });

    it('should return a DynamicValueBinding', () => {
      const expected: DynamicValueBinding<unknown> = {
        cache: cacheFixture,
        id: dynamicValueBindingFixture.id,
        isSatisfiedBy: dynamicValueBindingFixture.isSatisfiedBy,
        moduleId: dynamicValueBindingFixture.moduleId,
        onActivation: dynamicValueBindingFixture.onActivation,
        onDeactivation: dynamicValueBindingFixture.onDeactivation,
        scope: dynamicValueBindingFixture.scope,
        serviceIdentifier: dynamicValueBindingFixture.serviceIdentifier,
        type: dynamicValueBindingFixture.type,
        value: dynamicValueBindingFixture.value,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
