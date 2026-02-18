import { type BaseDecoratorInfo } from './BaseDecoratorInfo.js';
import { type DecoratorInfoKind } from './DecoratorInfoKind.js';

export interface ParameterDecoratorInfo extends BaseDecoratorInfo<DecoratorInfoKind.parameter> {
  index: number;
}
