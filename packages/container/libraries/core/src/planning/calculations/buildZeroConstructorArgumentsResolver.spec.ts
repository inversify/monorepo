import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock(import('../../resolution/actions/setInstanceProperties.js'));

import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { setInstanceProperties } from '../../resolution/actions/setInstanceProperties.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { buildZeroConstructorArgumentsResolver } from './buildZeroConstructorArgumentsResolver.js';

class Foo {
  public readonly args: unknown[];

  constructor(...args: unknown[]) {
    this.args = args;
  }
}

function buildNodeFixture(
  propertiesSize: number = 0,
): InstanceBindingNode<Foo, InstanceBinding<Foo>> {
  const properties: Map<string | symbol, unknown> = new Map<
    string | symbol,
    unknown
  >();

  for (let index: number = 0; index < propertiesSize; ++index) {
    properties.set(`property-${index.toString()}`, Symbol());
  }

  return {
    binding: {
      implementationType: Foo,
    } as Partial<InstanceBinding<Foo>> as InstanceBinding<Foo>,
    classMetadata: {
      constructorArguments: [],
      lifecycle: {
        postConstructMethodNames: new Set(),
        preDestroyMethodNames: new Set(),
      },
      properties,
      scope: undefined,
    },
    constructorParams: [],
    propertyParams: new Map(),
  } as Partial<
    InstanceBindingNode<Foo, InstanceBinding<Foo>>
  > as InstanceBindingNode<Foo, InstanceBinding<Foo>>;
}

describe(buildZeroConstructorArgumentsResolver, () => {
  let paramsFixture: ResolutionParams;

  beforeAll(() => {
    paramsFixture = Symbol() as unknown as ResolutionParams;
  });

  describe('having node.classMetadata.properties empty and resolveActivations not provided', () => {
    let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

    beforeAll(() => {
      nodeFixture = buildNodeFixture();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildZeroConstructorArgumentsResolver(nodeFixture);

        result = resolveNode(paramsFixture);
      });

      it('should build an instance with no constructor arguments', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual([]);
      });

      it('should not call setInstanceProperties()', () => {
        expect(setInstanceProperties).not.toHaveBeenCalled();
      });
    });
  });

  describe('having node.classMetadata.properties empty and resolveActivations provided', () => {
    let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

    beforeAll(() => {
      nodeFixture = buildNodeFixture();
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildZeroConstructorArgumentsResolver(
            nodeFixture,
            (
              _params: ResolutionParams,
              instance: Resolved<Foo>,
            ): Resolved<Foo> => instance,
          );

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
        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildZeroConstructorArgumentsResolver(
            nodeFixture,
            (
              _params: ResolutionParams,
              instance: Resolved<Foo>,
            ): Resolved<Foo> => {
              expectedResult = instance;

              return Promise.resolve(instance);
            },
          );

        result = await resolveNode(paramsFixture);
      });

      it('should return the resolved activation result', () => {
        expect(result).toBe(expectedResult);
      });
    });
  });

  describe('having node.classMetadata.properties not empty and resolveActivations not provided', () => {
    let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(1);
    });

    describe('when called, and setInstanceProperties() returns undefined', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(setInstanceProperties).mockReturnValueOnce(undefined);

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildZeroConstructorArgumentsResolver(nodeFixture);

        result = resolveNode(paramsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should build an instance with no constructor arguments', () => {
        expect(result).toBeInstanceOf(Foo);
        expect((result as Foo).args).toStrictEqual([]);
      });

      it('should call setInstanceProperties()', () => {
        expect(setInstanceProperties).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(Foo),
          nodeFixture,
        );
      });
    });

    describe('when called, and setInstanceProperties() returns a promise', () => {
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(setInstanceProperties).mockResolvedValueOnce(undefined);

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildZeroConstructorArgumentsResolver(nodeFixture);

        result = resolveNode(paramsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should build an instance with no constructor arguments', () => {
        expect(result).toStrictEqual(Promise.resolve(expect.any(Foo)));
      });

      it('should call setInstanceProperties()', () => {
        expect(setInstanceProperties).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(Foo),
          nodeFixture,
        );
      });
    });
  });

  describe('having node.classMetadata.properties not empty and resolveActivations provided', () => {
    let nodeFixture: InstanceBindingNode<Foo, InstanceBinding<Foo>>;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(1);
    });

    describe('when called, and setInstanceProperties() returns undefined', () => {
      let expectedResult: unknown;
      let result: unknown;

      beforeAll(() => {
        vitest.mocked(setInstanceProperties).mockReturnValueOnce(undefined);

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildZeroConstructorArgumentsResolver(
            nodeFixture,
            (
              _params: ResolutionParams,
              instance: Resolved<Foo>,
            ): Resolved<Foo> => {
              expectedResult = instance;

              return instance;
            },
          );

        result = resolveNode(paramsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return the activation result', () => {
        expect(result).toBe(expectedResult);
      });

      it('should call setInstanceProperties()', () => {
        expect(setInstanceProperties).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(Foo),
          nodeFixture,
        );
      });
    });

    describe('when called, and setInstanceProperties() returns a promise', () => {
      let expectedResult: unknown;
      let result: unknown;

      beforeAll(async () => {
        vitest.mocked(setInstanceProperties).mockResolvedValueOnce(undefined);

        const resolveNode: (params: ResolutionParams) => Resolved<Foo> =
          buildZeroConstructorArgumentsResolver(
            nodeFixture,
            (
              _params: ResolutionParams,
              instance: Resolved<Foo>,
            ): Resolved<Foo> => {
              expectedResult = instance;

              return Promise.resolve(instance);
            },
          );

        result = await resolveNode(paramsFixture);
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should return the resolved activation result', () => {
        expect(result).toBe(expectedResult);
      });

      it('should call setInstanceProperties()', () => {
        expect(setInstanceProperties).toHaveBeenCalledExactlyOnceWith(
          paramsFixture,
          expect.any(Foo),
          nodeFixture,
        );
      });
    });
  });
});
