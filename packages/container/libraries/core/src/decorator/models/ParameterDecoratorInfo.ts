import { BaseDecoratorInfo } from './BaseDecoratorInfo';
import { DecoratorInfoKind } from './DecoratorInfoKind';

export interface ParameterDecoratorInfo extends BaseDecoratorInfo<DecoratorInfoKind.parameter> {
  index: number;
}
