import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';

import { openApiValidationMetadataReflectKey } from '../models/openApiValidationMetadataReflectKey.js';

function getParameterNamesFromMethod(fn: Function): string[] {
  const src: string = fn.toString();
  const match: RegExpMatchArray | null = src.match(/\(([^)]*)\)/);
  if (match === null) return [];
  return match[1]!
    .split(',')
    .map((p: string) => p.trim().replace(/[:=].*/s, '').trim())
    .filter(Boolean);
}

export function setValidateMetadataByName(
  paramNames: string[],
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  controllerConstructor: Function,
  methodName: string | symbol,
): void {
  const method: Function = (
    controllerConstructor.prototype as Record<string | symbol, Function>
  )[methodName]!;
  const allParamNames: string[] = getParameterNamesFromMethod(method);

  for (const name of paramNames) {
    const index: number = allParamNames.indexOf(name);
    if (index !== -1) {
      updateOwnReflectMetadata(
        controllerConstructor,
        openApiValidationMetadataReflectKey,
        buildEmptyArrayMetadata<boolean>,
        (metadata: boolean[]): boolean[] => {
          metadata[index] = true;
          return metadata;
        },
        methodName,
      );
    }
  }
}
