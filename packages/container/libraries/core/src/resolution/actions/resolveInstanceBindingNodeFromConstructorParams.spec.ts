import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  Mocked,
  vitest,
} from 'vitest';

vitest.mock('./resolvePostConstruct');

import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { InstanceBinding } from '../../binding/models/InstanceBinding';
import { ClassMetadata } from '../../metadata/models/ClassMetadata';
import { BindingNodeParent } from '../../planning/models/BindingNodeParent';
import { InstanceBindingNode } from '../../planning/models/InstanceBindingNode';
import { PlanServiceNode } from '../../planning/models/PlanServiceNode';
import { ResolutionParams } from '../models/ResolutionParams';
import { Resolved, SyncResolved } from '../models/Resolved';
import { resolveInstanceBindingNodeFromConstructorParams } from './resolveInstanceBindingNodeFromConstructorParams';
import { resolvePostConstruct } from './resolvePostConstruct';

describe(resolveInstanceBindingNodeFromConstructorParams, () => {
  let setInstancePropertiesMock: Mock<
    (
      params: ResolutionParams,
      instance: Record<string | symbol, unknown>,
      node: InstanceBindingNode,
    ) => void | Promise<void>
  >;

  let constructorValuesFixture: unknown[];
  let paramsFixture: ResolutionParams;
  let nodeMock: Mocked<InstanceBindingNode<InstanceBinding<unknown>>>;

  beforeAll(() => {
    setInstancePropertiesMock = vitest.fn();

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
          postConstructMethodName: 'post-construct-method-name',
          preDestroyMethodName: undefined,
        },
      } as Partial<Mocked<ClassMetadata>> as Mocked<ClassMetadata>,
      constructorParams: [],
      parent: Symbol() as unknown as Mocked<BindingNodeParent>,
      propertyParams: new Map() as Mocked<
        Map<string | symbol, PlanServiceNode>
      >,
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
        .mockImplementationOnce(function (
          this: Record<string | symbol, unknown>,
        ) {
          this[expectedResultProperty] = expectedResultValue;
        });

      setInstancePropertiesMock.mockReturnValueOnce(undefined);

      result = resolveInstanceBindingNodeFromConstructorParams(
        setInstancePropertiesMock,
      )(constructorValuesFixture, paramsFixture, nodeMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call new node.binding.implementationType()', () => {
      expect(nodeMock.binding.implementationType).toHaveBeenCalledTimes(1);
      expect(nodeMock.binding.implementationType).toHaveBeenCalledWith(
        ...constructorValuesFixture,
      );
    });

    it('should call setInstanceProperties()', () => {
      expect(setInstancePropertiesMock).toHaveBeenCalledTimes(1);
      expect(setInstancePropertiesMock).toHaveBeenCalledWith(
        paramsFixture,
        expect.any(Object),
        nodeMock,
      );
    });

    it('should call resolvePostConstructor()', () => {
      expect(resolvePostConstruct).toHaveBeenCalledTimes(1);
      expect(resolvePostConstruct).toHaveBeenCalledWith(
        expect.any(Object),
        nodeMock.binding,
        nodeMock.classMetadata.lifecycle.postConstructMethodName,
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
        .mockImplementationOnce(function (
          this: Record<string | symbol, unknown>,
        ) {
          this[expectedResultProperty] = expectedResultValue;
        });

      setInstancePropertiesMock.mockResolvedValueOnce(undefined);

      result = resolveInstanceBindingNodeFromConstructorParams(
        setInstancePropertiesMock,
      )(constructorValuesFixture, paramsFixture, nodeMock);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call new node.binding.implementationType()', () => {
      expect(nodeMock.binding.implementationType).toHaveBeenCalledTimes(1);
      expect(nodeMock.binding.implementationType).toHaveBeenCalledWith(
        ...constructorValuesFixture,
      );
    });

    it('should call setInstanceProperties()', () => {
      expect(setInstancePropertiesMock).toHaveBeenCalledTimes(1);
      expect(setInstancePropertiesMock).toHaveBeenCalledWith(
        paramsFixture,
        expect.any(Object),
        nodeMock,
      );
    });

    it('should call resolvePostConstructor()', () => {
      expect(resolvePostConstruct).toHaveBeenCalledTimes(1);
      expect(resolvePostConstruct).toHaveBeenCalledWith(
        expect.any(Object),
        nodeMock.binding,
        nodeMock.classMetadata.lifecycle.postConstructMethodName,
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
