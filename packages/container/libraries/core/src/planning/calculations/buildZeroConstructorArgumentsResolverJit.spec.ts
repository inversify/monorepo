import { beforeAll, describe, expect, it } from 'vitest';

import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { buildZeroConstructorArgumentsResolverJit } from './buildZeroConstructorArgumentsResolverJit.js';

class Foo {
  public readonly args: unknown[];

  constructor(...args: unknown[]) {
    this.args = args;
  }
}

describe(buildZeroConstructorArgumentsResolverJit, () => {
  let paramsFixture: ResolutionParams;

  beforeAll(() => {
    paramsFixture = Symbol() as unknown as ResolutionParams;
  });

  describe('when called, and resolveActivations is not provided', () => {
    let result: unknown;

    beforeAll(() => {
      const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
        buildZeroConstructorArgumentsResolverJit(Foo);

      result = resolveNode(paramsFixture);
    });

    it('should build an instance with no constructor arguments', () => {
      expect(result).toBeInstanceOf(Foo);
      expect((result as Foo).args).toStrictEqual([]);
    });
  });

  describe('when called, and resolveActivations is provided', () => {
    let resolveActivations: (
      params: ResolutionParams,
      instance: Resolved<Foo>,
    ) => Resolved<Foo>;

    beforeAll(() => {
      resolveActivations = (
        _params: ResolutionParams,
        instance: Resolved<Foo>,
      ): Resolved<Foo> => instance;
    });

    describe('when called, and resolveActivations returns a sync value', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildZeroConstructorArgumentsResolverJit(Foo, resolveActivations);

        result = resolveNode(paramsFixture);
      });

      it('should build an instance with no constructor arguments', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual([]);
      });
    });

    describe('when called, and resolveActivations returns a promise', () => {
      let expectedResult: unknown;
      let result: unknown;

      beforeAll(async () => {
        resolveActivations = (
          _params: ResolutionParams,
          instance: Resolved<Foo>,
        ): Resolved<Foo> => {
          expectedResult = instance;

          return Promise.resolve(instance);
        };

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildZeroConstructorArgumentsResolverJit(Foo, resolveActivations);

        result = await resolveNode(paramsFixture);
      });

      it('should return the resolved activation result', () => {
        expect(result).toBe(expectedResult);
      });
    });
  });
});
