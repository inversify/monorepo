import { type ControllerFunction } from './ControllerFunction.js';

export interface Controller {
  [key: string | symbol]: ControllerFunction;
}
