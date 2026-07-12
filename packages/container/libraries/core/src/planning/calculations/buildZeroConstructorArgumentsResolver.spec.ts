import { beforeAll, describe, expect, it } from 'vitest';

import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import {
  type Resolved,
  type SyncResolved,
} from '../../resolution/models/Resolved.js';
import { buildZeroConstructorArgumentsResolver } from './buildZeroConstructorArgumentsResolver.js';

class Foo {
  public readonly args: unknown[];

  constructor(...args: unknown[]) {
    this.args = args;
  }
}

describe(buildZeroConstructorArgumentsResolver, () => {
  let paramsFixture: ResolutionParams;
  let resolveActivations: (
    params: ResolutionParams,
    instance: SyncResolved<Foo>,
  ) => Resolved<Foo>;

  beforeAll(() => {
    paramsFixture = Symbol() as unknown as ResolutionParams;
    resolveActivations = (
      _params: ResolutionParams,
      instance: SyncResolved<Foo>,
    ): Resolved<Foo> => instance;
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
        buildZeroConstructorArgumentsResolver(Foo, resolveActivations);

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
        instance: SyncResolved<Foo>,
      ): Resolved<Foo> => {
        expectedResult = instance;

        return Promise.resolve(instance);
      };

      const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
        buildZeroConstructorArgumentsResolver(Foo, resolveActivations);

      result = await resolveNode(paramsFixture);
    });

    it('should return the resolved activation result', () => {
      expect(result).toBe(expectedResult);
    });
  });
});
