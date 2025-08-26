import { Newable, ServiceIdentifier } from '@inversifyjs/common';

import { buildInstanceBinding } from '../../binding/calculations/buildInstanceBinding';
import { Binding } from '../../binding/models/Binding';
import { BindingConstraints } from '../../binding/models/BindingConstraints';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { BasePlanParams } from '../models/BasePlanParams';

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
