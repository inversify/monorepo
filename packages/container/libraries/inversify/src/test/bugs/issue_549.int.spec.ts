import { beforeAll, describe, expect, it } from 'vitest';

import {
  bindingScopeValues,
  InversifyCoreError,
  InversifyCoreErrorKind,
} from '@inversifyjs/core';

import {
  Container,
  inject,
  injectable,
  ResolutionContext,
  ServiceIdentifier,
} from '../..';

describe('Issue 549', () => {
  describe('having a circular dependency', () => {
    let firstServiceIdentifier: ServiceIdentifier;
    let secondServiceIdentifier: ServiceIdentifier;

    let firstClassServiceIdentifier: ServiceIdentifier;

    let container: Container;

    beforeAll(() => {
      firstServiceIdentifier = Symbol('FirstService');
      secondServiceIdentifier = Symbol('SecondService');

      @injectable()
      class A {
        public b: unknown;
        constructor(@inject(secondServiceIdentifier) b: unknown) {
          this.b = b;
        }
      }

      @injectable()
      class B {
        public a: unknown;
        constructor(@inject(firstServiceIdentifier) a: unknown) {
          this.a = a;
        }
      }

      firstClassServiceIdentifier = A;

      container = new Container({ defaultScope: bindingScopeValues.Singleton });
      container.bind(A).toSelf();
      container.bind(B).toSelf();

      container
        .bind(firstServiceIdentifier)
        .toDynamicValue((ctx: ResolutionContext) => ctx.get(A));

      container
        .bind(secondServiceIdentifier)
        .toDynamicValue((ctx: ResolutionContext) => ctx.get(B));
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        try {
          container.get(firstClassServiceIdentifier);
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
