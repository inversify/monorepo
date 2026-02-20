import { type BaseDecoratorInfo } from './BaseDecoratorInfo.js';
import { type DecoratorInfoKind } from './DecoratorInfoKind.js';

export interface PropertyDecoratorInfo extends BaseDecoratorInfo<DecoratorInfoKind.property> {
  property: string | symbol;
}
