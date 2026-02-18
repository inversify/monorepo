import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { type Left } from '@inversifyjs/common';

vitest.mock(import('./cloneBindingCache.js'));

import { bindingScopeValues } from '../models/BindingScope.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type ConstantValueBinding } from '../models/ConstantValueBinding.js';
import { cloneBindingCache } from './cloneBindingCache.js';
import { cloneConstantValueBinding } from './cloneConstantValueBinding.js';

describe(cloneConstantValueBinding, () => {
  let constantValueBindingFixture: ConstantValueBinding<unknown>;

  beforeAll(() => {
    constantValueBindingFixture = {
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
      type: bindingTypeValues.ConstantValue,
      value: Symbol(),
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

      result = cloneConstantValueBinding(constantValueBindingFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call cloneBindingCache', () => {
      expect(cloneBindingCache).toHaveBeenCalledExactlyOnceWith(
        constantValueBindingFixture.cache,
      );
    });

    it('should return a ConstantValueBinding', () => {
      const expected: ConstantValueBinding<unknown> = {
        cache: cacheFixture,
        id: constantValueBindingFixture.id,
        isSatisfiedBy: constantValueBindingFixture.isSatisfiedBy,
        moduleId: constantValueBindingFixture.moduleId,
        onActivation: constantValueBindingFixture.onActivation,
        onDeactivation: constantValueBindingFixture.onDeactivation,
        scope: constantValueBindingFixture.scope,
        serviceIdentifier: constantValueBindingFixture.serviceIdentifier,
        type: constantValueBindingFixture.type,
        value: constantValueBindingFixture.value,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
