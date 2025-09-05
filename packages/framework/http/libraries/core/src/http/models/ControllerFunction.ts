import { ControllerResponse } from './ControllerResponse';

export type ControllerFunction = (
  ...args: unknown[]
) => Promise<ControllerResponse> | ControllerResponse;
