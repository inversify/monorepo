import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

jest.mock('./isPlanServiceRedirectionBindingNode');
jest.mock('./throwErrorWhenUnexpectedBindingsAmountFound');

import { bindingScopeValues } from '../../binding/models/BindingScope';
import { bindingTypeValues } from '../../binding/models/BindingType';
import { ServiceRedirectionBinding } from '../../binding/models/ServiceRedirectionBinding';
import { BindingNodeParent } from '../models/BindingNodeParent';
import { PlanServiceRedirectionBindingNode } from '../models/PlanServiceRedirectionBindingNode';
import { checkPlanServiceRedirectionBindingNodeSingleInjectionBindings } from './checkPlanServiceRedirectionBindingNodeSingleInjectionBindings';
import { isPlanServiceRedirectionBindingNode } from './isPlanServiceRedirectionBindingNode';
import { throwErrorWhenUnexpectedBindingsAmountFound } from './throwErrorWhenUnexpectedBindingsAmountFound';

describe(
  checkPlanServiceRedirectionBindingNodeSingleInjectionBindings.name,
  () => {
    describe('having a PlanServiceRedirectionBindingNode with no redirections', () => {
      let planServiceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;
      let isOptionalFixture: boolean;

      beforeAll(() => {
        planServiceRedirectionBindingNodeFixture = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          binding: Symbol() as unknown as ServiceRedirectionBinding<any>,
          parent: Symbol() as unknown as BindingNodeParent,
          redirections: [],
        };
        isOptionalFixture = false;
      });

      describe('when called', () => {
        let result: unknown;

        beforeAll(() => {
          result =
            checkPlanServiceRedirectionBindingNodeSingleInjectionBindings(
              planServiceRedirectionBindingNodeFixture,
              isOptionalFixture,
            );
        });

        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
          expect(
            throwErrorWhenUnexpectedBindingsAmountFound,
          ).toHaveBeenCalledTimes(1);
          expect(
            throwErrorWhenUnexpectedBindingsAmountFound,
          ).toHaveBeenCalledWith(
            planServiceRedirectionBindingNodeFixture.redirections,
            isOptionalFixture,
            planServiceRedirectionBindingNodeFixture,
          );
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });

    describe('having a PlanServiceRedirectionBindingNode with a single redirection to a leaf node', () => {
      let planServiceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;
      let isOptionalFixture: boolean;

      beforeAll(() => {
        planServiceRedirectionBindingNodeFixture = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          binding: Symbol() as unknown as ServiceRedirectionBinding<any>,
          parent: Symbol() as unknown as BindingNodeParent,
          redirections: [
            {
              binding: {
                cache: {
                  isRight: true,
                  value: Symbol(),
                },
                id: 1,
                isSatisfiedBy: () => true,
                moduleId: undefined,
                onActivation: undefined,
                onDeactivation: undefined,
                scope: bindingScopeValues.Singleton,
                serviceIdentifier: 'service-id',
                type: bindingTypeValues.ConstantValue,
                value: Symbol(),
              },
              parent: Symbol() as unknown as BindingNodeParent,
            },
          ],
        };
        isOptionalFixture = false;
      });

      describe('when called, and isPlanServiceRedirectionBindingNode() returns false', () => {
        let result: unknown;

        beforeAll(() => {
          (
            isPlanServiceRedirectionBindingNode as unknown as jest.Mock<
              typeof isPlanServiceRedirectionBindingNode
            >
          ).mockReturnValueOnce(false);

          result =
            checkPlanServiceRedirectionBindingNodeSingleInjectionBindings(
              planServiceRedirectionBindingNodeFixture,
              isOptionalFixture,
            );
        });

        afterAll(() => {
          jest.clearAllMocks();
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

    describe('having a PlanServiceRedirectionBindingNode with a single redirection to a PlanServiceRedirectionBindingNode with no redirections', () => {
      let planServiceRedirectionBindingNodeRedirectionFixture: PlanServiceRedirectionBindingNode;
      let planServiceRedirectionBindingNodeFixture: PlanServiceRedirectionBindingNode;
      let isOptionalFixture: boolean;

      beforeAll(() => {
        planServiceRedirectionBindingNodeRedirectionFixture = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          binding: Symbol() as unknown as ServiceRedirectionBinding<any>,
          parent: Symbol() as unknown as BindingNodeParent,
          redirections: [],
        };
        planServiceRedirectionBindingNodeFixture = {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          binding: Symbol() as unknown as ServiceRedirectionBinding<any>,
          parent: Symbol() as unknown as BindingNodeParent,
          redirections: [planServiceRedirectionBindingNodeRedirectionFixture],
        };
        isOptionalFixture = false;
      });

      describe('when called, and isPlanServiceRedirectionBindingNode() returns true', () => {
        let result: unknown;

        beforeAll(() => {
          (
            isPlanServiceRedirectionBindingNode as unknown as jest.Mock<
              typeof isPlanServiceRedirectionBindingNode
            >
          ).mockReturnValueOnce(true);

          result =
            checkPlanServiceRedirectionBindingNodeSingleInjectionBindings(
              planServiceRedirectionBindingNodeFixture,
              isOptionalFixture,
            );
        });

        afterAll(() => {
          jest.clearAllMocks();
        });

        it('should call throwErrorWhenUnexpectedBindingsAmountFound()', () => {
          expect(
            throwErrorWhenUnexpectedBindingsAmountFound,
          ).toHaveBeenCalledTimes(1);
          expect(
            throwErrorWhenUnexpectedBindingsAmountFound,
          ).toHaveBeenCalledWith(
            planServiceRedirectionBindingNodeRedirectionFixture.redirections,
            isOptionalFixture,
            planServiceRedirectionBindingNodeRedirectionFixture,
          );
        });

        it('should return undefined', () => {
          expect(result).toBeUndefined();
        });
      });
    });
  },
);
