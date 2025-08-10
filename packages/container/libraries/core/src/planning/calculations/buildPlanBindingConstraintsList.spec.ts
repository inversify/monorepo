import { beforeAll, describe, expect, it } from 'vitest';

import { InternalBindingConstraints } from '../../binding/models/BindingConstraintsImplementation';
import { SingleImmutableLinkedList } from '../../common/models/SingleImmutableLinkedList';
import { PlanParams } from '../models/PlanParams';
import { PlanParamsTagConstraint } from '../models/PlanParamsTagConstraint';
import { buildPlanBindingConstraintsList } from './buildPlanBindingConstraintsList';

describe(buildPlanBindingConstraintsList, () => {
  describe('having PlanParams with rootConstraints with no tags', () => {
    let planParamsFixture: PlanParams;

    beforeAll(() => {
      planParamsFixture = {
        autobindOptions: undefined,
        rootConstraints: {
          isMultiple: false,
          name: 'name',
          serviceIdentifier: Symbol(),
        },
      } as Partial<PlanParams> as PlanParams;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildPlanBindingConstraintsList(planParamsFixture);
      });

      it('should return expected value', () => {
        const expected: Partial<
          SingleImmutableLinkedList<InternalBindingConstraints>
        > = {
          last: {
            elem: {
              getAncestorsCalled: false,
              name: planParamsFixture.rootConstraints.name,
              serviceIdentifier:
                planParamsFixture.rootConstraints.serviceIdentifier,
              tags: new Map(),
            },
            previous: undefined,
          },
        };

        expect(result).toStrictEqual(expect.objectContaining(expected));
      });
    });
  });

  describe('having PlanParams with rootConstraints with tags', () => {
    let planParamsFixture: PlanParams;

    beforeAll(() => {
      planParamsFixture = {
        autobindOptions: undefined,
        rootConstraints: {
          isMultiple: false,
          name: 'name',
          serviceIdentifier: Symbol(),
          tag: {
            key: 'key',
            value: 'value',
          },
        },
      } as Partial<PlanParams> as PlanParams;
    });

    describe('when called', () => {
      let result: unknown;

      beforeAll(() => {
        result = buildPlanBindingConstraintsList(planParamsFixture);
      });

      it('should return expected value', () => {
        const expected: Partial<
          SingleImmutableLinkedList<InternalBindingConstraints>
        > = {
          last: {
            elem: {
              getAncestorsCalled: false,
              name: planParamsFixture.rootConstraints.name,
              serviceIdentifier:
                planParamsFixture.rootConstraints.serviceIdentifier,
              tags: new Map([
                [
                  (
                    planParamsFixture.rootConstraints
                      .tag as PlanParamsTagConstraint
                  ).key,
                  (
                    planParamsFixture.rootConstraints
                      .tag as PlanParamsTagConstraint
                  ).value,
                ],
              ]),
            },
            previous: undefined,
          },
        };

        expect(result).toStrictEqual(expect.objectContaining(expected));
      });
    });
  });
});
