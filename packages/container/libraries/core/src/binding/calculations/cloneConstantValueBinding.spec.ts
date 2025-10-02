import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

import { Left } from '@inversifyjs/common';

vitest.mock('./cloneBindingCache');

import { bindingScopeValues } from '../models/BindingScope';
import { bindingTypeValues } from '../models/BindingType';
import { ConstantValueBinding } from '../models/ConstantValueBinding';
import { cloneBindingCache } from './cloneBindingCache';
import { cloneConstantValueBinding } from './cloneConstantValueBinding';

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
