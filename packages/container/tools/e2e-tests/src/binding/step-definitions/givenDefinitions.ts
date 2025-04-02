import { Given } from '@cucumber/cucumber';
import { Newable } from '@inversifyjs/common';
import {
  BindInFluentSyntax,
  BindingIdentifier,
  BindInWhenOnFluentSyntax,
  BindOnFluentSyntax,
  BindWhenFluentSyntax,
  BindWhenOnFluentSyntax,
  Container,
  ResolvedValueInjectOptions,
} from '@inversifyjs/container';
import {
  BindingActivation,
  BindingScope,
  bindingScopeValues,
  MetadataName,
  MetadataTag,
} from '@inversifyjs/core';

import { defaultAlias } from '../../common/models/defaultAlias';
import { InversifyWorld } from '../../common/models/InversifyWorld';
import { DualWieldSwordsman } from '../../warrior/models/DualWieldSwordsman';
import { setBinding } from '../actions/setBinding';
import { BindingParameterKind } from '../models/BindingParameterKind';

function bindInScope(
  scope: BindingScope,
): (
  bindInFluentSyntax: BindInFluentSyntax<unknown>,
) => BindWhenOnFluentSyntax<unknown> {
  return (
    bindInFluentSyntax: BindInFluentSyntax<unknown>,
  ): BindWhenOnFluentSyntax<unknown> => {
    switch (scope) {
      case bindingScopeValues.Request:
        return bindInFluentSyntax.inRequestScope();

      case bindingScopeValues.Singleton:
        return bindInFluentSyntax.inSingletonScope();

      case bindingScopeValues.Transient:
        return bindInFluentSyntax.inTransientScope();
    }
  };
}

function bindWhenNamed(
  name: MetadataName,
): (
  bindWhenFluentSyntax: BindWhenFluentSyntax<unknown>,
) => BindOnFluentSyntax<unknown> {
  return (
    bindWhenFluentSyntax: BindWhenFluentSyntax<unknown>,
  ): BindOnFluentSyntax<unknown> => {
    return bindWhenFluentSyntax.whenNamed(name);
  };
}

function bindWhenTagged(
  tag: MetadataTag,
  tagValue: unknown,
): (
  bindWhenFluentSyntax: BindWhenFluentSyntax<unknown>,
) => BindOnFluentSyntax<unknown> {
  return (
    bindWhenFluentSyntax: BindWhenFluentSyntax<unknown>,
  ): BindOnFluentSyntax<unknown> => {
    return bindWhenFluentSyntax.whenTagged(tag, tagValue);
  };
}

function bindOnActivation(
  activation: BindingActivation,
): (
  bindOnFluentSyntax: BindOnFluentSyntax<unknown>,
) => BindWhenFluentSyntax<unknown> {
  return (
    bindOnFluentSyntax: BindOnFluentSyntax<unknown>,
  ): BindWhenFluentSyntax<unknown> => {
    return bindOnFluentSyntax.onActivation(activation);
  };
}

function givenBindingToConstantValue(
  this: InversifyWorld,
  serviceId: string,
  bindingAlias?: string,
): void {
  const parsedBindingAlias: string = bindingAlias ?? defaultAlias;
  const bindingValue: unknown = Symbol();

  setBinding.bind(this)(parsedBindingAlias, {
    bind: (container: Container): BindingIdentifier =>
      container.bind(serviceId).toConstantValue(bindingValue).getIdentifier(),
    kind: BindingParameterKind.constantValue,
    serviceIdentifier: serviceId,
    value: bindingValue,
  });
}

function givenBindingToDynamicValue(
  this: InversifyWorld,
  serviceId: string,
  scope?: BindingScope,
  bindingAlias?: string,
): void {
  const parsedBindingScope: BindingScope =
    scope ?? bindingScopeValues.Singleton;
  const parsedBindingAlias: string = bindingAlias ?? defaultAlias;

  setBinding.bind(this)(parsedBindingAlias, {
    bind: (container: Container): BindingIdentifier =>
      bindInScope(parsedBindingScope)(
        container.bind(serviceId).toDynamicValue(() => Symbol()),
      ).getIdentifier(),
    kind: BindingParameterKind.dynamicValue,
    serviceIdentifier: serviceId,
  });
}

function givenBindingToResolvedValue(
  this: InversifyWorld,
  serviceId: string,
  injections: ResolvedValueInjectOptions<unknown>[],
  bindingAlias: string | undefined,
): void {
  const parsedBindingAlias: string = bindingAlias ?? defaultAlias;

  setBinding.bind(this)(parsedBindingAlias, {
    bind: (container: Container): BindingIdentifier =>
      container
        .bind(serviceId)
        .toResolvedValue((...args: unknown[]) => args, injections)
        .getIdentifier(),
    kind: BindingParameterKind.dynamicValue,
    serviceIdentifier: serviceId,
  });
}

function givenDualWieldSwordmanTypeBinding(
  this: InversifyWorld,
  serviceId: string,
  bindingAlias?: string,
): void {
  const parsedBindingAlias: string = bindingAlias ?? defaultAlias;

  setBinding.bind(this)(parsedBindingAlias, {
    bind: (container: Container): BindingIdentifier =>
      container.bind(serviceId).to(DualWieldSwordsman).getIdentifier(),
    kind: BindingParameterKind.instance,
    serviceIdentifier: serviceId,
  });
}

