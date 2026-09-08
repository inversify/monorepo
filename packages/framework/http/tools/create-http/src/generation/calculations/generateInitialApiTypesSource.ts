import { GENERATED_API_TYPE_NAMES } from '../models/generatedApiTypeNames.js';

export function generateInitialApiTypesSource(): string {
  return `${GENERATED_API_TYPE_NAMES.map(
    (typeName: string): string => `export type ${typeName} = any;`,
  ).join('\n')}\n`;
}
