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
vitest.mock(import('./buildConstructorArgumentsResolverJit.js'));
vitest.mock(import('./buildOneConstructorArgumentResolverJit.js'));
vitest.mock(import('./buildOnePropertyArgumentResolverJit.js'));
vitest.mock(import('./buildResolveMany.js'));
vitest.mock(import('./buildZeroConstructorArgumentsResolverJit.js'));

import { InstanceBindingFixtures } from '../../binding/fixtures/InstanceBindingFixtures.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { ClassMetadataFixtures } from '../../metadata/fixtures/ClassMetadataFixtures.js';
import { type ClassElementMetadata } from '../../metadata/models/ClassElementMetadata.js';
import { resolveScopedWithNoActivations } from '../../resolution/actions/resolveScopedWithNoActivations.js';
import { resolveServiceActivations } from '../../resolution/actions/resolveServiceActivations.js';
import { type ResolutionParams } from '../../resolution/models/ResolutionParams.js';
import { type Resolved } from '../../resolution/models/Resolved.js';
import { type InstanceBindingNode } from '../models/InstanceBindingNode.js';
import { buildConstructorArgumentsResolverJit } from './buildConstructorArgumentsResolverJit.js';
import { buildNoActivationsInstanceBindingNodeResolverJit } from './buildNoActivationsInstanceBindingNodeResolverJit.js';
import { buildOneConstructorArgumentResolverJit } from './buildOneConstructorArgumentResolverJit.js';
import { buildOnePropertyArgumentResolverJit } from './buildOnePropertyArgumentResolverJit.js';
import { buildResolveMany } from './buildResolveMany.js';
import { buildZeroConstructorArgumentsResolverJit } from './buildZeroConstructorArgumentsResolverJit.js';
import { resolveFour } from './resolveFour.js';
import { resolveThree } from './resolveThree.js';
import { resolveTwo } from './resolveTwo.js';

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

describe(buildNoActivationsInstanceBindingNodeResolverJit, () => {
  describe('having node with zero constructor arguments, no properties and areServiceActivations false', () => {
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
          .mocked(buildZeroConstructorArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolverJit(
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

      it('should call buildZeroConstructorArgumentsResolverJit()', () => {
        expect(
          buildZeroConstructorArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding.implementationType,
          undefined,
        );
      });

      it('should not call other argument resolvers()', () => {
        expect(buildOneConstructorArgumentResolverJit).not.toHaveBeenCalled();
        expect(buildOnePropertyArgumentResolverJit).not.toHaveBeenCalled();
        expect(buildConstructorArgumentsResolverJit).not.toHaveBeenCalled();
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

  describe('having node with one constructor argument, no properties and areServiceActivations false', () => {
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
          .mocked(buildOneConstructorArgumentResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildOneConstructorArgumentResolverJit()', () => {
        expect(
          buildOneConstructorArgumentResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture,
          nodeFixture.binding.implementationType,
          undefined,
        );
      });

      it('should not call buildOnePropertyArgumentResolverJit()', () => {
        expect(buildOnePropertyArgumentResolverJit).not.toHaveBeenCalled();
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

  describe('having node with no constructor arguments, one property and areServiceActivations false', () => {
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(0, 1);
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
          .mocked(buildOnePropertyArgumentResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildOnePropertyArgumentResolverJit()', () => {
        expect(
          buildOnePropertyArgumentResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture,
          nodeFixture.binding.implementationType,
          undefined,
        );
      });

      it('should not call buildOneConstructorArgumentResolverJit()', () => {
        expect(buildOneConstructorArgumentResolverJit).not.toHaveBeenCalled();
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

  describe('having node with two constructor arguments, no properties and areServiceActivations false', () => {
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
          .mocked(buildConstructorArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildConstructorArgumentsResolverJit()', () => {
        expect(
          buildConstructorArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture,
          nodeFixture.binding.implementationType,
          resolveTwo,
          undefined,
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

  describe('having node with one constructor argument, one property and areServiceActivations false', () => {
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(1, 1);
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
          .mocked(buildConstructorArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildConstructorArgumentsResolverJit()', () => {
        expect(
          buildConstructorArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture,
          nodeFixture.binding.implementationType,
          resolveTwo,
          undefined,
        );
      });

      it('should not call buildOneConstructorArgumentResolverJit()', () => {
        expect(buildOneConstructorArgumentResolverJit).not.toHaveBeenCalled();
      });

      it('should not call buildOnePropertyArgumentResolverJit()', () => {
        expect(buildOnePropertyArgumentResolverJit).not.toHaveBeenCalled();
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

  describe('having node with three constructor arguments, no properties and areServiceActivations false', () => {
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
          .mocked(buildConstructorArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildConstructorArgumentsResolverJit()', () => {
        expect(
          buildConstructorArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture,
          nodeFixture.binding.implementationType,
          resolveThree,
          undefined,
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

  describe('having node with four constructor arguments, no properties and areServiceActivations false', () => {
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
          .mocked(buildConstructorArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildConstructorArgumentsResolverJit()', () => {
        expect(
          buildConstructorArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture,
          nodeFixture.binding.implementationType,
          resolveFour,
          undefined,
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

  describe('having node with more than four constructor arguments and properties combined and areServiceActivations false', () => {
    let nodeFixture: InstanceBindingNode<unknown, InstanceBinding<unknown>>;
    let areServiceActivationsFixture: boolean;

    beforeAll(() => {
      nodeFixture = buildNodeFixture(3, 2);
      areServiceActivationsFixture = false;
    });

    describe('when called', () => {
      let resolveManyFixture: Mock;
      let resolveNodeFixture: (params: ResolutionParams) => Resolved<unknown>;
      let scopedResolveFixture: (params: ResolutionParams) => Resolved<unknown>;

      let result: unknown;

      beforeAll(() => {
        resolveManyFixture = vitest.fn();
        resolveNodeFixture = vitest.fn();
        scopedResolveFixture = vitest.fn();

        vitest.mocked(buildResolveMany).mockReturnValueOnce(resolveManyFixture);
        vitest
          .mocked(buildConstructorArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolverJit(
          nodeFixture,
          areServiceActivationsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildResolveMany()', () => {
        expect(buildResolveMany).toHaveBeenCalledExactlyOnceWith(nodeFixture);
      });

      it('should call buildConstructorArgumentsResolverJit()', () => {
        expect(
          buildConstructorArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture,
          nodeFixture.binding.implementationType,
          resolveManyFixture,
          undefined,
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

  describe('having node with zero constructor arguments, no properties and areServiceActivations true', () => {
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
          .mocked(buildZeroConstructorArgumentsResolverJit)
          .mockReturnValueOnce(resolveNodeFixture);
        vitest
          .mocked(resolveScopedWithNoActivations)
          .mockReturnValueOnce(scopedResolveFixture);

        result = buildNoActivationsInstanceBindingNodeResolverJit(
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

      it('should call buildZeroConstructorArgumentsResolverJit()', () => {
        expect(
          buildZeroConstructorArgumentsResolverJit,
        ).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding.implementationType,
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
