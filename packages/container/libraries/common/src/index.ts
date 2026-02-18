import { isPromise } from './common/calculations/isPromise.js';
import {
  type BaseEither,
  type Either,
  type Left,
  type Right,
} from './either/models/Either.js';
import { stringifyServiceIdentifier } from './services/calculations/stringifyServiceIdentifier.js';
import type { AbstractNewable } from './services/models/AbstractNewable.js';
import { LazyServiceIdentifier } from './services/models/LazyServiceIdentifier.js';
import type { Newable } from './services/models/Newable.js';
import type { ServiceIdentifier } from './services/models/ServiceIdentifier.js';

export type {
  AbstractNewable,
  BaseEither,
  Either,
  Left,
  Newable,
  Right,
  ServiceIdentifier,
};

export { isPromise, LazyServiceIdentifier, stringifyServiceIdentifier };
