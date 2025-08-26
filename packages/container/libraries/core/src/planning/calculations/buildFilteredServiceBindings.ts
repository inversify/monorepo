import { Newable, ServiceIdentifier } from '@inversifyjs/common';

import { getBindingId } from '../../binding/actions/getBindingId';
import { Binding } from '../../binding/models/Binding';
import { BindingConstraints } from '../../binding/models/BindingConstraints';
import { BindingScope } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { getClassMetadata } from '../../metadata/calculations/getClassMetadata';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { BasePlanParams } from '../models/BasePlanParams';
import { BasePlanParamsAutobindOptions } from '../models/BasePlanParamsAutobindOptions';

export interface BuildFilteredServiceBindingsOptions {
  customServiceIdentifier?: ServiceIdentifier;
  chained?: boolean;
}

export function buildFilteredServiceBindings(
  params: BasePlanParams,
  bindingConstraints: BindingConstraints,
  options?: BuildFilteredServiceBindingsOptions,
): Binding<unknown>[] {
  const serviceIdentifier: ServiceIdentifier =
    options?.customServiceIdentifier ?? bindingConstraints.serviceIdentifier;

  const serviceBindings: Binding<unknown>[] =
    options?.chained === true
      ? [...params.operations.getBindingsChained(serviceIdentifier)]
      : [...(params.operations.getBindings(serviceIdentifier) ?? [])];

  const filteredBindings: Binding<unknown>[] = serviceBindings.filter(
    (binding: Binding<unknown>): boolean =>
      binding.isSatisfiedBy(bindingConstraints),
  );

  if (
    filteredBindings.length === 0 &&
    params.autobindOptions !== undefined &&
    typeof serviceIdentifier === 'function'
  ) {
    const binding: InstanceBinding<unknown> = buildInstanceBinding(
      params.autobindOptions,
      serviceIdentifier as Newable,
    );

    params.operations.setBinding(binding);

    if (binding.isSatisfiedBy(bindingConstraints)) {
      filteredBindings.push(binding);
    }
  }

  return filteredBindings;
}

function buildInstanceBinding(
  autobindOptions: BasePlanParamsAutobindOptions,
  serviceIdentifier: Newable,
): InstanceBinding<unknown> {
  const classMetadata: ClassMetadata = getClassMetadata(serviceIdentifier);
  const scope: BindingScope = classMetadata.scope ?? autobindOptions.scope;

  return {
    cache: {
      isRight: false,
      value: undefined,
    },
    id: getBindingId(),
    implementationType: serviceIdentifier,
    isSatisfiedBy: () => true,
    moduleId: undefined,
    onActivation: undefined,
    onDeactivation: undefined,
    scope,
    serviceIdentifier,
    type: bindingTypeValues.Instance,
  };
}
