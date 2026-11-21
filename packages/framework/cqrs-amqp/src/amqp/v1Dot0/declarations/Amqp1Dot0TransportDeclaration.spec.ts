import { beforeAll, describe, expect, it } from 'vitest';

import { amqp1Dot0TransportIdentifier } from '../data/amqp1Dot0TransportIdentifier.js';
import { type Amqp1Dot0TransportParams } from '../models/Amqp1Dot0TransportParams.js';
import { Amqp1Dot0TransportDeclaration } from './Amqp1Dot0TransportDeclaration.js';

describe(Amqp1Dot0TransportDeclaration, () => {
  describe('.constructor', () => {
    describe('having params with a non empty address', () => {
      let paramsFixture: Amqp1Dot0TransportParams;

      beforeAll(() => {
        paramsFixture = {
          address: 'orders.create',
          connectionIdentifier: Symbol('broker'),
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = new Amqp1Dot0TransportDeclaration(paramsFixture);
        });

        it('should return a declaration', () => {
          const expected: Partial<Amqp1Dot0TransportDeclaration> = {
            address: paramsFixture.address,
            connectionIdentifier: paramsFixture.connectionIdentifier,
            identifier: amqp1Dot0TransportIdentifier,
          };

          expect(result).toStrictEqual(
            expect.objectContaining(expected) as unknown,
          );
          expect(result).toBeInstanceOf(Amqp1Dot0TransportDeclaration);
        });
      });
    });

    describe('having params with an empty address', () => {
      let paramsFixture: Amqp1Dot0TransportParams;

      beforeAll(() => {
        paramsFixture = {
          address: '',
          connectionIdentifier: 'broker',
        };
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          try {
            new Amqp1Dot0TransportDeclaration(paramsFixture);
          } catch (error: unknown) {
            result = error;
          }
        });

        it('should throw an Error', () => {
          const expected: Partial<Error> = {
            message: 'AMQP 1.0 address must be a non-empty string',
          };

          expect(result).toBeInstanceOf(Error);
          expect(result).toStrictEqual(
            expect.objectContaining(expected) as unknown,
          );
        });
      });
    });
  });
});
