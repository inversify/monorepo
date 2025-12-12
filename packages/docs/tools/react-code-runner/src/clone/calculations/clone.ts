import { Cloneable } from '../models/Cloneable';
import { CloneableFunction } from '../models/CloneableFunction';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type CustomCloneableHandlerTuple<T = any> = [
  (input: unknown) => input is T,
  (input: T, clone: <T>(input: T) => Cloneable<T>) => Cloneable<T>,
];

export function clone(
  customHandlers: CustomCloneableHandlerTuple[],
): <T>(input: T) => Cloneable<T> {
  const objectToCloneWeakMap: WeakMap<object, unknown> = new WeakMap();

  const curriedClone: <T>(input: T) => Cloneable<T> = function <T>(
    input: T,
  ): Cloneable<T> {
    for (const [isType, cloneType] of customHandlers) {
      if (isType(input)) {
        return cloneType(input, curriedClone) as Cloneable<T>;
      }
    }

    if (typeof input === 'function') {
      return cloneFunction(input) as Cloneable<T>;
    }

    if (typeof input === 'object' && input !== null) {
      const cached: unknown = objectToCloneWeakMap.get(input as object);
      if (cached !== undefined) {
        return cached as Cloneable<T>;
      }

      const objectClone: Cloneable<T> = curriedCloneObject(
        input as Record<string | symbol, unknown>,
      ) as Cloneable<T>;

      objectToCloneWeakMap.set(input, objectClone);

      return objectClone;
    }

    return input as Cloneable<T>;
  };

  const curriedCloneObject: <T extends Record<string | symbol, unknown>>(
    input: T,
  ) => Cloneable<T> = cloneObject(curriedClone);

  return curriedClone;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function cloneFunction(input: Function): CloneableFunction {
  return {
    name: input.name,
    stringifiedContent: input.toString(),
  };
}

function isIterable(input: object & {}): input is Iterable<unknown> {
  return (
    typeof (input as Record<string | symbol, unknown>)[Symbol.iterator] ===
    'function'
  );
}

function cloneObject(
  curriedClone: <T>(input: T) => Cloneable<T>,
): <T extends Record<string | symbol, unknown>>(input: T) => Cloneable<T> {
  return <T extends Record<string | symbol, unknown>>(
    input: T,
  ): Cloneable<T> => {
    if (isIterable(input)) {
      return [...input].map((item: unknown) =>
        curriedClone(item),
      ) as Cloneable<T>;
    }

    const objectClone: Record<string | symbol, unknown> = {};

    for (const key of Reflect.ownKeys(input)) {
      objectClone[key] = curriedClone(
        (input as Record<string | symbol, unknown>)[key],
      );
    }

    return objectClone as Cloneable<T>;
  };
}
