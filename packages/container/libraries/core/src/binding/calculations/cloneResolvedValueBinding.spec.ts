import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { Left } from '@inversifyjs/common';

vitest.mock('./cloneBindingCache');

import { bindingScopeValues } from '../models/BindingScope';
import { bindingTypeValues } from '../models/BindingType';
import { ResolvedValueBinding } from '../models/ResolvedValueBinding';
import { cloneBindingCache } from './cloneBindingCache';
import { cloneResolvedValueBinding } from './cloneResolvedValueBinding';

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
