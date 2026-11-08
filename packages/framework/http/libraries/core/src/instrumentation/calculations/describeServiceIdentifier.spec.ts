import { describe, expect, it } from 'vitest';

import { type Pipe } from '@inversifyjs/framework-core';

import {
  describeServiceIdentifier,
  readPipeServiceIdentifier,
} from './describeServiceIdentifier.js';

describe(describeServiceIdentifier, () => {
  describe('having a string service identifier', () => {
    describe('when called', () => {
      it('should return the string', () => {
        expect(describeServiceIdentifier('OrderService')).toBe('OrderService');
      });
    });
  });

  describe('having a symbol service identifier', () => {
    describe('when called', () => {
      it('should return the symbol text', () => {
        expect(describeServiceIdentifier(Symbol.for('payments'))).toBe(
          'Symbol(payments)',
        );
      });
    });
  });

  describe('having a named class service identifier', () => {
    describe('when called', () => {
      it('should return the class name', () => {
        class OrderService {}

        expect(describeServiceIdentifier(OrderService)).toBe('OrderService');
      });
    });
  });

  describe('having an anonymous function service identifier', () => {
    describe('when called', () => {
      it('should return anonymous', () => {
        expect(describeServiceIdentifier(class {})).toBe('(anonymous)');
      });
    });
  });
});

describe(readPipeServiceIdentifier, () => {
  describe('having a pipe instance', () => {
    describe('when called', () => {
      it('should return the pipe constructor', () => {
        class OrderPipe implements Pipe {
          public execute(value: unknown): unknown {
            return value;
          }
        }

        expect(readPipeServiceIdentifier(new OrderPipe())).toBe(OrderPipe);
      });
    });
  });

  describe('having a class service identifier', () => {
    describe('when called', () => {
      it('should return the class', () => {
        class OrderPipe implements Pipe {
          public execute(value: unknown): unknown {
            return value;
          }
        }

        expect(readPipeServiceIdentifier(OrderPipe)).toBe(OrderPipe);
      });
    });
  });

  describe('having a string service identifier', () => {
    describe('when called', () => {
      it('should return the string', () => {
        expect(readPipeServiceIdentifier('OrderPipe')).toBe('OrderPipe');
      });
    });
  });

  describe('having a symbol service identifier', () => {
    describe('when called', () => {
      it('should return the symbol', () => {
        const pipeServiceId: symbol = Symbol('order-pipe');

        expect(readPipeServiceIdentifier(pipeServiceId)).toBe(pipeServiceId);
      });
    });
  });
});
