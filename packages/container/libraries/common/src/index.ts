import { isPromise } from './common/calculations/isPromise';
import { BaseEither, Either, Left, Right } from './either/models/Either';
import { stringifyServiceIdentifier } from './services/calculations/stringifyServiceIdentifier';
import { AbstractNewable } from './services/models/AbstractNewable';
import { LazyServiceIdentifier } from './services/models/LazyServiceIdentifier';
import { Newable } from './services/models/Newable';
import { ServiceIdentifier } from './services/models/ServiceIdentifier';

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
