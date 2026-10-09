import { describe, expect, it } from 'vitest';

import { describeServiceIdentifier } from './describeServiceIdentifier.js';

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
