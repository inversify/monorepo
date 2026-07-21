import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

vitest.mock(
  import('../../resolution/actions/resolveScopedWithNoActivations.js'),
);
vitest.mock(import('../../resolution/actions/resolveServiceActivations.js'));
vitest.mock(import('./buildConstructorArgumentsResolver.js'));
vitest.mock(import('./buildFourConstructorArgumentResolver.js'));
vitest.mock(import('./buildOneConstructorArgumentResolver.js'));
vitest.mock(import('./buildThreeConstructorArgumentResolver.js'));
vitest.mock(import('./buildTwoConstructorArgumentResolver.js'));
vitest.mock(import('./buildZeroConstructorArgumentsResolver.js'));

import { InstanceBindingFixtures } from '../../binding/fixtures/InstanceBindingFixtures.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures.js';
import { type ClassElementMetadata } from '../../metadata/models/ClassElementMetadata.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { resolveServiceActivations } from '../../resolution/actions/resolveServiceActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { buildConstructorArgumentsResolver } from './buildConstructorArgumentsResolver.js';
import { buildFourConstructorArgumentResolver } from './buildFourConstructorArgumentResolver.js';
import { buildNoActivationsInstanceBindingNodeResolver } from './buildNoActivationsInstanceBindingNodeResolver.js';
import { buildOneConstructorArgumentResolver } from './buildOneConstructorArgumentResolver.js';
import { buildThreeConstructorArgumentResolver } from './buildThreeConstructorArgumentResolver.js';
import { buildTwoConstructorArgumentResolver } from './buildTwoConstructorArgumentResolver.js';
import { buildZeroConstructorArgumentsResolver } from './buildZeroConstructorArgumentsResolver.js';
import { resolveMany } from './resolveMany.js';

function buildNodeFixture(
  constructorArgumentsLength: number,
  propertiesSize: number = 0,
): InstanceBindingNode<unknown, InstanceBinding<unknown>> {
  const properties: Map<string | symbol, ClassElementMetadata> = new Map();

  for (let index: number = 0; index < propertiesSize; ++index) {
    properties.set(
      `property-${index.toString()}`,
      Symbol() as unknown as ClassElementMetadata,
    );
  }

  return {
    binding: InstanceBindingFixtures.any,
    classMetadata: {
      ...ClassMetadataFixtures.any,
      constructorArguments: new Array<ClassElementMetadata>(
        constructorArgumentsLength,
      ).fill(Symbol() as unknown as ClassElementMetadata),
      properties,
    },
    constructorParams: [],
    propertyParams: new Map(),
  } as Partial<
    InstanceBindingNode<unknown, InstanceBinding<unknown>>
  > as InstanceBindingNode<unknown, InstanceBinding<unknown>>;
}

describe(buildNoActivationsInstanceBindingNodeResolver, () => {
  describe('having node with zero constructor arguments and areServiceActivations false', () => {
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(0);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildZeroConstructorArgumentsResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call resolveServiceActivations()', () => {
        expect(resolveServiceActivations).not.toHaveBeenCalled();
      });

      it('should call buildZeroConstructorArgumentsResolver()', () => {
        expect(
          buildZeroConstructorArgumentsResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should not call other constructor argument resolvers()', () => {
        expect(buildOneConstructorArgumentResolver).not.toHaveBeenCalled();
        expect(buildTwoConstructorArgumentResolver).not.toHaveBeenCalled();
        expect(buildThreeConstructorArgumentResolver).not.toHaveBeenCalled();
        expect(buildFourConstructorArgumentResolver).not.toHaveBeenCalled();
        expect(buildConstructorArgumentsResolver).not.toHaveBeenCalled();
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with zero constructor arguments, properties and areServiceActivations false', () => {
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(0, 2);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildZeroConstructorArgumentsResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildZeroConstructorArgumentsResolver()', () => {
        expect(
          buildZeroConstructorArgumentsResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with one constructor argument and areServiceActivations false', () => {
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(1);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildOneConstructorArgumentResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildOneConstructorArgumentResolver()', () => {
        expect(
          buildOneConstructorArgumentResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with two constructor arguments and areServiceActivations false', () => {
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(2);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildTwoConstructorArgumentResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildTwoConstructorArgumentResolver()', () => {
        expect(
          buildTwoConstructorArgumentResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with three constructor arguments and areServiceActivations false', () => {
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(3);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildThreeConstructorArgumentResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildThreeConstructorArgumentResolver()', () => {
        expect(
          buildThreeConstructorArgumentResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with four constructor arguments and areServiceActivations false', () => {
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(4);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildFourConstructorArgumentResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildFourConstructorArgumentResolver()', () => {
        expect(
          buildFourConstructorArgumentResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, undefined);
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with more than four constructor arguments and areServiceActivations false', () => {
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(5);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(buildConstructorArgumentsResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildConstructorArgumentsResolver()', () => {
        expect(
          buildConstructorArgumentsResolver,
        ).toHaveBeenCalledExactlyOnceWith(nodeFixture, resolveMany, undefined);
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });

  describe('having node with zero constructor arguments and areServiceActivations true', () => {
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(0);
      areServiceActivationsFixture = true;
    });

    describe('when called', () => {
      let resolveActivationsFixture: Mock<
        (
          params: ResolutionParams,
          value: Resolved<unknown>,
        ) => Resolved<unknown>
      >;
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveActivationsFixture = vitest.fn();
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest
          .mocked(resolveServiceActivations)
          .mockReturnValueOnce(resolveActivationsFixture);
        vitest
          .mocked(buildZeroConstructorArgumentsResolver)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolver(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call resolveServiceActivations()', () => {
        expect(resolveServiceActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding.serviceIdentifier,
        );
      });

      it('should call buildZeroConstructorArgumentsResolver()', () => {
        expect(
          buildZeroConstructorArgumentsResolver,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture,
          resolveActivationsFixture,
        );
      });

      it('should call resolveScopedWithNoActivations()', () => {
        expect(resolveScopedWithNoActivations).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
          resolveNodeFixture,
        );
      });

      it('should return expected result', () => {
        expect(result).toBe(scopedResolveFixture);
      });
    });
  });
});
