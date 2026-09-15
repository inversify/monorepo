const PARAMETER_LOCATION_TYPE_NAME_SUFFIX: Record<string, string> = {
  cookie: 'Cookies',
  header: 'Headers',
  path: 'PathParams',
  query: 'Query',
  querystring: 'Querystring',
};

export const PARAMETER_LOCATION_ORDER: readonly string[] = [
  'path',
  'query',
  'querystring',
  'header',
  'cookie',
];

export function getParameterLocationTypeNameSuffix(
  location: string,
): string | undefined {
  return PARAMETER_LOCATION_TYPE_NAME_SUFFIX[location];
}
