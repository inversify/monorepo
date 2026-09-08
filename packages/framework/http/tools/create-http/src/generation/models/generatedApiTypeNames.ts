/**
 * Named OpenAPI component schemas plus the `Root` union emitted by
 * `@inversifyjs/open-api-2-typescript`. Scaffold stubs so controllers can
 * import generated types before `generate:api` overwrites them.
 */
export const GENERATED_API_TYPE_NAMES: readonly string[] = [
  'StatusV1',
  'TodoV1',
  'CreateTodoV1RequestBody',
  'PaginatedTodosV1Response',
  'UpdateTodoV1RequestBody',
  'Root',
];

export const GENERATED_API_TYPES_RELATIVE_PATH: string =
  'src/generated/api/index.ts';

export const GENERATE_API_TYPES_SCRIPT_RELATIVE_PATH: string =
  'src/app/scripts/generateApiTypes.ts';
