import { type ControllerResponse } from './ControllerResponse.js';

export type ControllerFunction = (
  ...args: unknown[]
) => Promise<ControllerResponse> | ControllerResponse;
