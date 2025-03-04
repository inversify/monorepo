import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind';
import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind';
import { InstanceBindingNode } from '../../planning/models/InstanceBindingNode';
import { PlanBindingNode } from '../../planning/models/PlanBindingNode';
import { PlanServiceNode } from '../../planning/models/PlanServiceNode';
import { ResolutionParams } from '../models/ResolutionParams';
import { setInstanceProperties } from './setInstanceProperties';

describe(setInstanceProperties.name, () => {
  describe('having node with properties and no metadata', () => {
    let propertyKeyFixture: string | symbol;

    let resolveServiceNodeMock: Mock<
      (params: ResolutionParams, serviceNode: PlanServiceNode) => unknown
    >;

    let paramsFixture: ResolutionParams;
    let instanceFixture: Record<string | symbol, unknown>;
    let nodeFixture: InstanceBindingNode;

    beforeAll(() => {
      propertyKeyFixture = Symbol();
      resolveServiceNodeMock = vitest.fn();

      paramsFixture = Symbol() as unknown as ResolutionParams;
      instanceFixture = {};
      nodeFixture = {
        classMetadata: {
          properties: new Map(),
        },
        propertyParams: new Map([
          [propertyKeyFixture, Symbol() as unknown as PlanServiceNode],
        ]),
      } as Partial<InstanceBindingNode> as InstanceBindingNode;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(async () => {
        try {
          await setInstanceProperties(resolveServiceNodeMock)(
            paramsFixture,
            instanceFixture,
            nodeFixture,
          );
        } catch (error: unknown) {
          result = error;
        }
      });

      it('should throw an InversifyCoreError', () => {
        const expectedErrorProperties: Partial<InversifyCoreError> = {
          kind: InversifyCoreErrorKind.resolution,
          message: `Expecting metadata at property "${propertyKeyFixture.toString()}", none found`,
        };

        expect(result).toBeInstanceOf(InversifyCoreError);
        expect(result).toStrictEqual(
          expect.objectContaining(expectedErrorProperties),
        );
      });
    });
  });

  describe('having node with properties and matching unmanaged metadata', () => {
    let propertyKeyFixture: string | symbol;

    let resolveServiceNodeMock: Mock<
      (params: ResolutionParams, serviceNode: PlanServiceNode) => unknown
    >;

    let paramsFixture: ResolutionParams;
    let instanceFixture: Record<string | symbol, unknown>;
    let nodeFixture: InstanceBindingNode;

    beforeAll(() => {
      propertyKeyFixture = Symbol();
      resolveServiceNodeMock = vitest.fn();

      paramsFixture = Symbol() as unknown as ResolutionParams;
      instanceFixture = {};
      nodeFixture = {
        classMetadata: {
          properties: new Map([
            [propertyKeyFixture, { kind: ClassElementMetadataKind.unmanaged }],
          ]),
        },
        propertyParams: new Map([
          [propertyKeyFixture, Symbol() as unknown as PlanServiceNode],
        ]),
      } as Partial<InstanceBindingNode> as InstanceBindingNode;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = setInstanceProperties(resolveServiceNodeMock)(
          paramsFixture,
          instanceFixture,
          nodeFixture,
        );
      });

      it('should throw an InversifyCoreError', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having node with properties with bindings and matching managed metadata', () => {
    let propertyKeyFixture: string | symbol;

    let resolveServiceNodeMock: Mock<
      (params: ResolutionParams, serviceNode: PlanServiceNode) => unknown
    >;

    let paramsFixture: ResolutionParams;

    let nodeFixture: InstanceBindingNode;

    beforeAll(() => {
      propertyKeyFixture = Symbol();
      resolveServiceNodeMock = vitest.fn();

      paramsFixture = Symbol() as unknown as ResolutionParams;

      const propertyServiceNodeFixture: PlanServiceNode = {
        bindings: Symbol() as unknown as PlanBindingNode,
      } as Partial<PlanServiceNode> as PlanServiceNode;

      nodeFixture = {
        classMetadata: {
          properties: new Map([
            [
              propertyKeyFixture,
              {
                kind: ClassElementMetadataKind.multipleInjection,
                name: undefined,
                optional: false,
                tags: new Map(),
                value: 'service-id',
              },
            ],
          ]),
        },
        propertyParams: new Map([
          [propertyKeyFixture, propertyServiceNodeFixture],
        ]),
      } as Partial<InstanceBindingNode> as InstanceBindingNode;
    });

    describe('when called', () => {
      let instanceFixture: Record<string | symbol, unknown>;

      let resolvedPropertyValue: unknown;

      let result: unknown;

      beforeAll(() => {
        instanceFixture = {};

        resolvedPropertyValue = Symbol();

        resolveServiceNodeMock.mockReturnValueOnce(resolvedPropertyValue);

        result = setInstanceProperties(resolveServiceNodeMock)(
          paramsFixture,
          instanceFixture,
          nodeFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set instance property', () => {
        expect(instanceFixture[propertyKeyFixture]).toBe(resolvedPropertyValue);
      });

      it('should throw an InversifyCoreError', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and resolveServiceNode returns a Promise', () => {
      let instanceFixture: Record<string | symbol, unknown>;

      let resolvedPropertyValue: unknown;

      let result: unknown;

      beforeAll(async () => {
        instanceFixture = {};

        resolvedPropertyValue = Symbol();

        resolveServiceNodeMock.mockResolvedValueOnce(resolvedPropertyValue);

        result = setInstanceProperties(resolveServiceNodeMock)(
          paramsFixture,
          instanceFixture,
          nodeFixture,
        );

        await result;
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should set instance property', () => {
        expect(instanceFixture[propertyKeyFixture]).toBe(resolvedPropertyValue);
      });

      it('should throw an InversifyCoreError', () => {
        expect(result).toStrictEqual(Promise.resolve(undefined));
      });
    });
  });
});
