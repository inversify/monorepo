import { beforeAll, describe, expect, it } from 'vitest';

import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type ConstantValueBinding } from '../../binding/models/ConstantValueBinding.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { resolveConstantValueBindingCallback } from './resolveConstantValueBindingCallback.js';

describe(resolveConstantValueBindingCallback, () => {
  let resolutionParamsFixture: ResolutionParams;
  let constantValueBindingFixture: ConstantValueBinding<unknown>;

  beforeAll(() => {
    resolutionParamsFixture = {
      context: Symbol() as unknown,
    } as Partial<ResolutionParams> as ResolutionParams;

    constantValueBindingFixture = {
      cache: {
        isRight: false,
        value: undefined,
      },
      id: 1,
      isSatisfiedBy: () => true,
      moduleId: undefined,
      onActivation: undefined,
      onDeactivation: undefined,
      scope: bindingScopeValues.Singleton,
      serviceIdentifier: 'service-id',
      type: bindingTypeValues.ConstantValue,
      value: Symbol(),
    };
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      result = resolveConstantValueBindingCallback(
        resolutionParamsFixture,
        constantValueBindingFixture,
      );
    });

    it('should return expected value', () => {
      expect(result).toBe(constantValueBindingFixture.value);
    });
  });
});
