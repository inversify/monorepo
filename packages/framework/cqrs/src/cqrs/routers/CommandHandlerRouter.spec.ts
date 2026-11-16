import { beforeAll, describe, expect, it } from 'vitest';

import 'reflect-metadata/lite';

import { type ServiceIdentifier } from 'inversify';

import { Command } from '../decorators/Command.js';
import { CommandHandlerRouter } from './CommandHandlerRouter.js';

class ReserveStock {}

class ReleaseStock {}

describe(CommandHandlerRouter, () => {
  describe('.getRegisteredTypes', () => {
    describe('having handlers for two commands', () => {
      describe('when called', () => {
        // oxlint-disable-next-line typescript/no-unsafe-function-type
        let result: Function[];

        beforeAll(() => {
          const router: CommandHandlerRouter = new CommandHandlerRouter();

          router.register({
            identifier: 'stock.reserve',
            serviceIdentifier: Symbol('reserve'),
            type: ReserveStock,
          });
          router.register({
            identifier: 'stock.reserve',
            serviceIdentifier: Symbol('reserve-audit'),
            type: ReserveStock,
          });
          router.register({
            identifier: 'stock.release',
            serviceIdentifier: Symbol('release'),
            type: ReleaseStock,
          });

          result = Array.from(router.getRegisteredTypes());
        });

        it('should return each command type once', () => {
          expect(result).toStrictEqual([ReserveStock, ReleaseStock]);
        });
      });
    });
  });

  describe('.route', () => {
    describe('having two handlers registered for a command', () => {
      describe('when called', () => {
        let firstServiceIdentifierFixture: ServiceIdentifier;
        let result: ServiceIdentifier[] | undefined;
        let secondServiceIdentifierFixture: ServiceIdentifier;

        beforeAll(() => {
          firstServiceIdentifierFixture = Symbol('reserve');
          secondServiceIdentifierFixture = Symbol('reserve-audit');

          const router: CommandHandlerRouter = new CommandHandlerRouter();

          router.register({
            identifier: 'stock.reserve',
            serviceIdentifier: firstServiceIdentifierFixture,
            type: ReserveStock,
          });
          router.register({
            identifier: 'stock.reserve',
            serviceIdentifier: secondServiceIdentifierFixture,
            type: ReserveStock,
          });

          result = router.route(new ReserveStock());
        });

        it('should return the service identifiers in registration order', () => {
          expect(result).toStrictEqual([
            firstServiceIdentifierFixture,
            secondServiceIdentifierFixture,
          ]);
        });
      });
    });

    describe('having handlers registered for two command types with the same identifier', () => {
      describe('when called', () => {
        let firstServiceIdentifierFixture: ServiceIdentifier;
        let releaseResult: ServiceIdentifier[] | undefined;
        let reserveResult: ServiceIdentifier[] | undefined;
        let secondServiceIdentifierFixture: ServiceIdentifier;

        beforeAll(() => {
          firstServiceIdentifierFixture = Symbol('reserve');
          secondServiceIdentifierFixture = Symbol('release');

          const router: CommandHandlerRouter = new CommandHandlerRouter();

          router.register({
            identifier: 'stock.change',
            serviceIdentifier: firstServiceIdentifierFixture,
            type: ReserveStock,
          });
          router.register({
            identifier: 'stock.change',
            serviceIdentifier: secondServiceIdentifierFixture,
            type: ReleaseStock,
          });

          reserveResult = router.route(new ReserveStock());
          releaseResult = router.route(new ReleaseStock());
        });

        it('should return the same handler list for both command types', () => {
          expect(releaseResult).toBe(reserveResult);
          expect(reserveResult).toStrictEqual([
            firstServiceIdentifierFixture,
            secondServiceIdentifierFixture,
          ]);
        });
      });
    });

    describe('having a handler registered for a command identifier', () => {
      describe('when called, and the command type is not registered and has that identifier', () => {
        let commandFixture: object;
        let firstServiceIdentifierFixture: ServiceIdentifier;
        let phantomResult: ServiceIdentifier[] | undefined;
        let registeredResult: ServiceIdentifier[] | undefined;
        // oxlint-disable-next-line typescript/no-unsafe-function-type
        let registeredTypes: Function[];
        let secondServiceIdentifierFixture: ServiceIdentifier;

        beforeAll(() => {
          firstServiceIdentifierFixture = Symbol('reserve');
          secondServiceIdentifierFixture = Symbol('reserve-audit');

          @Command({
            identifier: 'stock.reserve',
          })
          class PhantomReserveStock {}

          const router: CommandHandlerRouter = new CommandHandlerRouter();

          router.register({
            identifier: 'stock.reserve',
            serviceIdentifier: firstServiceIdentifierFixture,
            type: ReserveStock,
          });

          commandFixture = new PhantomReserveStock();
          phantomResult = router.route(commandFixture);

          router.register({
            identifier: 'stock.reserve',
            serviceIdentifier: secondServiceIdentifierFixture,
            type: ReserveStock,
          });

          registeredResult = router.route(new ReserveStock());
          registeredTypes = Array.from(router.getRegisteredTypes());
        });

        it('should return the same handler list for the command', () => {
          expect(registeredResult).toBe(phantomResult);
          expect(registeredResult).toStrictEqual([
            firstServiceIdentifierFixture,
            secondServiceIdentifierFixture,
          ]);
        });

        it('should register the command type', () => {
          expect(registeredTypes).toStrictEqual([
            ReserveStock,
            commandFixture.constructor,
          ]);
        });
      });
    });

    describe('when called, and no handler is registered for the command', () => {
      let result: ServiceIdentifier[] | undefined;

      beforeAll(() => {
        result = new CommandHandlerRouter().route(new ReserveStock());
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and the command identifier is not mapped', () => {
      let result: ServiceIdentifier[] | undefined;

      beforeAll(() => {
        @Command({
          identifier: 'stock.unknown',
        })
        class UnknownStock {}

        const router: CommandHandlerRouter = new CommandHandlerRouter();

        router.register({
          identifier: 'stock.release',
          serviceIdentifier: Symbol('release'),
          type: ReleaseStock,
        });

        result = router.route(new UnknownStock());
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