function givenTypeBinding(
  this: InversifyWorld,
  type: Newable,
  bindInScope?: (
    bindInFluentSyntax: BindInFluentSyntax<unknown>,
  ) => BindWhenOnFluentSyntax<unknown>,
  bindWhenConstraint?: (
    bindWhenFluentSyntax: BindWhenFluentSyntax<unknown>,
  ) => BindOnFluentSyntax<unknown>,
  bindOnEvent?: (
    bindOnFluentSyntax: BindOnFluentSyntax<unknown>,
  ) => BindWhenFluentSyntax<unknown>,
  bindingAlias?: string,
  serviceIdentifier?: string,
): void {
  const parsedBindingAlias: string = bindingAlias ?? defaultAlias;

  setBinding.bind(this)(parsedBindingAlias, {
    bind: (container: Container): BindingIdentifier => {
      const bindInWhenOnSyntax: BindInWhenOnFluentSyntax<unknown> =
        serviceIdentifier === undefined
          ? container.bind(type).toSelf()
          : container.bind(serviceIdentifier).to(type);

      const bindWhenOnSyntax: BindWhenOnFluentSyntax<unknown> =
        bindInScope === undefined
          ? bindInWhenOnSyntax
          : bindInScope(bindInWhenOnSyntax);

      const bindOnSyntax: BindOnFluentSyntax<unknown> =
        bindWhenConstraint === undefined
          ? bindWhenOnSyntax
          : bindWhenConstraint(bindWhenOnSyntax);

      if (bindOnEvent === undefined) {
        return bindOnSyntax.getIdentifier();
      }

      return bindOnEvent(bindOnSyntax).getIdentifier();
    },
    kind: BindingParameterKind.instance,
    serviceIdentifier: serviceIdentifier ?? type,
  });
}

Given<InversifyWorld>(
  'a service {string} binding to constant value',
  function (serviceId: string): void {
    givenBindingToConstantValue.bind(this)(serviceId);
  },
);

Given<InversifyWorld>(
  'a service {string} binding {string} to constant value',
  function (serviceId: string, bindingAlias: string): void {
    givenBindingToConstantValue.bind(this)(serviceId, bindingAlias);
  },
);

Given<InversifyWorld>(
  'a service {string} binding to dynamic value in {bindingScope} scope',
  function (serviceId: string, scope: BindingScope): void {
    givenBindingToDynamicValue.bind(this)(serviceId, scope);
  },
);

Given<InversifyWorld>(
  'a service {string} resolved value binding as {string} depending on {stringList}',
  function (
    serviceId: string,
    bindingAlias: string,
    injections: string[],
  ): void {
    givenBindingToResolvedValue.bind(this)(serviceId, injections, bindingAlias);
  },
);

Given<InversifyWorld>(
  'a service {string} dual wield swordsman type binding',
  function (serviceId: string): void {
    givenDualWieldSwordmanTypeBinding.bind(this)(serviceId);
  },
);

Given<InversifyWorld>(
  'a {warriorRelatedType} type binding as {string}',
  function (warriorRelatedType: Newable, bindingAlias: string): void {
    givenTypeBinding.bind(this)(
      warriorRelatedType,
      undefined,
      undefined,
      undefined,
      bindingAlias,
    );
  },
);

Given<InversifyWorld>(
  'a {warriorRelatedType} type binding as {string} in {bindingScope} scope',
  function (
    warriorRelatedType: Newable,
    bindingAlias: string,
    scope: BindingScope,
  ): void {
    givenTypeBinding.bind(this)(
      warriorRelatedType,
      bindInScope(scope),
      undefined,
      undefined,
      bindingAlias,
    );
  },
);

Given<InversifyWorld>(
  'a service {string} {warriorRelatedType} type binding as {string}',
  function (
    serviceId: string,
    warriorRelatedType: Newable,
    bindingAlias: string,
  ): void {
    givenTypeBinding.bind(this)(
      warriorRelatedType,
      undefined,
      undefined,
      undefined,
      bindingAlias,
      serviceId,
    );
  },
);

Given<InversifyWorld>(
  'a service {string} {warriorRelatedType} type binding as {string} when named {string}',
  function (
    serviceId: string,
    warriorRelatedType: Newable,
    bindingAlias: string,
    name: string,
  ): void {
    givenTypeBinding.bind(this)(
      warriorRelatedType,
      undefined,
      bindWhenNamed(name),
      undefined,
      bindingAlias,
      serviceId,
    );
  },
);

Given<InversifyWorld>(
  'a service {string} {warriorRelatedType} type binding as {string} when tagged {string} to {string}',
  function (
    serviceId: string,
    warriorRelatedType: Newable,
    bindingAlias: string,
    tag: string,
    tagValue: string,
  ): void {
    givenTypeBinding.bind(this)(
      warriorRelatedType,
      undefined,
      bindWhenTagged(tag, tagValue),
      undefined,
      bindingAlias,
      serviceId,
    );
  },
);

Given<InversifyWorld>(
  'a {warriorRelatedType} type binding as {string} with a(n) {activation} activation',
  function (
    warriorRelatedType: Newable,
    bindingAlias: string,
    activation: BindingActivation,
  ): void {
    givenTypeBinding.bind(this)(
      warriorRelatedType,
      undefined,
      undefined,
      bindOnActivation(activation),
      bindingAlias,
    );
  },
);
