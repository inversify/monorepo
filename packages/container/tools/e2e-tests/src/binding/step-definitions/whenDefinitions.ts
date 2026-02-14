import { When } from '@cucumber/cucumber';
import { Newable, ServiceIdentifier } from '@inversifyjs/common';
import { BindingIdentifier } from '@inversifyjs/container';
import { BindingActivation } from '@inversifyjs/core';

import { defaultAlias } from '../../common/models/defaultAlias';
import { InversifyWorld } from '../../common/models/InversifyWorld';
import { getContainerOrFail } from '../../container/calculations/getContainerOrFail';
import { setBindingIdentifier } from '../actions/setBindingIdentifier';
import { getBindingIdentifierOrFail } from '../calculations/getBindingIdentifierOrFail';
import { getBindingOrFail } from '../calculations/getBindingOrFail';

function whenActivationIsRegistered(
  this: InversifyWorld,
  activation: BindingActivation,
  serviceIdentifier: ServiceIdentifier,
  containerAlias?: string,
): void {
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  getContainerOrFail
    .bind(this)(parsedContainerAlias)
    .onActivation(serviceIdentifier, activation);
}

function whenBindingIsBound(
  this: InversifyWorld,
  bindingAlias?: string,
  containerAlias?: string,
): void {
  const parsedBindingAlias: string = bindingAlias ?? defaultAlias;
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  const bindingIdentifier: BindingIdentifier = getBindingOrFail
    .bind(this)(parsedBindingAlias)
    .bind(getContainerOrFail.bind(this)(parsedContainerAlias));

  setBindingIdentifier.bind(this)(parsedBindingAlias, {
    identifier: bindingIdentifier,
  });
}

async function whenServiceBindingsAreUnbound(
  this: InversifyWorld,
  serviceAlias?: string,
  containerAlias?: string,
): Promise<void> {
  const parsedServiceAlias: string = serviceAlias ?? defaultAlias;
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  await getContainerOrFail
    .bind(this)(parsedContainerAlias)
    .unbindAsync(parsedServiceAlias);
}

async function whenBindingByIdIsUnbound(
  this: InversifyWorld,
  bindingAlias?: string,
  containerAlias?: string,
): Promise<void> {
  const parsedBindingAlias: string = bindingAlias ?? defaultAlias;
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  await getContainerOrFail
    .bind(this)(parsedContainerAlias)
    .unbindAsync(
      getBindingIdentifierOrFail.bind(this)(parsedBindingAlias).identifier,
    );
}

When<InversifyWorld>('binding is bound to container', function (): void {
  whenBindingIsBound.bind(this)();
});

When<InversifyWorld>(
  'binding is unbound by its id from container',
  async function (): Promise<void> {
    await whenBindingByIdIsUnbound.bind(this)();
  },
);

When<InversifyWorld>(
  '{string} binding is bound to container',
  function (bindingAlias: string): void {
    whenBindingIsBound.bind(this)(bindingAlias);
  },
);

When<InversifyWorld>(
  '{string} binding is bound to {string} container',
  function (bindingAlias: string, containerAlias: string): void {
    whenBindingIsBound.bind(this)(bindingAlias, containerAlias);
  },
);

When<InversifyWorld>(
  'service {string} is unbound from container',
  async function (serviceAlias: string): Promise<void> {
    await whenServiceBindingsAreUnbound.bind(this)(serviceAlias);
  },
);

When<InversifyWorld>(
  'a(n) {activation} activation is registered for {warriorRelatedType} type',
  function (activation: BindingActivation, warriorRelatedType: Newable): void {
    whenActivationIsRegistered.bind(this)(
      activation,
      warriorRelatedType,
      undefined,
    );
  },
);
