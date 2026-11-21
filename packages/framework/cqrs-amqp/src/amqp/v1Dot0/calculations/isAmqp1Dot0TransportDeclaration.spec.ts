import { beforeAll, describe, expect, it } from 'vitest';

import { type TransportDeclaration } from '@inversifyjs/framework-cqrs';

import { amqp1Dot0TransportIdentifier } from '../data/amqp1Dot0TransportIdentifier.js';
import { isAmqp1Dot0TransportDeclaration } from './isAmqp1Dot0TransportDeclaration.js';

describe(isAmqp1Dot0TransportDeclaration, () => {
  describe.each<[string, TransportDeclaration, boolean]>([
    [
      'an AMQP 1.0 declaration with a string connection identifier',
      {
        address: 'orders.create',
        connectionIdentifier: 'broker',
        identifier: amqp1Dot0TransportIdentifier,
      } as TransportDeclaration,
      true,
    ],
    [
      'an AMQP 1.0 declaration with a symbol connection identifier',
      {
        address: 'orders.create',
        connectionIdentifier: Symbol('broker'),
        identifier: amqp1Dot0TransportIdentifier,
      } as TransportDeclaration,
      true,
    ],
    [
      'a declaration of another transport',
      {
        address: 'orders.create',
        connectionIdentifier: 'broker',
        identifier: Symbol('another-transport'),
      } as TransportDeclaration,
      false,
    ],
    [
      'an AMQP 1.0 declaration without address',
      {
        connectionIdentifier: 'broker',
        identifier: amqp1Dot0TransportIdentifier,
      } as TransportDeclaration,
      false,
    ],
    [
      'an AMQP 1.0 declaration with an empty address',
      {
        address: '',
        connectionIdentifier: 'broker',
        identifier: amqp1Dot0TransportIdentifier,
      } as TransportDeclaration,
      false,
    ],
    [
      'an AMQP 1.0 declaration without connection identifier',
      {
        address: 'orders.create',
        identifier: amqp1Dot0TransportIdentifier,
      } as TransportDeclaration,
      false,
    ],
  ])(
    'having %s',
    (
      _: string,
      declarationFixture: TransportDeclaration,
      expectedResult: boolean,
    ) => {
      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result = isAmqp1Dot0TransportDeclaration(declarationFixture);
        });

        it(`should return ${String(expectedResult)}`, () => {
          expect(result).toBe(expectedResult);
        });
      });
    },
  );
});
