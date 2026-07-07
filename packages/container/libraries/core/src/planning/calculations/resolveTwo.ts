import { isPromise } from '@inversifyjs/common';

import { type Resolved } from '../../resolution/models/Resolved.js';

const PARAMS: number = 2;

export function resolveTwo<TParam, TResult>(
  value1: Resolved<TParam>,
  value2: Resolved<TParam>,
  build: (value1: TParam, value2: TParam) => Resolved<TResult>,
): Resolved<TResult> {
  if (isPromise(value1)) {
    if (isPromise(value2)) {
      return new Promise(
        (resolve: (value: TResult | PromiseLike<TResult>) => void) => {
          let resolvedValues: number = 0;
          let resolvedValue1: TParam;
          let resolvedValue2: TParam;

          void value1.then((resolvedValue: TParam) => {
            if (++resolvedValues === PARAMS) {
              resolve(build(resolvedValue, resolvedValue2));
            } else {
              resolvedValue1 = resolvedValue;
            }
          });

          void value2.then((resolvedValue: TParam) => {
            if (++resolvedValues === PARAMS) {
              resolve(build(resolvedValue1, resolvedValue));
            } else {
              resolvedValue2 = resolvedValue;
            }
          });
        },
      );
    }

    return value1.then(async (resolvedValue1: TParam): Promise<TResult> =>
      build(resolvedValue1, value2),
    );
  }

  if (isPromise(value2)) {
    return value2.then(async (resolvedValue2: TParam): Promise<TResult> =>
      build(value1, resolvedValue2),
    );
  }

  return build(value1, value2);
}
