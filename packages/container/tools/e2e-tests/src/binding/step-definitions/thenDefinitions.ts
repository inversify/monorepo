import assert from 'node:assert/strict';

import { Then } from '@cucumber/cucumber';
import { type IsBoundOptions } from '@inversifyjs/container';

import { defaultAlias } from '../../common/models/defaultAlias';
import { type InversifyWorld } from '../../common/models/InversifyWorld';
import { getContainerOrFail } from '../../container/calculations/getContainerOrFail';
import { getBindingOrFail } from '../calculations/getBindingOrFail';

function thenContainerAcknowledgesBindingToBeBound(
  this: InversifyWorld,
  isBoundOptions?: IsBoundOptions,
  bindingAlias?: string,
  containerAlias?: string,
): void {
  const parsedBindingAlias: string = bindingAlias ?? defaultAlias;
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  assert.ok(
    getContainerOrFail
      .bind(this)(parsedContainerAlias)
      .isBound(
        getBindingOrFail.bind(this)(parsedBindingAlias).serviceIdentifier,
        isBoundOptions,
      ),
  );
}

function thenContainerAcknowledgesServiceBindingsToBeUnbound(
  this: InversifyWorld,
  isBoundOptions?: IsBoundOptions,
  serviceAlias?: string,
  containerAlias?: string,
): void {
  const serviceBindingAlias: string = serviceAlias ?? defaultAlias;
  const parsedContainerAlias: string = containerAlias ?? defaultAlias;

  assert.ok(
    !getContainerOrFail
      .bind(this)(parsedContainerAlias)
      .isBound(serviceBindingAlias, isBoundOptions),
  );
}

Then<InversifyWorld>(
  'container acknowledges binding to be bound',
  function (): void {
    thenContainerAcknowledgesBindingToBeBound.bind(this)();
  },
);

Then<InversifyWorld>(
  'container acknowledges {string} binding to be bound when named {string}',
  function (bindingAlias: string, name: string): void {
    thenContainerAcknowledgesBindingToBeBound.bind(this)(
      { name },
      bindingAlias,
    );
  },
);

Then<InversifyWorld>(
  'container acknowledges {string} binding to be bound when tagged {string} to {string}',
  function (bindingAlias: string, tag: string, tagValue: string): void {
    thenContainerAcknowledgesBindingToBeBound.bind(this)(
      {
        tag: {
          key: tag,
          value: tagValue,
        },
      },
      bindingAlias,
    );
  },
);

Then<InversifyWorld>(
  'container acknowledges service {string} bindings to be unbound',
  function (serviceAlias: string): void {
    thenContainerAcknowledgesServiceBindingsToBeUnbound.bind(this)(
      {},
      serviceAlias,
    );
  },
);
