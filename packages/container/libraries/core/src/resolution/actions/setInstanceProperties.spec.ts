import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  type Mocked,
  vitest,
} from 'vitest';

import { InversifyCoreError } from '../../error/models/InversifyCoreError.js';
import { InversifyCoreErrorKind } from '../../error/models/InversifyCoreErrorKind.js';
import { ClassElementMetadataKind } from '../../metadata/models/ClassElementMetadataKind.js';
import { type InstanceBindingNode } from '../../planning/models/InstanceBindingNode.js';
import { type PlanBindingNode } from '../../planning/models/PlanBindingNode.js';
import { type PlanServiceNode } from '../../planning/models/PlanServiceNode.js';
import { type ResolutionParams } from '../models/ResolutionParams.js';
import { setInstanceProperties } from './setInstanceProperties.js';

describe(setInstanceProperties, () => {
  describe('having node with properties and no metadata', () => {
    let propertyKeyFixture: string | symbol;

    let paramsFixture: ResolutionParams;
    let instanceFixture: Record<string | symbol, unknown>;
    let nodeFixture: InstanceBindingNode;

    beforeAll(() => {
      propertyKeyFixture = Symbol();

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
          await setInstanceProperties(
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

    let paramsFixture: ResolutionParams;
    let instanceFixture: Record<string | symbol, unknown>;
    let nodeFixture: InstanceBindingNode;

    beforeAll(() => {
      propertyKeyFixture = Symbol();

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
        result = setInstanceProperties(
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
    let propertyServiceNodeMock: Mocked<PlanServiceNode>;

    let paramsFixture: ResolutionParams;

    let nodeFixture: InstanceBindingNode;

    beforeAll(() => {
      propertyKeyFixture = Symbol();

      paramsFixture = Symbol() as unknown as ResolutionParams;

      propertyServiceNodeMock = {
        bindings: Symbol() as unknown as PlanBindingNode,
        resolve: vitest.fn(),
      } as Partial<Mocked<PlanServiceNode>> as Mocked<PlanServiceNode>;

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
        propertyParams: new Map<string | symbol, PlanServiceNode>([
          [propertyKeyFixture, propertyServiceNodeMock],
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

        propertyServiceNodeMock.resolve.mockReturnValueOnce(
          resolvedPropertyValue,
        );

        result = setInstanceProperties(
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

        propertyServiceNodeMock.resolve.mockResolvedValueOnce(
          resolvedPropertyValue,
        );

        result = setInstanceProperties(
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
