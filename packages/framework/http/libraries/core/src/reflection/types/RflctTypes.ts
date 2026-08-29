import { type Reflect } from 'rflct';

export type BodyParam<T, N extends string = never> = Reflect<
  T,
  { parameterType: 'body'; name: N }
>;

export type CookieParam<T, N extends string = never> = Reflect<
  T,
  { parameterType: 'cookies'; name: N }
>;

export type HeaderParam<T, N extends string = never> = Reflect<
  T,
  { parameterType: 'headers'; name: N }
>;

export type RouteParam<T, N extends string = never> = Reflect<
  T,
  { parameterType: 'params'; name: N }
>;

export type QueryParam<T, N extends string = never> = Reflect<
  T,
  { parameterType: 'query'; name: N }
>;

export type RequestParam<T> = Reflect<T, { parameterType: 'request' }>;

export type ResponseParam<T> = Reflect<T, { parameterType: 'response' }>;
