import { beforeAll, describe, expect, it } from 'vitest';

import { Binding } from '../models/Binding';
import { bindingScopeValues } from '../models/BindingScope';
import { bindingTypeValues } from '../models/BindingType';
import { stringifyBinding } from './stringifyBinding';

describe(stringifyBinding.name, () => {
  describe.each<[string, Binding<unknown>, string]>([
    [
      'with instance type',
      {
        cache: { isRight: false, value: undefined },
        id: 0,
        implementationType: class Foo {},
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.Instance,
      },
      `[ type: "${bindingTypeValues.Instance}", serviceIdentifier: "service-id", scope: "${bindingScopeValues.Singleton}", implementationType: "Foo" ]`,
    ],
    [
      'with service type',
      {
        id: 1,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        serviceIdentifier: 'service-id',
        targetServiceIdentifier: 'target-service-id',
        type: bindingTypeValues.ServiceRedirection,
      },
      `[ type: "${bindingTypeValues.ServiceRedirection}", serviceIdentifier: "service-id", redirection: "target-service-id" ]`,
    ],
    [
      'with constant value type',
      {
        cache: { isRight: true, value: undefined },
        id: 0,
        isSatisfiedBy: () => true,
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.ConstantValue,
        value: Symbol(),
      },
      `[ type: "${bindingTypeValues.ConstantValue}", serviceIdentifier: "service-id", scope: "${bindingScopeValues.Singleton}" ]`,
    ],
  ])(
    'having a binding %s',
    (_: string, binding: Binding<unknown>, expected: string) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = stringifyBinding(binding);
        });

        it('should return expected result', () => {
          expect(result).toBe(expected);
        });
      });
    },
  );
});
