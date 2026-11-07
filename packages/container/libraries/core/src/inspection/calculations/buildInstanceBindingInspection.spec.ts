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
  import('../../common/calculations/buildBuildServiceNodeOptionsFromClassElementMetadata.js'),
);
vitest.mock(import('./buildScopedBindingInspection.js'));

import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { buildBuildServiceNodeOptionsFromClassElementMetadata } from '../../common/calculations/buildBuildServiceNodeOptionsFromClassElementMetadata.js';
import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind.js';
import { type ManagedClassElementMetadata } from '../../metadata/models/ManagedClassElementMetadata.js';
import { type UnmanagedClassElementMetadata } from '../../metadata/models/UnmanagedClassElementMetadata.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type ConstructorNoParamNode } from '../../planning/models/ConstructorNoParamNode.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type InstanceBindingInspection } from '../models/InstanceBindingInspection.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { type ScopedBindingInspection } from '../models/ScopedBindingInspection.js';
import { buildInstanceBindingInspection } from './buildInstanceBindingInspection.js';
import { buildScopedBindingInspection } from './buildScopedBindingInspection.js';

describe(buildInstanceBindingInspection, () => {
  let buildPlanServiceInspectionMock: Mock<
    (
      serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
      serviceNode: PlanServiceNode,
      options: BuildServiceNodeOptions,
    ) => PlanServiceInspection
  >;

  beforeAll(() => {
    buildPlanServiceInspectionMock = vitest.fn();
  });

  describe('having an InstanceBindingNode with managed and unmanaged constructor arguments and a property', () => {
    let constructorArgumentMetadataFixture: ManagedClassElementMetadata;
    let propertyMetadataFixture: ManagedClassElementMetadata;
    let constructorParamFixture: PlanServiceNode;
    let propertyParamFixture: PlanServiceNode;
    let nodeFixture: InstanceBindingNode;

    beforeAll(() => {
      constructorArgumentMetadataFixture = {
        kind: ClassElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: Symbol(),
      };
      propertyMetadataFixture = {
        chained: false,
        kind: ClassElementMetadataKind.multipleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: Symbol(),
      };
      constructorParamFixture = Symbol() as unknown as PlanServiceNode;
      propertyParamFixture = Symbol() as unknown as PlanServiceNode;

      const unmanagedMetadataFixture: UnmanagedClassElementMetadata = {
        kind: ClassElementMetadataKind.unmanaged,
      };

      const noParamNodeFixture: ConstructorNoParamNode = {
        isNoParam: true,
        resolve: () => undefined,
      };

      nodeFixture = {
        binding: {
          id: 1,
          implementationType: class {},
          moduleId: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: Symbol(),
          type: bindingTypeValues.Instance,
        },
        classMetadata: {
          constructorArguments: [
            constructorArgumentMetadataFixture,
            unmanagedMetadataFixture,
          ],
          lifecycle: {
            postConstructMethodNames: new Set(),
            preDestroyMethodNames: new Set(),
          },
          properties: new Map([['foo', propertyMetadataFixture]]),
          scope: undefined,
        },
        constructorParams: [constructorParamFixture, noParamNodeFixture],
        propertyParams: new Map([['foo', propertyParamFixture]]),
      } as Partial<InstanceBindingNode> as InstanceBindingNode;
    });

    describe('when called', () => {
      let serviceInspectionsFixture: Map<
        PlanServiceNode,
        PlanServiceInspection
      >;
      let scopedBindingInspectionFixture: ScopedBindingInspection<
        typeof bindingTypeValues.Instance
      >;
      let constructorArgumentOptionsFixture: BuildServiceNodeOptions;
      let propertyOptionsFixture: BuildServiceNodeOptions;
      let constructorArgumentInspectionFixture: PlanServiceInspection;
      let propertyInspectionFixture: PlanServiceInspection;

      let result: unknown;

      beforeAll(() => {
        serviceInspectionsFixture = new Map();
        scopedBindingInspectionFixture = {
          id: 1,
          moduleId: undefined,
          scope: bindingScopeValues.Singleton,
          serviceIdentifier: nodeFixture.binding.serviceIdentifier,
          type: bindingTypeValues.Instance,
        };
        constructorArgumentOptionsFixture =
          Symbol() as unknown as BuildServiceNodeOptions;
        propertyOptionsFixture = Symbol() as unknown as BuildServiceNodeOptions;
        constructorArgumentInspectionFixture =
          Symbol() as unknown as PlanServiceInspection;
        propertyInspectionFixture =
          Symbol() as unknown as PlanServiceInspection;

        vitest
          .mocked(buildScopedBindingInspection)
          .mockReturnValueOnce(scopedBindingInspectionFixture);

        vitest
          .mocked(buildBuildServiceNodeOptionsFromClassElementMetadata)
          .mockReturnValueOnce(constructorArgumentOptionsFixture)
          .mockReturnValueOnce(propertyOptionsFixture);

        buildPlanServiceInspectionMock
          .mockReturnValueOnce(constructorArgumentInspectionFixture)
          .mockReturnValueOnce(propertyInspectionFixture);

        result = buildInstanceBindingInspection(
          buildPlanServiceInspectionMock,
          serviceInspectionsFixture,
          nodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildScopedBindingInspection()', () => {
        expect(buildScopedBindingInspection).toHaveBeenCalledExactlyOnceWith(
          nodeFixture.binding,
        );
      });

      it('should call buildBuildServiceNodeOptionsFromClassElementMetadata()', () => {
        expect(
          buildBuildServiceNodeOptionsFromClassElementMetadata,
        ).toHaveBeenCalledTimes(2);
        expect(
          buildBuildServiceNodeOptionsFromClassElementMetadata,
        ).toHaveBeenNthCalledWith(1, constructorArgumentMetadataFixture);
        expect(
          buildBuildServiceNodeOptionsFromClassElementMetadata,
        ).toHaveBeenNthCalledWith(2, propertyMetadataFixture);
      });

      it('should call buildPlanServiceInspection()', () => {
        expect(buildPlanServiceInspectionMock).toHaveBeenCalledTimes(2);
        expect(buildPlanServiceInspectionMock).toHaveBeenNthCalledWith(
          1,
          serviceInspectionsFixture,
          constructorParamFixture,
          constructorArgumentOptionsFixture,
        );
        expect(buildPlanServiceInspectionMock).toHaveBeenNthCalledWith(
          2,
          serviceInspectionsFixture,
          propertyParamFixture,
          propertyOptionsFixture,
        );
      });

      it('should return an InstanceBindingInspection', () => {
        const expected: InstanceBindingInspection = {
          ...scopedBindingInspectionFixture,
          constructorArguments: [
            constructorArgumentInspectionFixture,
            undefined,
          ],
          implementationType: nodeFixture.binding.implementationType,
          properties: new Map([['foo', propertyInspectionFixture]]),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
