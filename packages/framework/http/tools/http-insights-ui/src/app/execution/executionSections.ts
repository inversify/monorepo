import { type ExecutionDetail } from './executionApi.js';

export type ExecutionSectionId =
  | 'controller'
  | 'guards'
  | 'interceptors'
  | 'middlewares'
  | 'request'
  | 'response'
  | 'timeline';

export function isExecutionSectionEnabled(
  section: ExecutionSectionId,
  execution: ExecutionDetail,
): boolean {
  switch (section) {
    case 'controller':
      return execution.controller !== undefined;
    case 'guards':
      return execution.guards.length > 0;
    case 'interceptors':
      return execution.interceptors.length > 0;
    case 'middlewares':
      return (
        execution.middlewares.length > 0 ||
        execution.nativeMiddlewares.length > 0
      );
    case 'request':
    case 'response':
    case 'timeline':
      return true;
  }
}
