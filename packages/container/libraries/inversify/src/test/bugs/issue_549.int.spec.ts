import { beforeAll, describe, expect, it } from 'vitest';

import {
  bindingScopeValues,
  InversifyCoreError,
  InversifyCoreErrorKind,
} from '@inversifyjs/core';

import {
  Container,
  type Inject,
  type Injectable,
} from '../../index.js';

describe('Issue 549', () => {
  describe('having a circular dependency', () => {
    class A implements Injectable {
      public b: unknown;
      constructor(b: Inject<B>) {
        this.b = b;
      }
    }

    class B implements Injectable {
      public a: unknown;
      constructor(a: Inject<A>) {
        this.a = a;
      }
    }

    let container: Container;

    beforeAll(() => {
      container = new Container({ defaultScope: bindingScopeValues.Singleton });
      container.bind(A).toSelf();
      container.bind(B).toSelf();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          container.get(A);
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.planning,
          message: expect.stringContaining('Circular dependency found:'),
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toMatchObject(expectedErrorProperties);
      });
    });
  });
});
