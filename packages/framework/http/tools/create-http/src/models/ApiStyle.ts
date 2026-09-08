export enum ApiStyle {
  codeFirst = 'code-first',
  schemaFirst = 'schema-first',
}

export const API_STYLES: readonly ApiStyle[] = [
  ApiStyle.codeFirst,
  ApiStyle.schemaFirst,
];

export const DEFAULT_API_STYLE: ApiStyle = ApiStyle.codeFirst;
