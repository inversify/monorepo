import {
  buildEmptyArrayMetadata,
  updateOwnReflectMetadata,
} from '@inversifyjs/reflect-metadata-utils';
import { type AnySchema } from 'ajv';

import { updateAjvValidationMetadata } from '../calculations/updateAjvValidationMetadata.js';
import { ajvValidationMetadataReflectKey } from '../reflectMetadata/models/ajvValidationMetadataReflectKey.js';

function getParameterNamesFromMethod(fn: Function): string[] {
  const src: string = fn.toString();
  const match: RegExpMatchArray | null = src.match(/\(([^)]*)\)/);
  if (match === null) return [];
  return match[1]!
    .split(',')
    .map((p: string) => p.trim().replace(/[:=].*/s, '').trim())
    .filter(Boolean);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ValidateAjvSchema(
  paramSchemas: Record<string, AnySchema[]>,
): (value: Function, context: ClassMethodDecoratorContext) => void {
  return (_value: Function, context: ClassMethodDecoratorContext): void => {
    const methodName: string | symbol = context.name;
    context.addInitializer(function (this: unknown) {
      const ctor: Function = (this as object).constructor as Function;
      const method: Function = (ctor.prototype as Record<string | symbol, Function>)[methodName]!;
      const paramNames: string[] = getParameterNamesFromMethod(method);
      for (const [name, schemas] of Object.entries(paramSchemas)) {
        const index: number = paramNames.indexOf(name);
        if (index !== -1) {
          updateOwnReflectMetadata(
            ctor,
            ajvValidationMetadataReflectKey,
            buildEmptyArrayMetadata,
            updateAjvValidationMetadata(schemas, index),
            methodName,
          );
        }
      }
    });
  };
}
