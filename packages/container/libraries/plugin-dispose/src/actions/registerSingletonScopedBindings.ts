import {
  bindingScopeValues,
  type GetPlanOptions,
  type PlanBindingNode,
  type PlanResult,
  type PlanServiceNode,
} from '@inversifyjs/core';

import { isInstanceBindingNode } from '../calculations/isInstanceBindingNode.js';
import { isPlanServiceRedirectionBindingNode } from '../calculations/isPlanServiceRedirectionBindingNode.js';
import { isResolvedValueBindingNode } from '../calculations/isResolvedValueBindingNode.js';
import { type BindingDisposeMetadata } from '../models/BindingDisposeMetadata.js';
import { type SingletonScopedBinding } from '../models/SingletonScopedBinding.js';
import { getPluginDisposeBinding } from './getPluginDisposeBinding.js';
import { setPluginDisposeBinding } from './setPluginDisposeBinding.js';

export function registerSingletonScopedBindings(
  _options: GetPlanOptions,
  result: PlanResult,
): void {
  registerServiceSingletonScopedBindings(result.tree.root, []);
}

function registerServiceSingletonScopedBindings(
  serviceNode: PlanServiceNode,
  singletonDependencies: SingletonScopedBinding[],
): void {
  if (serviceNode.bindings === undefined) {
    return;
  }

  if (Array.isArray(serviceNode.bindings)) {
    for (const binding of serviceNode.bindings) {
      registerSingletonBinding(binding, singletonDependencies);
    }
  } else {
    registerSingletonBinding(serviceNode.bindings, singletonDependencies);
  }
}

function registerSingletonBinding(
  bindingNode: PlanBindingNode,
  singletonDependencies: SingletonScopedBinding[],
): void {
  if (isPlanServiceRedirectionBindingNode(bindingNode)) {
    for (const redirection of bindingNode.redirections) {
      registerSingletonBinding(redirection, singletonDependencies);
    }

    return;
  }

  if (bindingNode.binding.scope === bindingScopeValues.Singleton) {
    const existingMetadata: BindingDisposeMetadata | undefined =
      getPluginDisposeBinding(bindingNode.binding as SingletonScopedBinding);

    if (existingMetadata !== undefined) {
      return;
    }

    setPluginDisposeBinding(bindingNode.binding as SingletonScopedBinding, {
      dependendentBindings: new Set<SingletonScopedBinding>(
        singletonDependencies,
      ),
    });

    singletonDependencies.push(bindingNode.binding as SingletonScopedBinding);
  }

  if (isInstanceBindingNode(bindingNode)) {
    for (const param of bindingNode.constructorParams) {
      if (param !== undefined) {
        registerServiceSingletonScopedBindings(param, [
          ...singletonDependencies,
        ]);
      }
    }

    for (const param of bindingNode.propertyParams.values()) {
      registerServiceSingletonScopedBindings(param, [...singletonDependencies]);
    }

    return;
  }

  if (isResolvedValueBindingNode(bindingNode)) {
    for (const param of bindingNode.params) {
      registerServiceSingletonScopedBindings(param, [...singletonDependencies]);
    }
  }
}
