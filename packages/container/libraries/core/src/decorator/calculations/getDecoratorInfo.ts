import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { type DecoratorInfo } from '../models/DecoratorInfo.js';
import { DecoratorInfoKind } from '../models/DecoratorInfoKind.js';

export function getDecoratorInfo(
  target: object,
  propertyKey: undefined,
  parameterIndex: number,
): DecoratorInfo;
export function getDecoratorInfo<T>(
  target: object,
  propertyKey: string | symbol | undefined,
  descriptor: number | TypedPropertyDescriptor<T> | undefined,
): DecoratorInfo;
export function getDecoratorInfo(
  target: object,
  propertyKey: string | symbol,
): DecoratorInfo;
export function getDecoratorInfo(
  target: object,
  propertyKey: string | symbol | undefined,
  parameterIndex?: number | undefined,
): DecoratorInfo;
export function getDecoratorInfo<T>(
  target: object,
  propertyKey: string | symbol | undefined,
  parameterIndexOrDescriptor?: number | TypedPropertyDescriptor<T> | undefined,
): DecoratorInfo {
  if (parameterIndexOrDescriptor === undefined) {
    if (propertyKey === undefined) {
      throw new InversifyCoreError(
        InversifyCoreErrorKind.unknown,
        'Unexpected undefined property and index values',
      );
    }

    return {
      kind: DecoratorInfoKind.property,
      property: propertyKey,
      targetClass: target.constructor,
    };
  }

  if (typeof parameterIndexOrDescriptor === 'number') {
    return {
      index: parameterIndexOrDescriptor,
      kind: DecoratorInfoKind.parameter,
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      targetClass: target as Function,
    };
  }

  return {
    kind: DecoratorInfoKind.method,
    method: propertyKey as string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
    targetClass: target as Function,
  };
}
