import { ServiceIdentifier } from '@inversifyjs/common';
import { BindingActivation, BindingDeactivation } from '@inversifyjs/core';

import { BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax';
import { BindingIdentifier } from '../../binding/models/BindingIdentifier';
import { getContainerModuleId } from '../actions/getContainerModuleId';
import { IsBoundOptions } from './isBoundOptions';

export interface ContainerModuleLoadOptions {
  bind: <T>(serviceIdentifier: ServiceIdentifier<T>) => BindToFluentSyntax<T>;
  isBound: (
    serviceIdentifier: ServiceIdentifier,
    options?: IsBoundOptions,
  ) => boolean;
  onActivation: <T>(
    serviceIdentifier: ServiceIdentifier<T>,
    activation: BindingActivation<T>,
  ) => void;
  onDeactivation: <T>(
    serviceIdentifier: ServiceIdentifier<T>,
    deactivation: BindingDeactivation<T>,
  ) => void;
  rebind: <T>(
    serviceIdentifier: ServiceIdentifier<T>,
  ) => Promise<BindToFluentSyntax<T>>;
  rebindSync: <T>(
    serviceIdentifier: ServiceIdentifier<T>,
  ) => BindToFluentSyntax<T>;
  unbind: (identifier: BindingIdentifier | ServiceIdentifier) => Promise<void>;
  unbindSync: (identifier: BindingIdentifier | ServiceIdentifier) => void;
}

export class ContainerModule {
  readonly #id: number;
  readonly #load: (options: ContainerModuleLoadOptions) => void | Promise<void>;

  constructor(
    load: (options: ContainerModuleLoadOptions) => void | Promise<void>,
  ) {
    this.#id = getContainerModuleId();
    this.#load = load;
  }

  public get id(): number {
    return this.#id;
  }

  public async load(options: ContainerModuleLoadOptions): Promise<void> {
    await this.#load(options);
  }
}
