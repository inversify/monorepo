/* eslint-disable @typescript-eslint/no-explicit-any */

import {
  type BindingActivation,
  type BindingDeactivation,
  type BindToFluentSyntax,
  Container,
  type ContainerOptions,
  type GetOptions,
  type IsBoundOptions,
  type Newable,
  type ServiceIdentifier,
} from 'inversify';

import { type TypedContainerModule } from './module.js';

type IfAny<T, TYes, TNo> = 0 extends 1 & T ? TYes : TNo;

type BindingMapProperty = string | symbol;
export type BindingMap = Record<BindingMapProperty, any>;
export type MappedServiceIdentifier<T extends BindingMap> = IfAny<
  T,
  ServiceIdentifier,
  keyof T
>;
export type ContainerBinding<
  TBindingMap extends BindingMap,
  TKey extends MappedServiceIdentifier<TBindingMap> = any,
> = TKey extends keyof TBindingMap
  ? TBindingMap[TKey]
  : TKey extends Newable<infer C>
    ? C
    : // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      TKey extends Function
      ? any
      : never;

type NeverPromise<T> = T extends Promise<any> ? never : T;

interface ContainerOverrides<T extends BindingMap = any> {
  bind: Bind<T>;
  get: <
    TBound extends ContainerBinding<T, TKey>,
    TKey extends MappedServiceIdentifier<T> = any,
  >(
    serviceIdentifier: TKey,
    options?: GetOptions,
  ) => NeverPromise<TBound>;
  getAll: <
    TBound extends ContainerBinding<T, TKey>,
    TKey extends MappedServiceIdentifier<T> = any,
  >(
    serviceIdentifier: TKey,
    options?: GetOptions,
  ) => NeverPromise<TBound[]>;
  getAsync: <
    TBound extends ContainerBinding<T, TKey>,
    TKey extends MappedServiceIdentifier<T> = any,
  >(
    serviceIdentifier: TKey,
    options?: GetOptions,
  ) => Promise<Awaited<TBound>>;
  getAllAsync: <
    TBound extends ContainerBinding<T, TKey>,
    TKey extends MappedServiceIdentifier<T> = any,
  >(
    serviceIdentifier: TKey,
    options?: GetOptions,
  ) => Promise<Awaited<TBound>[]>;
  isBound: IsBound<T>;
  isCurrentBound: IsBound<T>;
  rebind: Rebind<T>;
  rebindSync: RebindSync<T>;
  unbind: Unbind<T>;
  unbindSync: UnbindSync<T>;
  onActivation<
    TBound extends ContainerBinding<T, TKey>,
    TKey extends MappedServiceIdentifier<T> = any,
  >(
    serviceIdentifier: TKey,
    onActivation: BindingActivation<TBound>,
  ): void;
  onDeactivation<
    TBound extends ContainerBinding<T, TKey>,
    TKey extends MappedServiceIdentifier<T> = any,
  >(
    serviceIdentifier: TKey,
    onDeactivation: BindingDeactivation<TBound>,
  ): void;
  load(module: TypedContainerModule<T>): Promise<void>;
  loadSync(module: TypedContainerModule<T>): void;
}

export type Bind<T extends BindingMap = any> = <
  TBound extends ContainerBinding<T, TKey>,
  TKey extends MappedServiceIdentifier<T> = any,
>(
  serviceIdentifier: TKey,
) => BindToFluentSyntax<TBound>;

export type IsBound<T extends BindingMap = any> = <
  TKey extends MappedServiceIdentifier<T>,
>(
  serviceIdentifier: TKey,
  options?: IsBoundOptions,
) => boolean;

export type Unbind<T extends BindingMap = any> = <
  TKey extends MappedServiceIdentifier<T>,
>(
  serviceIdentifier: TKey,
) => Promise<void>;

export type Rebind<T extends BindingMap = any> = <
  TBound extends ContainerBinding<T, TKey>,
  TKey extends MappedServiceIdentifier<T> = any,
>(
  serviceIdentifier: TKey,
) => Promise<BindToFluentSyntax<TBound>>;

export type RebindSync<T extends BindingMap = any> = <
  TBound extends ContainerBinding<T, TKey>,
  TKey extends MappedServiceIdentifier<T> = any,
>(
  serviceIdentifier: TKey,
) => BindToFluentSyntax<TBound>;

export type UnbindSync<T extends BindingMap = any> = <
  TKey extends MappedServiceIdentifier<T>,
>(
  serviceIdentifier: TKey,
) => void;

export type TypedContainer<T extends BindingMap = any> = ContainerOverrides<T> &
  Omit<Container, keyof ContainerOverrides>;

// eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-unsafe-assignment
export const TypedContainer: {
  new <T extends BindingMap = any>(
    options?: Omit<ContainerOptions, 'parent'> & {
      parent?: ContainerOptions['parent'] | TypedContainer<any>;
    },
  ): TypedContainer<T>;
} = Container as any;
