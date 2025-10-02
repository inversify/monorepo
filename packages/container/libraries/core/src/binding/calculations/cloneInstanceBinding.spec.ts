import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { Left } from '@inversifyjs/common';

vitest.mock('./cloneBindingCache');

import { bindingScopeValues } from '../models/BindingScope';
import { bindingTypeValues } from '../models/BindingType';
import { InstanceBinding } from '../models/InstanceBinding';
import { cloneBindingCache } from './cloneBindingCache';
import { cloneInstanceBinding } from './cloneInstanceBinding';

describe(cloneInstanceBinding, () => {
  let instanceBindingFixture: InstanceBinding<unknown>;

  beforeAll(() => {
    instanceBindingFixture = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 0,
      implementationType: class {},
      isSatisfiedBy: () => true,
      moduleId: 1,
      onActivation: vitest.fn(),
      onDeactivation: vitest.fn(),
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: Symbol(),
      type: bindingTypeValues.Instance,
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

      result = cloneInstanceBinding(instanceBindingFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call cloneBindingCache', () => {
      expect(cloneBindingCache).toHaveBeenCalledExactlyOnceWith(
        instanceBindingFixture.cache,
      );
    });

    it('should return a InstanceBinding', () => {
      const expected: InstanceBinding<unknown> = {
        cache: cacheFixture,
        id: instanceBindingFixture.id,
        implementationType: instanceBindingFixture.implementationType,
        isSatisfiedBy: instanceBindingFixture.isSatisfiedBy,
        moduleId: instanceBindingFixture.moduleId,
        onActivation: instanceBindingFixture.onActivation,
        onDeactivation: instanceBindingFixture.onDeactivation,
        scope: instanceBindingFixture.scope,
        serviceIdentifier: instanceBindingFixture.serviceIdentifier,
        type: instanceBindingFixture.type,
      };

      expect(result).toStrictEqual(expected);
    });
  });
});
