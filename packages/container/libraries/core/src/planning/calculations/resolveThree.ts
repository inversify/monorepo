import { isPromise } from '@inversifyjs/common';

import { type Resolved } from '../../resolution/models/Resolved.js';

const TWO_PARAMS: number = 2;
const THREE_PARAMS: number = 3;

export function resolveThree<TParam, TResult>(
  value1: Resolved<TParam>,
  value2: Resolved<TParam>,
  value3: Resolved<TParam>,
  build: (value1: TParam, value2: TParam, value3: TParam) => Resolved<TResult>,
): Resolved<TResult> {
  if (isPromise(value1)) {
    if (isPromise(value2)) {
      if (isPromise(value3)) {
        return new Promise(
          (resolve: (value: TResult | PromiseLike<TResult>) => void) => {
            let resolvedValues: number = 0;
            let resolvedValue1: TParam;
            let resolvedValue2: TParam;
            let resolvedValue3: TParam;

            void value1.then((resolvedValue: TParam) => {
              if (++resolvedValues === THREE_PARAMS) {
                resolve(build(resolvedValue, resolvedValue2, resolvedValue3));
              } else {
                resolvedValue1 = resolvedValue;
              }
            });

            void value2.then((resolvedValue: TParam) => {
              if (++resolvedValues === THREE_PARAMS) {
                resolve(build(resolvedValue1, resolvedValue, resolvedValue3));
              } else {
                resolvedValue2 = resolvedValue;
              }
            });

            void value3.then((resolvedValue: TParam) => {
              if (++resolvedValues === THREE_PARAMS) {
                resolve(build(resolvedValue1, resolvedValue2, resolvedValue));
              } else {
                resolvedValue3 = resolvedValue;
              }
            });
          },
        );
      }

      return new Promise(
        (resolve: (value: TResult | PromiseLike<TResult>) => void) => {
          let resolvedValues: number = 0;
          let resolvedValue1: TParam;
          let resolvedValue2: TParam;

          void value1.then((resolvedValue: TParam) => {
            if (++resolvedValues === TWO_PARAMS) {
              resolve(build(resolvedValue, resolvedValue2, value3));
            } else {
              resolvedValue1 = resolvedValue;
            }
          });

          void value2.then((resolvedValue: TParam) => {
            if (++resolvedValues === TWO_PARAMS) {
              resolve(build(resolvedValue1, resolvedValue, value3));
            } else {
              resolvedValue2 = resolvedValue;
            }
          });
        },
      );
    }

    if (isPromise(value3)) {
      return new Promise(
        (resolve: (value: TResult | PromiseLike<TResult>) => void) => {
          let resolvedValues: number = 0;
          let resolvedValue1: TParam;
          let resolvedValue3: TParam;

          void value1.then((resolvedValue: TParam) => {
            if (++resolvedValues === TWO_PARAMS) {
              resolve(build(resolvedValue, value2, resolvedValue3));
            } else {
              resolvedValue1 = resolvedValue;
            }
          });

          void value3.then((resolvedValue: TParam) => {
            if (++resolvedValues === TWO_PARAMS) {
              resolve(build(resolvedValue1, value2, resolvedValue));
            } else {
              resolvedValue3 = resolvedValue;
            }
          });
        },
      );
    }

    return value1.then(async (resolvedValue1: TParam): Promise<TResult> =>
      build(resolvedValue1, value2, value3),
    );
  }

  if (isPromise(value2)) {
    if (isPromise(value3)) {
      return new Promise(
        (resolve: (value: TResult | PromiseLike<TResult>) => void) => {
          let resolvedValues: number = 0;
          let resolvedValue2: TParam;
          let resolvedValue3: TParam;

          void value2.then((resolvedValue: TParam) => {
            if (++resolvedValues === TWO_PARAMS) {
              resolve(build(value1, resolvedValue, resolvedValue3));
            } else {
              resolvedValue2 = resolvedValue;
            }
          });

          void value3.then((resolvedValue: TParam) => {
            if (++resolvedValues === TWO_PARAMS) {
              resolve(build(value1, resolvedValue2, resolvedValue));
            } else {
              resolvedValue3 = resolvedValue;
            }
          });
        },
      );
    }

    return value2.then(async (resolvedValue2: TParam): Promise<TResult> =>
      build(value1, resolvedValue2, value3),
    );
  }

  if (isPromise(value3)) {
    return value3.then(async (resolvedValue3: TParam): Promise<TResult> =>
      build(value1, value2, resolvedValue3),
    );
  }

  return build(value1, value2, value3);
}
