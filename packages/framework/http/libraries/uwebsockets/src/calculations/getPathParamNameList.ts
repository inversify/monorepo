const PARAM_SEGMENT_PREFIX: string = ':';

export function getPathParamNameList(path: string): string[] {
  const paramNameList: string[] = [];

  for (const segment of path.split('/')) {
    if (
      segment.startsWith(PARAM_SEGMENT_PREFIX) &&
      segment.length > PARAM_SEGMENT_PREFIX.length
    ) {
      paramNameList.push(segment.slice(PARAM_SEGMENT_PREFIX.length));
    }
  }

  return paramNameList;
}
