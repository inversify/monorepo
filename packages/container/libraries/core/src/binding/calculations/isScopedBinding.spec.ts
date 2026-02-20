import { beforeAll, describe, expect, it } from 'vitest';

import { bindingScopeValues } from '../models/BindingScope.js';
import { bindingTypeValues } from '../models/BindingType.js';
import { type ConstantValueBinding } from '../models/ConstantValueBinding.js';
import { type ServiceRedirectionBinding } from '../models/ServiceRedirectionBinding.js';
import { isScopedBinding } from './isScopedBinding.js';

describe(isScopedBinding, () => {
  describe('having a ServiceRedirectionBinding', () => {
    let serviceRedirectionBindingFixture: ServiceRedirectionBinding<unknown>;

    beforeAll(() => {
      serviceRedirectionBindingFixture = {
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        serviceIdentifier: 'service-id',
        targetServiceIdentifier: 'target-service-id',
        type: bindingTypeValues.ServiceRedirection,
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isScopedBinding(serviceRedirectionBindingFixture);
      });

      it('should return false', () => {
        expect(result).toBe(false);
      });
    });
  });

  describe('having a ConstantValueBinding', () => {
    let constantValueBindingFixture: ConstantValueBinding<unknown>;

    beforeAll(() => {
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
        value: 'foo',
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = isScopedBinding(constantValueBindingFixture);
      });

      it('should return true', () => {
        expect(result).toBe(true);
      });
    });
  });
});
