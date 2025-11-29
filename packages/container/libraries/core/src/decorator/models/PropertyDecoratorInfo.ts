import { BaseDecoratorInfo } from './BaseDecoratorInfo';
import { DecoratorInfoKind } from './DecoratorInfoKind';

export interface PropertyDecoratorInfo extends BaseDecoratorInfo<DecoratorInfoKind.property> {
  property: string | symbol;
}
