import { type ConstructorNoParamNode } from '../models/ConstructorNoParamNode.js';

const CONSTRUCTOR_NO_PARAM_NODE: ConstructorNoParamNode = {
  isNoParam: true,
  resolve: () => undefined,
};

export function buildConstructorNoParamNode(): ConstructorNoParamNode {
  return CONSTRUCTOR_NO_PARAM_NODE;
}
