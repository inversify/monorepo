import { beforeAll, describe, expect, it } from 'vitest';

import { DecoratorInfoKind } from '../models/DecoratorInfoKind';
import { MethodDecoratorInfo } from '../models/MethodDecoratorInfo';
import { ParameterDecoratorInfo } from '../models/ParameterDecoratorInfo';
import { PropertyDecoratorInfo } from '../models/PropertyDecoratorInfo';
import { stringifyDecoratorInfo } from './stringifyDecoratorInfo';

describe(stringifyDecoratorInfo.name, () => {
  describe('having decoratorTargetInfo with kind method', () => {
    let decoratorTargetInfoFixture: MethodDecoratorInfo;

    beforeAll(() => {
      decoratorTargetInfoFixture = {
        kind: DecoratorInfoKind.method,
        method: 'method-fixture',
        targetClass: class Name {},
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = stringifyDecoratorInfo(decoratorTargetInfoFixture);
      });

      it('should return expected string', () => {
        expect(result).toBe('[class: "Name", method: "method-fixture"]');
      });
    });
  });

  describe('having decoratorTargetInfo with kind parameter', () => {
    let decoratorTargetInfoFixture: ParameterDecoratorInfo;

    beforeAll(() => {
      decoratorTargetInfoFixture = {
        index: 0,
        kind: DecoratorInfoKind.parameter,
        targetClass: class Name {},
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = stringifyDecoratorInfo(decoratorTargetInfoFixture);
      });

      it('should return expected string', () => {
        expect(result).toBe('[class: "Name", index: "0"]');
      });
    });
  });

  describe('having decoratorTargetInfo with property parameters', () => {
    let decoratorTargetInfoFixture: PropertyDecoratorInfo;

    beforeAll(() => {
      decoratorTargetInfoFixture = {
        kind: DecoratorInfoKind.property,
        property: 'property',
        targetClass: class Name {},
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = stringifyDecoratorInfo(decoratorTargetInfoFixture);
      });

      it('should return expected string', () => {
        expect(result).toBe('[class: "Name", property: "property"]');
      });
    });
  });
});
