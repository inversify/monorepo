import { type CallDetail } from './callApi.js';

export type CallSectionId =
  | 'controller'
  | 'guards'
  | 'interceptors'
  | 'middlewares'
  | 'request'
  | 'response'
  | 'timeline';

export function isCallSectionEnabled(
  section: CallSectionId,
  call: CallDetail,
): boolean {
  switch (section) {
    case 'controller':
      return call.controller !== undefined;
    case 'guards':
      return call.guards.length > 0;
    case 'interceptors':
      return call.interceptors.length > 0;
    case 'middlewares':
      return call.middlewares.length > 0 || call.nativeMiddlewares.length > 0;
    case 'request':
    case 'response':
    case 'timeline':
      return true;
  }
}
