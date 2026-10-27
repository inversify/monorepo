const CALL_STAGE_PARAM: string = 'stage';

export function readCallStage(params: URLSearchParams): string | null {
  const value: string | null = params.get(CALL_STAGE_PARAM);

  if (value === null || value.length === 0) {
    return null;
  }

  return value;
}
