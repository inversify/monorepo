import { afterAll, beforeAll, describe, expect, it, vitest } from 'vitest';

vitest.mock('./checkPlanServiceRedirectionBindingNodeSingleInjectionBindings');
vitest.mock('./isPlanServiceRedirectionBindingNode');
vitest.mock('./throwErrorWhenUnexpectedBindingsAmountFound');

import { BindingConstraints } from '../../binding/models/BindingConstraints';
import { MetadataTag } from '../../metadata/models/MetadataTag';
import { PlanBindingNode } from '../models/PlanBindingNode';
import { PlanServiceNode } from '../models/PlanServiceNode';
import { PlanServiceNodeParent } from '../models/PlanServiceNodeParent';
import { checkPlanServiceRedirectionBindingNodeSingleInjectionBindings } from './checkPlanServiceRedirectionBindingNodeSingleInjectionBindings';
import { checkServiceNodeSingleInjectionBindings } from './checkServiceNodeSingleInjectionBindings';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode';
import { throwErrorWhenUnexpectedBindingsAmountFound } from './throwErrorWhenUnexpectedBindingsAmountFound';

describe(checkServiceNodeSingleInjectionBindings.name, () => {
  describe('having a PlanServiceNode with no bindings', () => {
    let nodeFixture: PlanServiceNode;
    let isOptionalFixture: boolean;
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      nodeFixture = {
        bindings: [],
        parent: Symbol() as unknown as PlanServiceNodeParent,
        serviceIdentifier: 'service-id',
      };
      isOptionalFixture = false;
      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'binding-name',
        serviceIdentifier: 'service-identifier',
        tags: new Map<MetadataTag, unknown>([
          ['tag1', 'value1'],
          ['tag2', 'value2'],
        ]),
      };
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = checkServiceNodeSingleInjectionBindings(
          nodeFixture,
          isOptionalFixture,
          bindingConstraintsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).toHaveBeenCalledTimes(1);
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).toHaveBeenCalledWith(
          nodeFixture.bindings,
          isOptionalFixture,
          nodeFixture,
          bindingConstraintsFixture,
        );
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });

  describe('having a PlanServiceNode with single binding', () => {
    let nodeFixtureBinding: PlanBindingNode;
    let nodeFixture: PlanServiceNode;
    let isOptionalFixture: boolean;
    let bindingConstraintsFixture: BindingConstraints;

    beforeAll(() => {
      nodeFixtureBinding = Symbol() as unknown as PlanBindingNode;
      nodeFixture = {
        bindings: [nodeFixtureBinding],
        parent: Symbol() as unknown as PlanServiceNodeParent,
        serviceIdentifier: 'service-id',
      };
      isOptionalFixture = false;
      bindingConstraintsFixture = {
        getAncestor: () => undefined,
        name: 'binding-name',
        serviceIdentifier: 'service-identifier',
        tags: new Map<MetadataTag, unknown>([
          ['tag1', 'value1'],
          ['tag2', 'value2'],
        ]),
      };
    });

    describe('when called, and isPlanServiceRedirectionBindingNode() returns false', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(isPlanServiceRedirectionBindingNode)
          .mockReturnValueOnce(false);

        result = checkServiceNodeSingleInjectionBindings(
          nodeFixture,
          isOptionalFixture,
          bindingConstraintsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should not call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).not.toHaveBeenCalled();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });

    describe('when called, and isPlanServiceRedirectionBindingNode() returns true', () => {
      let result: unknown;

      beforeAll(() => {
        vitest
          .mocked(isPlanServiceRedirectionBindingNode)
          .mockReturnValueOnce(true);

        result = checkServiceNodeSingleInjectionBindings(
          nodeFixture,
          isOptionalFixture,
          bindingConstraintsFixture,
        );
      });

      afterAll(() => {
        vitest.clearAllMocks();
      });

      it('should call checkPlanServiceRedirectionBindingNodeSingleInjectionBindings()', () => {
        expect(
          checkPlanServiceRedirectionBindingNodeSingleInjectionBindings,
        ).toHaveBeenCalledTimes(1);
        expect(
          checkPlanServiceRedirectionBindingNodeSingleInjectionBindings,
        ).toHaveBeenCalledWith(
          nodeFixtureBinding,
          isOptionalFixture,
          bindingConstraintsFixture,
        );
      });

      it('should not call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
        expect(
          throwErrorWhenUnexpectedBindingsAmountFound,
        ).not.toHaveBeenCalled();
      });

      it('should return undefined', () => {
        expect(result).toBeUndefined();
      });
    });
  });
});
