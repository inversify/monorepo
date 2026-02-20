import { type BaseDecoratorInfo } from './BaseDecoratorInfo.js';
import { type DecoratorInfoKind } from './DecoratorInfoKind.js';

export interface MethodDecoratorInfo extends BaseDecoratorInfo<DecoratorInfoKind.method> {
  method: string | symbol;
}
