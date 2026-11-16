import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { type ServiceIdentifier } from 'inversify';

import { Query } from '../decorators/Query.js';
import { QueryHandlerRouter } from './QueryHandlerRouter.js';

class GetStock {}

class GetRelease {}

describe(QueryHandlerRouter, () => {
  describe('.register', () => {
    describe('having a handler registered for the query', () => {
      describe('when called', () => {
        let errorFixture: unknown;
        let result: ServiceIdentifier | undefined;
        let serviceIdentifierFixture: ServiceIdentifier;

        beforeAll(() => {
          serviceIdentifierFixture = Symbol('get-stock');

          const router: QueryHandlerRouter = new QueryHandlerRouter();

          router.register({
            identifier: 'stock.get',
            serviceIdentifier: serviceIdentifierFixture,
            type: GetStock,
          });

          try {
            router.register({
              identifier: 'stock.get',
              serviceIdentifier: Symbol('get-stock-audit'),
              type: GetStock,
            });
          } catch (error: unknown) {
            errorFixture = error;
          }

          result = router.route(new GetStock());
        });

        it('should throw an Error', () => {
          expect(errorFixture).toBeInstanceOf(Error);
          expect((errorFixture as Error).message).toBe(
            'Query handler already defined for "GetStock".',
          );
        });

        it('should keep the registered handler', () => {
          expect(result).toBe(serviceIdentifierFixture);
        });
      });
    });

    describe('having a handler registered for the query identifier', () => {
      describe('when called, and the query type is different', () => {
        let errorFixture: unknown;
        // oxlint-disable-next-line typescript/no-unsafe-function-type
        let registeredTypes: Function[];
        let result: ServiceIdentifier | undefined;
        let serviceIdentifierFixture: ServiceIdentifier;

        beforeAll(() => {
          serviceIdentifierFixture = Symbol('get-stock');

          const router: QueryHandlerRouter = new QueryHandlerRouter();

          router.register({
            identifier: 'stock.get',
            serviceIdentifier: serviceIdentifierFixture,
            type: GetStock,
          });

          try {
            router.register({
              identifier: 'stock.get',
              serviceIdentifier: Symbol('get-release'),
              type: GetRelease,
            });
          } catch (error: unknown) {
            errorFixture = error;
          }

          result = router.route(new GetStock());
          registeredTypes = Array.from(router.getRegisteredTypes());
        });

        it('should throw an Error', () => {
          expect(errorFixture).toBeInstanceOf(Error);
          expect((errorFixture as Error).message).toBe(
            'Query handler already defined for "GetRelease".',
          );
        });

        it('should keep the registered handler', () => {
          expect(result).toBe(serviceIdentifierFixture);
        });

        it('should keep the registered query type', () => {
          expect(registeredTypes).toStrictEqual([GetStock]);
        });
      });
    });
  });

  describe('.route', () => {
    describe('having a handler registered for a query identifier', () => {
      describe('when called, and the query type is not registered and has that identifier', () => {
        let result: ServiceIdentifier | undefined;
        let serviceIdentifierFixture: ServiceIdentifier;

        beforeAll(() => {
          serviceIdentifierFixture = Symbol('get-stock');

          @Query({
            identifier: 'stock.get',
          })
          class PhantomGetStock {}

          const router: QueryHandlerRouter = new QueryHandlerRouter();

          router.register({
            identifier: 'stock.get',
            serviceIdentifier: serviceIdentifierFixture,
            type: GetStock,
          });

          result = router.route(new PhantomGetStock());
        });

        it('should return the service identifier', () => {
          expect(result).toBe(serviceIdentifierFixture);
        });
      });
    });

    describe('when called, and no handler is registered for the query', () => {
      let result: ServiceIdentifier | undefined;

      beforeAll(() => {
        result = new QueryHandlerRouter().route(new GetStock());
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
