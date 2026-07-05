import { beforeAll, describe, expect, it } from 'vitest';

import { type ConstructorNoParamNode } from '../models/ConstructorNoParamNode.js';
import { buildConstructorNoParamNode } from './buildConstructorNoParamNode.js';

describe(buildConstructorNoParamNode, () => {
  describe('when called', () => {
    let result: ConstructorNoParamNode;

    beforeAll(() => {
      result = buildConstructorNoParamNode();
    });

    it('should return a ConstructorNoParamNode', () => {
      expect(result).toStrictEqual<ConstructorNoParamNode>({
        isNoParam: true,
        resolve: expect.any(Function),
      });
    });
  });
});
