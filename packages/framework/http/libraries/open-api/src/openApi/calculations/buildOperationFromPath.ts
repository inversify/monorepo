const PATH_PARAM_REGEXP: RegExp = /:([A-Za-z0-9_]+)/g;

export function tryBuildOperationFromPath(path: string): string | undefined {
  if (path.includes('*')) {
    return undefined;
  }

  return path.replaceAll(PATH_PARAM_REGEXP, '{$1}');
}
