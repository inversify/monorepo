import { ServiceIdentifier } from '@inversifyjs/common';
import { BindingActivation, BindingDeactivation } from '@inversifyjs/core';

import { BindToFluentSyntax } from '../../binding/models/BindingFluentSyntax';
import { BindingIdentifier } from '../../binding/models/BindingIdentifier';
import { getContainerModuleId } from '../actions/getContainerModuleId';
import { IsBoundOptions } from './isBoundOptions';

export type Bind = <T>(
  serviceIdentifier: ServiceIdentifier<T>,
) => BindToFluentSyntax<T>;

export type IsBound = (
  serviceIdentifier: ServiceIdentifier,
  options?: IsBoundOptions,
) => boolean;

export type OnActivation = <T>(
  serviceIdentifier: ServiceIdentifier<T>,
  activation: BindingActivation<T>,
) => void;

export type OnDeactivation = <T>(
  serviceIdentifier: ServiceIdentifier<T>,
  deactivation: BindingDeactivation<T>,
) => void;

export type Rebind = <T>(
  serviceIdentifier: ServiceIdentifier<T>,
) => Promise<BindToFluentSyntax<T>>;

export type RebindSync = <T>(
  serviceIdentifier: ServiceIdentifier<T>,
) => BindToFluentSyntax<T>;

export type Unbind = (
  identifier: BindingIdentifier | ServiceIdentifier,
) => Promise<void>;

export type UnbindSync = (
  identifier: BindingIdentifier | ServiceIdentifier,
) => void;

export interface ContainerModuleLoadOptions {
  bind: Bind;
  isBound: IsBound;
  onActivation: OnActivation;
  onDeactivation: OnDeactivation;
  rebindAsync: Rebind;
  rebind: RebindSync;
  unbindAsync: Unbind;
  unbind: UnbindSync;
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

  public load(options: ContainerModuleLoadOptions): void | Promise<void> {
    return this.#load(options);
  }
}
