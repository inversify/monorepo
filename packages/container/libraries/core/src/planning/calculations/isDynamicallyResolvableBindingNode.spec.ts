import { beforeAll, describe, expect, it } from 'vitest';

import {
  type DynamicallyResolvableBindingNode,
  isDynamicallyResolvableBindingNodeSymbol,
} from '../models/DynamicallyResolvableBindingNode.js';
import { type ResolvableBindingNode } from '../models/ResolvableBindingNode.js';
import { isDynamicallyResolvableBindingNode } from './isDynamicallyResolvableBindingNode.js';

describe(isDynamicallyResolvableBindingNode, () => {
  describe.each<
    [string, ResolvableBindingNode | DynamicallyResolvableBindingNode, boolean]
  >([
    [
      'a ResolvableBindingNode',
      {
        binding: Symbol() as unknown as ResolvableBindingNode['binding'],
        resolve: () => undefined,
      },
      false,
    ],
    [
      'a DynamicallyResolvableBindingNode',
      {
        addOnResolverChangedHandler: () => undefined,
        binding:
          Symbol() as unknown as DynamicallyResolvableBindingNode['binding'],
        [isDynamicallyResolvableBindingNodeSymbol]: true,
        resolve: () => undefined,
      },
      true,
    ],
  ])(
    'having %s',
    (
      _: string,
      node: ResolvableBindingNode | DynamicallyResolvableBindingNode,
      expected: boolean,
    ) => {
      describe('when called', () => {
        let result: boolean;

        beforeAll(() => {
          result = isDynamicallyResolvableBindingNode(node);
        });

        it('should return the expected result', () => {
          expect(result).toBe(expected);
        });
      });
    },
  );
});
