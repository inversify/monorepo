import { BaseDecoratorInfo } from './BaseDecoratorInfo';
import { DecoratorInfoKind } from './DecoratorInfoKind';

export interface MethodDecoratorInfo extends BaseDecoratorInfo<DecoratorInfoKind.method> {
  method: string | symbol;
}
