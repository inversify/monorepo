import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mock,
  vitest,
} from 'vitest';

import { type BuildServiceNodeOptions } from '../../planning/models/BuildServiceNodeOptions.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type PlanBindingInspection } from '../models/PlanBindingInspection.js';
import { type PlanServiceInspection } from '../models/PlanServiceInspection.js';
import { curryBuildPlanServiceInspection } from './curryBuildPlanServiceInspection.js';

describe(curryBuildPlanServiceInspection, () => {
  let buildPlanBindingInspectionMock: Mock<
    (
      serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
      bindingNode: PlanBindingNode,
      options: BuildServiceNodeOptions,
    ) => PlanBindingInspection
  >;

  let buildPlanServiceInspection: (
    serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
    serviceNode: PlanServiceNode,
    options: BuildServiceNodeOptions,
  ) => PlanServiceInspection;

  beforeAll(() => {
    buildPlanBindingInspectionMock = vitest.fn();

    buildPlanServiceInspection = curryBuildPlanServiceInspection(
      buildPlanBindingInspectionMock,
    );
  });

  describe('having a PlanServiceNode already inspected', () => {
    let serviceNodeFixture: PlanServiceNode;
    let serviceInspectionFixture: PlanServiceInspection;
    let serviceInspectionsFixture: Map<PlanServiceNode, PlanServiceInspection>;

    beforeAll(() => {
      serviceNodeFixture = Symbol() as unknown as PlanServiceNode;
      serviceInspectionFixture = Symbol() as unknown as PlanServiceInspection;
      serviceInspectionsFixture = new Map([
        [serviceNodeFixture, serviceInspectionFixture],
      ]);
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildPlanServiceInspection(
          serviceInspectionsFixture,
          serviceNodeFixture,
          Symbol() as unknown as BuildServiceNodeOptions,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call buildPlanBindingInspection()', () => {
        expect(buildPlanBindingInspectionMock).not.toHaveBeenCalled();
      });

      it('should return the existing PlanServiceInspection', () => {
        expect(result).toBe(serviceInspectionFixture);
      });
    });
  });

  describe('having single BuildServiceNodeOptions and a PlanServiceNode with a binding', () => {
    let bindingNodeFixture: PlanBindingNode;
    let serviceNodeFixture: PlanServiceNode;
    let optionsFixture: BuildServiceNodeOptions;

    beforeAll(() => {
      bindingNodeFixture = Symbol() as unknown as PlanBindingNode;
      serviceNodeFixture = {
        bindings: bindingNodeFixture,
        serviceIdentifier: Symbol(),
      } as Partial<PlanServiceNode> as PlanServiceNode;
      optionsFixture = {
        isMultiple: false,
        name: 'name',
        optional: true,
        serviceIdentifier: serviceNodeFixture.serviceIdentifier,
        tags: new Map([['tag', 'value']]),
      };
    });

    describe('when called', () => {
      let serviceInspectionsFixture: Map<
        PlanServiceNode,
        PlanServiceInspection
      >;
      let bindingInspectionFixture: PlanBindingInspection;

      let result: unknown;

      beforeAll(() => {
        serviceInspectionsFixture = new Map();
        bindingInspectionFixture = Symbol() as unknown as PlanBindingInspection;

        buildPlanBindingInspectionMock.mockReturnValueOnce(
          bindingInspectionFixture,
        );

        result = buildPlanServiceInspection(
          serviceInspectionsFixture,
          serviceNodeFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildPlanBindingInspection()', () => {
        expect(buildPlanBindingInspectionMock).toHaveBeenCalledExactlyOnceWith(
          serviceInspectionsFixture,
          bindingNodeFixture,
          optionsFixture,
        );
      });

      it('should register the PlanServiceInspection', () => {
        expect(serviceInspectionsFixture.get(serviceNodeFixture)).toBe(result);
      });

      it('should return a SingleBindingPlanServiceInspection', () => {
        const expected: PlanServiceInspection = {
          binding: bindingInspectionFixture,
          isMultiple: false,
          name: 'name',
          optional: true,
          serviceIdentifier: serviceNodeFixture.serviceIdentifier,
          tags: new Map([['tag', 'value']]),
        };

        expect(result).toStrictEqual(expected);
      });

      it('should not share tags with BuildServiceNodeOptions', () => {
        expect((result as PlanServiceInspection).tags).not.toBe(
          optionsFixture.tags,
        );
      });
    });
  });

  describe('having single BuildServiceNodeOptions and a PlanServiceNode without bindings', () => {
    let serviceNodeFixture: PlanServiceNode;
    let optionsFixture: BuildServiceNodeOptions;

    beforeAll(() => {
      serviceNodeFixture = {
        bindings: undefined,
        serviceIdentifier: Symbol(),
      } as Partial<PlanServiceNode> as PlanServiceNode;
      optionsFixture = {
        isMultiple: false,
        name: undefined,
        optional: true,
        serviceIdentifier: serviceNodeFixture.serviceIdentifier,
        tags: new Map(),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildPlanServiceInspection(
          new Map(),
          serviceNodeFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call buildPlanBindingInspection()', () => {
        expect(buildPlanBindingInspectionMock).not.toHaveBeenCalled();
      });

      it('should return a SingleBindingPlanServiceInspection', () => {
        const expected: PlanServiceInspection = {
          binding: undefined,
          isMultiple: false,
          name: undefined,
          optional: true,
          serviceIdentifier: serviceNodeFixture.serviceIdentifier,
          tags: new Map(),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having multiple BuildServiceNodeOptions and a PlanServiceNode with bindings', () => {
    let firstBindingNodeFixture: PlanBindingNode;
    let secondBindingNodeFixture: PlanBindingNode;
    let serviceNodeFixture: PlanServiceNode;
    let optionsFixture: BuildServiceNodeOptions;

    beforeAll(() => {
      firstBindingNodeFixture = Symbol() as unknown as PlanBindingNode;
      secondBindingNodeFixture = Symbol() as unknown as PlanBindingNode;
      serviceNodeFixture = {
        bindings: [firstBindingNodeFixture, secondBindingNodeFixture],
        serviceIdentifier: Symbol(),
      } as Partial<PlanServiceNode> as PlanServiceNode;
      optionsFixture = {
        chained: true,
        isMultiple: true,
        name: undefined,
        optional: false,
        serviceIdentifier: serviceNodeFixture.serviceIdentifier,
        tags: new Map(),
      };
    });

    describe('when called', () => {
      let serviceInspectionsFixture: Map<
        PlanServiceNode,
        PlanServiceInspection
      >;
      let firstBindingInspectionFixture: PlanBindingInspection;
      let secondBindingInspectionFixture: PlanBindingInspection;

      let result: unknown;

      beforeAll(() => {
        serviceInspectionsFixture = new Map();
        firstBindingInspectionFixture =
          Symbol() as unknown as PlanBindingInspection;
        secondBindingInspectionFixture =
          Symbol() as unknown as PlanBindingInspection;

        buildPlanBindingInspectionMock
          .mockReturnValueOnce(firstBindingInspectionFixture)
          .mockReturnValueOnce(secondBindingInspectionFixture);

        result = buildPlanServiceInspection(
          serviceInspectionsFixture,
          serviceNodeFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildPlanBindingInspection()', () => {
        expect(buildPlanBindingInspectionMock).toHaveBeenCalledTimes(2);
        expect(buildPlanBindingInspectionMock).toHaveBeenNthCalledWith(
          1,
          serviceInspectionsFixture,
          firstBindingNodeFixture,
          optionsFixture,
        );
        expect(buildPlanBindingInspectionMock).toHaveBeenNthCalledWith(
          2,
          serviceInspectionsFixture,
          secondBindingNodeFixture,
          optionsFixture,
        );
      });

      it('should register the PlanServiceInspection', () => {
        expect(serviceInspectionsFixture.get(serviceNodeFixture)).toBe(result);
      });

      it('should return a MultipleBindingPlanServiceInspection', () => {
        const expected: PlanServiceInspection = {
          bindings: [
            firstBindingInspectionFixture,
            secondBindingInspectionFixture,
          ],
          chained: true,
          isMultiple: true,
          name: undefined,
          optional: false,
          serviceIdentifier: serviceNodeFixture.serviceIdentifier,
          tags: new Map(),
        };

        expect(result).toStrictEqual(expected);
      });
    });
  });

  describe('having single BuildServiceNodeOptions and a PlanServiceNode reachable from its own binding', () => {
    let bindingNodeFixture: PlanBindingNode;
    let serviceNodeFixture: PlanServiceNode;
    let optionsFixture: BuildServiceNodeOptions;

    beforeAll(() => {
      bindingNodeFixture = Symbol() as unknown as PlanBindingNode;
      serviceNodeFixture = {
        bindings: bindingNodeFixture,
        serviceIdentifier: Symbol(),
      } as Partial<PlanServiceNode> as PlanServiceNode;
      optionsFixture = {
        isMultiple: false,
        name: undefined,
        optional: false,
        serviceIdentifier: serviceNodeFixture.serviceIdentifier,
        tags: new Map(),
      };
    });

    describe('when called', () => {
      let reentrantResult: PlanServiceInspection | undefined;

      let result: unknown;

      beforeAll(() => {
        buildPlanBindingInspectionMock.mockImplementationOnce(
          (
            serviceInspections: Map<PlanServiceNode, PlanServiceInspection>,
          ): PlanBindingInspection => {
            reentrantResult = buildPlanServiceInspection(
              serviceInspections,
              serviceNodeFixture,
              optionsFixture,
            );

            return Symbol() as unknown as PlanBindingInspection;
          },
        );

        result = buildPlanServiceInspection(
          new Map(),
          serviceNodeFixture,
          optionsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call buildPlanBindingInspection() once', () => {
        expect(buildPlanBindingInspectionMock).toHaveBeenCalledTimes(1);
      });

      it('should resolve the cycle to the PlanServiceInspection being built', () => {
        expect(reentrantResult).toBe(result);
      });
    });
  });
});
