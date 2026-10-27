import { type CallSectionId } from './callSections.js';

const CALL_SECTION_PARAM: string = 'section';

const CALL_SECTION_IDS: readonly CallSectionId[] = [
  'controller',
  'guards',
  'interceptors',
  'middlewares',
  'request',
  'response',
  'timeline',
];

export function readCallSection(params: URLSearchParams): CallSectionId {
  const value: string | null = params.get(CALL_SECTION_PARAM);

  if (value !== null && isCallSectionId(value)) {
    return value;
  }

  return 'timeline';
}

function isCallSectionId(value: string): value is CallSectionId {
  return (CALL_SECTION_IDS as readonly string[]).includes(value);
}
