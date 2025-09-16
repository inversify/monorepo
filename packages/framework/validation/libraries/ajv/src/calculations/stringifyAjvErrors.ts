import { ErrorObject } from 'ajv';

export function stringifyAjvErrors(errors: Partial<ErrorObject>[]): string {
  return errors
    .map(
      (error: Partial<ErrorObject>): string =>
        `[schema: ${error.schemaPath ?? '-'}, instance: ${error.instancePath ?? '-'}]: "${error.message ?? '-'}"`,
    )
    .join('\n');
}
