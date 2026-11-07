import { beforeAll, describe, expect, it } from 'vitest';

import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type DynamicValueBinding } from '../../binding/models/DynamicValueBinding.js';
import { type ScopedBindingInspection } from '../models/ScopedBindingInspection.js';
import { buildScopedBindingInspection } from './buildScopedBindingInspection.js';

describe(buildScopedBindingInspection, () => {
  describe('having a ScopedBinding', () => {
    let bindingFixture: DynamicValueBinding<unknown>;

    beforeAll(() => {
      bindingFixture = {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: 2,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Request,
        serviceIdentifier: Symbol(),
        type: bindingTypeValues.DynamicValue,
        value: () => undefined,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildScopedBindingInspection(bindingFixture);
      });

      it('should return a ScopedBindingInspection', () => {
        const expected: ScopedBindingInspection<
          typeof bindingTypeValues.DynamicValue
        > = {
          id: 1,
          moduleId: 2,
          scope: bindingScopeValues.Request,
          serviceIdentifier: bindingFixture.serviceIdentifier,
          type: bindingTypeValues.DynamicValue,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
