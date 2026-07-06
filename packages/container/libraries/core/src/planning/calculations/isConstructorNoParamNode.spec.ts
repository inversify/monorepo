import { beforeAll, describe, expect, it } from 'vitest';

import { type ConstructorNoParamNode } from '../models/ConstructorNoParamNode.js';
import { type PlanServiceNode } from '../models/PlanServiceNode.js';
import { buildConstructorNoParamNode } from './buildConstructorNoParamNode.js';
import { isConstructorNoParamNode } from './isConstructorNoParamNode.js';

describe(isConstructorNoParamNode, () => {
  describe.each<[string, PlanServiceNode | ConstructorNoParamNode, boolean]>([
    [
      'a PlanServiceNode',
      {
        bindings: undefined,
        isContextFree: true,
        resolve: () => undefined,
        serviceIdentifier: Symbol('test'),
      },
      false,
    ],
    ['a ConstructorNoParamNode', buildConstructorNoParamNode(), true],
  ])(
    'having %s',
    (
      _: string,
      node: PlanServiceNode | ConstructorNoParamNode,
      expected: boolean,
    ) => {
      describe('when called', () => {
        let result: boolean;

        beforeAll(() => {
          result = isConstructorNoParamNode(node);
        });

        it('should return the expected result', () => {
          expect(result).toBe(expected);
        });
      });
    },
  );
});
