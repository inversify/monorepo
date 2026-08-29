import { type Reflect, type WithReflectMetadata } from 'rflct';

export type Inject<T> = Reflect<T>;

export type InjectOptional<T> = Reflect<T, { optional: true }>;

export type InjectNamed<T, N extends string | number | symbol = string> = Reflect<
  T,
  { name: N }
>;

export type InjectTagged<
  T,
  K extends string | number | symbol = string,
  V = unknown,
> = Reflect<T, { tags: Record<K, V> }>;

export type InjectMulti<T> = Reflect<T[], { multi: true }>;

export type InjectMultiChained<T> = Reflect<T[], { multi: true; chained: true }>;

export type InjectUnmanaged<T> = Reflect<T, { unmanaged: true }>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PostConstruct<T extends (...args: any[]) => any> = Reflect<
  T,
  { postConstruct: true }
>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type PreDestroy<T extends (...args: any[]) => any> = Reflect<
  T,
  { preDestroy: true }
>;

export type Injectable<T = {}> = WithReflectMetadata<T>;
