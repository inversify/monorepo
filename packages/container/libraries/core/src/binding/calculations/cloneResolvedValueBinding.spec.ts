import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { type Left } from '@inversifyjs/common';

vitest.mock(import('./cloneBindingCache.js'));

import { bindingScopeValues } from '../models/BindingScope.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type ResolvedValueBinding } from '../models/ResolvedValueBinding.js';
import { cloneBindingCache } from './cloneBindingCache.js';
import { cloneResolvedValueBinding } from './cloneResolvedValueBinding.js';

describe(cloneResolvedValueBinding, () => {
  let resolvedValueBindingFixture: ResolvedValueBinding<unknown>;

  beforeAll(() => {
    resolvedValueBindingFixture = {
      cache: {
        isRight: false,
        value: undefined,
      },
      factory: vitest.fn(),
      id: 0,
      isSatisfiedBy: () => true,
      metadata: {
        arguments: [],
      },
      moduleId: 1,
      onActivation: vitest.fn(),
      onDeactivation: vitest.fn(),
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: Symbol(),
      type: bindingTypeValues.ResolvedValue,
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

      result = cloneResolvedValueBinding(resolvedValueBindingFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call cloneBindingCache', () => {
      expect(cloneBindingCache).toHaveBeenCalledExactlyOnceWith(
        resolvedValueBindingFixture.cache,
      );
    });

    it('should return a ResolvedValueBinding', () => {
      const expected: ResolvedValueBinding<unknown> = {
        cache: cacheFixture,
        factory: resolvedValueBindingFixture.factory,
        id: resolvedValueBindingFixture.id,
        isSatisfiedBy: resolvedValueBindingFixture.isSatisfiedBy,
        metadata: resolvedValueBindingFixture.metadata,
        moduleId: resolvedValueBindingFixture.moduleId,
        onActivation: resolvedValueBindingFixture.onActivation,
        onDeactivation: resolvedValueBindingFixture.onDeactivation,
        scope: resolvedValueBindingFixture.scope,
        serviceIdentifier: resolvedValueBindingFixture.serviceIdentifier,
        type: resolvedValueBindingFixture.type,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
