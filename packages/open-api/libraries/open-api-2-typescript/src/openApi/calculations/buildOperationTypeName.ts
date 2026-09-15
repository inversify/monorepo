import { toPascalCase } from './toPascalCase.js';

const FALLBACK_OPERATION_TYPE_NAME: string = 'Operation';

export function buildOperationTypeName(
  operationId: string | undefined,
  method: string,
  path: string,
): string {
  if (operationId !== undefined) {
    const operationIdTypeName: string = toPascalCase(operationId);

    if (operationIdTypeName.length > 0) {
      return operationIdTypeName;
    }
  }

  const methodAndPathTypeName: string = toPascalCase(`${method} ${path}`);

  if (methodAndPathTypeName.length > 0) {
    return methodAndPathTypeName;
  }

  return FALLBACK_OPERATION_TYPE_NAME;
}
