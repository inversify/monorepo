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
  import('../../common/calculations/buildBuildServiceNodeOptionsFromResolvedValueElementMetadata.js'),
);
vitest.mock(import('./buildScopedBindingInspection.js'));

import { bindingScopeValues } from '../../binding/models/BindingScope.js';
import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { buildBuildServiceNodeOptionsFromResolvedValueElementMetadata } from '../../common/calculations/buildBuildServiceNodeOptionsFromResolvedValueElementMetadata.js';
import { type ResolvedValueElementMetadata } from '../../metadata/models/ResolvedValueElementMetadata.js';
import { ResolvedValueElementMetadataKind } from '../../metadata/models/ResolvedValueElementMetadataKind.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolvedValueBindingNode } from '../../planning/models/ResolvedValueBindingNode.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { type ResolvedValueBindingInspection } from '../models/ResolvedValueBindingInspection.js';
import { type ScopedBindingInspection } from '../models/ScopedBindingInspection.js';
import { buildResolvedValueBindingInspection } from './buildResolvedValueBindingInspection.js';
import { buildScopedBindingInspection } from './buildScopedBindingInspection.js';

describe(buildResolvedValueBindingInspection, () => {
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

  describe('having a ResolvedValueBindingNode with an argument', () => {
    let argumentMetadataFixture: ResolvedValueElementMetadata;
    let paramFixture: PlanServiceNode;
    let nodeFixture: ResolvedValueBindingNode;

    beforeAll(() => {
      argumentMetadataFixture = {
        kind: ResolvedValueElementMetadataKind.singleInjection,
        name: undefined,
        optional: false,
        tags: new Map(),
        value: Symbol(),
      };
      paramFixture = Symbol() as unknown as PlanServiceNode;

      nodeFixture = {
        binding: {
          id: 1,
          metadata: {
            arguments: [argumentMetadataFixture],
          },
          moduleId: undefined,
          scope: bindingScopeValues.Transient,
          serviceIdentifier: Symbol(),
          type: bindingTypeValues.ResolvedValue,
        },
        params: [paramFixture],
      } as Partial<ResolvedValueBindingNode> as ResolvedValueBindingNode;
    });

    describe('when called', () => {
      let serviceInspectionsFixture: Map<
        PlanServiceNode,
        PlanServiceInspection
      >;
      let scopedBindingInspectionFixture: ScopedBindingInspection<
        typeof bindingTypeValues.ResolvedValue
      >;
      let argumentOptionsFixture: BuildServiceNodeOptions;
      let argumentInspectionFixture: PlanServiceInspection;

      let result: unknown;

      beforeAll(() => {
        serviceInspectionsFixture = new Map();
        scopedBindingInspectionFixture = {
          id: 1,
          moduleId: undefined,
          scope: bindingScopeValues.Transient,
          serviceIdentifier: nodeFixture.binding.serviceIdentifier,
          type: bindingTypeValues.ResolvedValue,
        };
        argumentOptionsFixture = Symbol() as unknown as BuildServiceNodeOptions;
        argumentInspectionFixture =
          Symbol() as unknown as PlanServiceInspection;

        vitest
          .mocked(buildScopedBindingInspection)
          .mockReturnValueOnce(scopedBindingInspectionFixture);

        vitest
          .mocked(buildBuildServiceNodeOptionsFromResolvedValueElementMetadata)
          .mockReturnValueOnce(argumentOptionsFixture);

        buildPlanServiceInspectionMock.mockReturnValueOnce(
          argumentInspectionFixture,
        );

        result = buildResolvedValueBindingInspection(
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

      it('should call buildBuildServiceNodeOptionsFromResolvedValueElementMetadata()', () => {
        expect(
          buildBuildServiceNodeOptionsFromResolvedValueElementMetadata,
        ).toHaveBeenCalledExactlyOnceWith(argumentMetadataFixture);
      });

      it('should call buildPlanServiceInspection()', () => {
        expect(buildPlanServiceInspectionMock).toHaveBeenCalledExactlyOnceWith(
          serviceInspectionsFixture,
          paramFixture,
          argumentOptionsFixture,
        );
      });

      it('should return a ResolvedValueBindingInspection', () => {
        const expected: ResolvedValueBindingInspection = {
          ...scopedBindingInspectionFixture,
          arguments: [argumentInspectionFixture],
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
