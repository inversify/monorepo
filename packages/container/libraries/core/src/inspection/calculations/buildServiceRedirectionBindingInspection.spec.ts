import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { bindingTypeValues } from '../../binding/models/BindingType.js';
import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type PlanServiceRedirectionBindingNode } from '../../planning/models/PlanServiceRedirectionBindingNode.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { type ServiceRedirectionBindingInspection } from '../models/ServiceRedirectionBindingInspection.js';
import { buildServiceRedirectionBindingInspection } from './buildServiceRedirectionBindingInspection.js';

describe(buildServiceRedirectionBindingInspection, () => {
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

  describe('having a PlanServiceRedirectionBindingNode', () => {
    let redirectionFixture: PlanServiceNode;
    let nodeFixture: PlanServiceRedirectionBindingNode;
    let optionsFixture: BuildServiceNodeOptions;

    beforeAll(() => {
      redirectionFixture = Symbol() as unknown as PlanServiceNode;
      nodeFixture = {
        binding: {
          id: 1,
          moduleId: 2,
          serviceIdentifier: Symbol(),
          targetServiceIdentifier: Symbol(),
          type: bindingTypeValues.ServiceRedirection,
        },
        redirection: redirectionFixture,
      } as Partial<PlanServiceRedirectionBindingNode> as PlanServiceRedirectionBindingNode;
      optionsFixture = {
        chained: true,
        isMultiple: true,
        name: 'name',
        optional: true,
        serviceIdentifier: nodeFixture.binding.serviceIdentifier,
        tags: new Map([['tag', 'value']]),
      };
    });

    describe('when called', () => {
      let serviceInspectionsFixture: Map<
        PlanServiceNode,
        PlanServiceInspection
      >;
      let redirectionInspectionFixture: PlanServiceInspection;

      let result: unknown;

      beforeAll(() => {
        serviceInspectionsFixture = new Map();
        redirectionInspectionFixture =
          Symbol() as unknown as PlanServiceInspection;

        buildPlanServiceInspectionMock.mockReturnValueOnce(
          redirectionInspectionFixture,
        );

        result = buildServiceRedirectionBindingInspection(
          buildPlanServiceInspectionMock,
          serviceInspectionsFixture,
          nodeFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildPlanServiceInspection() with the redirected options', () => {
        const expectedOptions: BuildServiceNodeOptions = {
          ...optionsFixture,
          serviceIdentifier: nodeFixture.binding.targetServiceIdentifier,
        };

        expect(buildPlanServiceInspectionMock).toHaveBeenCalledExactlyOnceWith(
          serviceInspectionsFixture,
          redirectionFixture,
          expectedOptions,
        );
      });

      it('should return a ServiceRedirectionBindingInspection', () => {
        const expected: ServiceRedirectionBindingInspection = {
          id: 1,
          moduleId: 2,
          redirection: redirectionInspectionFixture,
          serviceIdentifier: nodeFixture.binding.serviceIdentifier,
          targetServiceIdentifier: nodeFixture.binding.targetServiceIdentifier,
          type: bindingTypeValues.ServiceRedirection,
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });
});
