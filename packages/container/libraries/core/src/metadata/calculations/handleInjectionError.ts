import { getDecoratorInfo } from '../../decorator/calculations/getDecoratorInfo.js';
import { stringifyDecoratorInfo } from '../../decorator/calculations/stringifyDecoratorInfo.js';
import { type DecoratorInfo } from '../../decorator/models/DecoratorInfo.js';
import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';

export function handleInjectionError<T>(
  target: object,
  propertyKey: string | symbol | undefined,
  parameterIndex: number | TypedPropertyDescriptor<T> | undefined,
  error: unknown,
): never {
  if (
    InversifyCoreError.isErrorOfKind(
      error,
      InversifyCoreErrorKind.injectionDecoratorConflict,
    )
  ) {
    const info: DecoratorInfo = getDecoratorInfo(
      target,
      propertyKey,
      parameterIndex,
    );
    throw new InversifyCoreError(
      InversifyCoreErrorKind.injectionDecoratorConflict,
      `Unexpected injection error.

Cause:

${error.message}

Details

${stringifyDecoratorInfo(info)}`,
      { cause: error },
    );
  }

  throw error;
}
