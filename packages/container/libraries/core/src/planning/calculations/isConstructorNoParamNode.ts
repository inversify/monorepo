import { type ConstructorNoParamNode } from '../models/ConstructorNoParamNode.js';

export function isConstructorNoParamNode(
  value: object,
): value is ConstructorNoParamNode {
  return (value as Partial<ConstructorNoParamNode>).isNoParam === true;
}
