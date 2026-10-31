import { type MethodDecoratorInfo } from './MethodDecoratorInfo.js';
import { type ParameterDecoratorInfo } from './ParameterDecoratorInfo.js';
import { type PropertyDecoratorInfo } from './PropertyDecoratorInfo.js';

export type DecoratorInfo =
  | MethodDecoratorInfo
  | ParameterDecoratorInfo
  | PropertyDecoratorInfo;
