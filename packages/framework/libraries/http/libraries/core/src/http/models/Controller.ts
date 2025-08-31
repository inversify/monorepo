import { ControllerFunction } from './ControllerFunction';

export interface Controller {
  [key: string | symbol]: ControllerFunction;
}
