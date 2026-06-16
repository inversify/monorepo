import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

vitest.mock(import('./resolvePostConstruct.js'));
vitest.mock(import('./setInstanceProperties.js'));

import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type InstanceBinding } from '../../binding/models/InstanceBinding.js';
import { type ClassMetadata } from '../../metadata/models/ClassMetadata.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { type Resolved, type SyncResolved } from '../models/Resolved.js';
import { resolveInstanceBindingNodeFromConstructorParams } from './resolveInstanceBindingNodeFromConstructorParams.js';
import { resolvePostConstruct } from './resolvePostConstruct.js';
import { setInstanceProperties } from './setInstanceProperties.js';

describe(resolveInstanceBindingNodeFromConstructorParams, () => {
  let constructorValuesFixture: unknown[];
  let paramsFixture: ResolutionParams;
  let nodeMock: Mocked<InstanceBindingNode<unknown, InstanceBinding<unknown>>>;

  beforeAll(() => {
    constructorValuesFixture = [Symbol()];
    paramsFixture = Symbol() as unknown as ResolutionParams;
    nodeMock = {
      binding: {
        cache: {
          isRight: false,
          value: undefined,
        },
        id: 1,
        implementationType: vitest.fn(),
        isSatisfiedBy: vitest.fn(),
        moduleId: undefined,
        onActivation: undefined,
        onDeactivation: undefined,
        scope: bindingScopeValues.Singleton,
        serviceIdentifier: 'service-id',
        type: bindingTypeValues.Instance,
      },
      classMetadata: {
        constructorArguments: [],
        lifecycle: {
          postConstructMethodNames: new Set(['post-construct-method-name']),
          preDestroyMethodNames: new Set(),
        },
      } as Partial<Mocked<ClassMetadata>> as Mocked<ClassMetadata>,
      constructorParams: [],
      propertyParams: new Map() as Mocked<
        Map<string | symbol, PlanServiceNode>
      >,
      resolve: vitest.fn(),
    };

    vitest
      .mocked(resolvePostConstruct)
      .mockImplementation(
        <TActivated>(
          instance: SyncResolved<TActivated> & Record<string | symbol, unknown>,
        ): Resolved<TActivated> => instance,
      );
  });

  describe('when called, and setInstanceProperties() returns undefined', () => {
    let expectedResultProperty: string | symbol;
    let expectedResultValue: unknown;

    let result: unknown;

    beforeAll(() => {
      expectedResultProperty = Symbol();
      expectedResultValue = 'value-fixture';

      vitest
        .mocked(nodeMock.binding.implementationType)
        .mockImplementationOnce(function (this: unknown) {
          (this as Record<string | symbol, unknown>)[expectedResultProperty] =
            expectedResultValue;
        });

      vitest.mocked(setInstanceProperties).mockReturnValueOnce(undefined);

      result = resolveInstanceBindingNodeFromConstructorParams(
        constructorValuesFixture,
        paramsFixture,
        nodeMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call new node.binding.implementationType()', () => {
      expect(
        nodeMock.binding.implementationType,
      ).toHaveBeenCalledExactlyOnceWith(...constructorValuesFixture);
    });

    it('should call setInstanceProperties()', () => {
      expect(setInstanceProperties).toHaveBeenCalledExactlyOnceWith(
        paramsFixture,
        expect.any(Object),
        nodeMock,
      );
    });

    it('should call resolvePostConstructor()', () => {
      expect(resolvePostConstruct).toHaveBeenCalledExactlyOnceWith(
        expect.any(Object),
        nodeMock.binding,
        'post-construct-method-name',
      );
    });

    it('should return expected result', () => {
      const expectedResultProperties: Record<string | symbol, unknown> = {
        [expectedResultProperty]: expectedResultValue,
      };

      expect(result).toStrictEqual(
        expect.objectContaining(expectedResultProperties),
      );
    });
  });

  describe('when called, and setInstanceProperties() returns promise', () => {
    let expectedResultProperty: string | symbol;
    let expectedResultValue: unknown;

    let result: unknown;

    beforeAll(() => {
      expectedResultProperty = Symbol();
      expectedResultValue = 'value-fixture';

      vitest
        .mocked(nodeMock.binding.implementationType)
        .mockImplementationOnce(function (this: unknown) {
          (this as Record<string | symbol, unknown>)[expectedResultProperty] =
            expectedResultValue;
        });

      vitest.mocked(setInstanceProperties).mockResolvedValueOnce(undefined);

      result = resolveInstanceBindingNodeFromConstructorParams(
        constructorValuesFixture,
        paramsFixture,
        nodeMock,
      );
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call new node.binding.implementationType()', () => {
      expect(
        nodeMock.binding.implementationType,
      ).toHaveBeenCalledExactlyOnceWith(...constructorValuesFixture);
    });

    it('should call setInstanceProperties()', () => {
      expect(setInstanceProperties).toHaveBeenCalledExactlyOnceWith(
        paramsFixture,
        expect.any(Object),
        nodeMock,
      );
    });

    it('should call resolvePostConstructor()', () => {
      expect(resolvePostConstruct).toHaveBeenCalledExactlyOnceWith(
        expect.any(Object),
        nodeMock.binding,
        'post-construct-method-name',
      );
    });

    it('should return expected result', () => {
      const expectedResultProperties: Record<string | symbol, unknown> = {
        [expectedResultProperty]: expectedResultValue,
      };

      expect(result).toStrictEqual(
        Promise.resolve(expect.objectContaining(expectedResultProperties)),
      );
    });
  });
});
