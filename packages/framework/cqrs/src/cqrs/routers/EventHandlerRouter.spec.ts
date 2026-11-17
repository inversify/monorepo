import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { type ServiceIdentifier } from 'inversify';

import { Event } from '../decorators/Event.js';
import { EventHandlerRouter } from './EventHandlerRouter.js';

class StockReserved {}

class StockReleased {}

describe(EventHandlerRouter, () => {
  describe('.getRegisteredTypes', () => {
    describe('having handlers for two events', () => {
      describe('when called', () => {
        // oxlint-disable-next-line typescript/no-unsafe-function-type
        let result: Function[];

        beforeAll(() => {
          const router: EventHandlerRouter = new EventHandlerRouter();

          router.register({
            identifier: 'stock.reserved',
            serviceIdentifier: Symbol('reserved'),
            type: StockReserved,
          });
          router.register({
            identifier: 'stock.reserved',
            serviceIdentifier: Symbol('reserved-audit'),
            type: StockReserved,
          });
          router.register({
            identifier: 'stock.released',
            serviceIdentifier: Symbol('released'),
            type: StockReleased,
          });

          result = Array.from(router.getRegisteredTypes());
        });

        it('should return each event type once', () => {
          expect(result).toStrictEqual([StockReserved, StockReleased]);
        });
      });
    });
  });

  describe('.route', () => {
    describe('having two handlers registered for an event', () => {
      describe('when called', () => {
        let firstServiceIdentifierFixture: ServiceIdentifier;
        let result: ServiceIdentifier[] | undefined;
        let secondServiceIdentifierFixture: ServiceIdentifier;

        beforeAll(() => {
          firstServiceIdentifierFixture = Symbol('reserved');
          secondServiceIdentifierFixture = Symbol('reserved-audit');

          const router: EventHandlerRouter = new EventHandlerRouter();

          router.register({
            identifier: 'stock.reserved',
            serviceIdentifier: firstServiceIdentifierFixture,
            type: StockReserved,
          });
          router.register({
            identifier: 'stock.reserved',
            serviceIdentifier: secondServiceIdentifierFixture,
            type: StockReserved,
          });

          result = router.route(new StockReserved());
        });

        it('should return the service identifiers in registration order', () => {
          expect(result).toStrictEqual([
            firstServiceIdentifierFixture,
            secondServiceIdentifierFixture,
          ]);
        });
      });
    });

    describe('having handlers registered for two event types with the same identifier', () => {
      describe('when called', () => {
        let firstServiceIdentifierFixture: ServiceIdentifier;
        let releasedResult: ServiceIdentifier[] | undefined;
        let reservedResult: ServiceIdentifier[] | undefined;
        let secondServiceIdentifierFixture: ServiceIdentifier;

        beforeAll(() => {
          firstServiceIdentifierFixture = Symbol('reserved');
          secondServiceIdentifierFixture = Symbol('released');

          const router: EventHandlerRouter = new EventHandlerRouter();

          router.register({
            identifier: 'stock.changed',
            serviceIdentifier: firstServiceIdentifierFixture,
            type: StockReserved,
          });
          router.register({
            identifier: 'stock.changed',
            serviceIdentifier: secondServiceIdentifierFixture,
            type: StockReleased,
          });

          reservedResult = router.route(new StockReserved());
          releasedResult = router.route(new StockReleased());
        });

        it('should return the same handler list for both event types', () => {
          expect(releasedResult).toBe(reservedResult);
          expect(reservedResult).toStrictEqual([
            firstServiceIdentifierFixture,
            secondServiceIdentifierFixture,
          ]);
        });
      });
    });

    describe('having a handler registered for an event identifier', () => {
      describe('when called, and the event type is not registered and has that identifier', () => {
        let eventFixture: object;
        let firstServiceIdentifierFixture: ServiceIdentifier;
        let phantomResult: ServiceIdentifier[] | undefined;
        let registeredResult: ServiceIdentifier[] | undefined;
        // oxlint-disable-next-line typescript/no-unsafe-function-type
        let registeredTypes: Function[];
        let secondServiceIdentifierFixture: ServiceIdentifier;

        beforeAll(() => {
          firstServiceIdentifierFixture = Symbol('reserved');
          secondServiceIdentifierFixture = Symbol('reserved-audit');

          @Event({
            identifier: 'stock.reserved',
          })
          class PhantomStockReserved {}

          const router: EventHandlerRouter = new EventHandlerRouter();

          router.register({
            identifier: 'stock.reserved',
            serviceIdentifier: firstServiceIdentifierFixture,
            type: StockReserved,
          });

          eventFixture = new PhantomStockReserved();
          phantomResult = router.route(eventFixture);

          router.register({
            identifier: 'stock.reserved',
            serviceIdentifier: secondServiceIdentifierFixture,
            type: StockReserved,
          });

          registeredResult = router.route(new StockReserved());
          registeredTypes = Array.from(router.getRegisteredTypes());
        });

        it('should return the same handler list for the event', () => {
          expect(registeredResult).toBe(phantomResult);
          expect(registeredResult).toStrictEqual([
            firstServiceIdentifierFixture,
            secondServiceIdentifierFixture,
          ]);
        });

        it('should register the event type', () => {
          expect(registeredTypes).toStrictEqual([
            StockReserved,
            eventFixture.constructor,
          ]);
        });
      });
    });

    describe('when called, and no handler is registered for the event', () => {
      let result: ServiceIdentifier[] | undefined;

      beforeAll(() => {
        result = new EventHandlerRouter().route(new StockReserved());
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and the event identifier is not mapped', () => {
      let result: ServiceIdentifier[] | undefined;

      beforeAll(() => {
        @Event({
          identifier: 'stock.unknown',
        })
        class UnknownStock {}

        const router: EventHandlerRouter = new EventHandlerRouter();

        router.register({
          identifier: 'stock.released',
          serviceIdentifier: Symbol('released'),
          type: StockReleased,
        });

        result = router.route(new UnknownStock());
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
