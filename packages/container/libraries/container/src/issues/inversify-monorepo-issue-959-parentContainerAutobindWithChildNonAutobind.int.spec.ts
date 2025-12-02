import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { injectable } from '@inversifyjs/core';

import { Container } from '../container/services/Container';

describe('inversify/monorepo#959', () => {
  describe('Parent container autobind with child non-autobind', () => {
    describe('when parent container has autobind enabled and child container has autobind disabled', () => {
      @injectable()
      class TestService {
        public getValue(): string {
          return 'test-value';
        }
      }

      let parentContainer: Container;
      let childContainer: Container;

      beforeAll(() => {
        parentContainer = new Container({ autobind: true });
        childContainer = new Container({
          parent: parentContainer,
        });
      });

      afterAll(() => {
        parentContainer = undefined as unknown as Container;
        childContainer = undefined as unknown as Container;
      });

      describe('when calling childContainer.get() for an unbound service', () => {
        let result: TestService;

        beforeAll(() => {
          result = childContainer.get(TestService);
        });

        it('should resolve the service using parent autobind', () => {
          expect(result).toBeInstanceOf(TestService);
        });

        it('should return the correct value', () => {
          expect(result.getValue()).toBe('test-value');
        });
      });

      describe('when calling childContainer.getAll() for an unbound service', () => {
        let result: TestService[];

        beforeAll(() => {
          result = childContainer.getAll(TestService, { chained: true });
        });

        it('should resolve the service using parent autobind', () => {
          expect(result).toStrictEqual([expect.any(TestService)]);
        });

        it('should return the correct value', () => {
          expect(result[0]?.getValue()).toBe('test-value');
        });
      });

      describe('when parent container does not have autobind but child does', () => {
        @injectable()
        class AnotherTestService {
          public getValue(): string {
            return 'another-test-value';
          }
        }

        let parentWithoutAutobind: Container;
        let childWithAutobind: Container;

        beforeAll(() => {
          parentWithoutAutobind = new Container();
          childWithAutobind = new Container({
            autobind: true,
            parent: parentWithoutAutobind,
          });
        });

        afterAll(() => {
          parentWithoutAutobind = undefined as unknown as Container;
          childWithAutobind = undefined as unknown as Container;
        });

        describe('when calling childContainer.get() for an unbound service', () => {
          let result: unknown;

          beforeAll(() => {
            result = childWithAutobind.get(AnotherTestService);
          });

          it('should resolve the service using child autobind', () => {
            expect(result).toBeInstanceOf(AnotherTestService);
          });

          it('should return the correct value', () => {
            expect((result as AnotherTestService).getValue()).toBe(
              'another-test-value',
            );
          });
        });
      });
    });
  });
});
