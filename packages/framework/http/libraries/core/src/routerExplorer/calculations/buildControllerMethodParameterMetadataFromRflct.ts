import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';

import { type NonCustomRequestMethodParameterType } from '../../http/models/RequestMethodParameterType.js';
import { type ControllerMethodParameterMetadata } from '../model/ControllerMethodParameterMetadata.js';

const DESIGN_PARAMTYPES: string = 'design:paramtypes';

const VALID_PARAMETER_TYPES: Set<string> = new Set<string>([
  'body',
  'cookies',
  'headers',
  'next',
  'params',
  'query',
  'request',
  'response',
]);

interface RflctParamEntry {
  type: unknown;
  metadata: Record<string, unknown>;
}

export function buildControllerMethodParameterMetadataFromRflct(
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  controllerConstructor: Function,
  methodKey: string | symbol,
): (ControllerMethodParameterMetadata | undefined)[] | undefined {
  const prototype: object | undefined = controllerConstructor.prototype as
    | object
    | undefined;

  if (prototype === undefined) {
    return undefined;
  }

  const paramTypes: RflctParamEntry[] | undefined = getOwnReflectMetadata(
    prototype,
    DESIGN_PARAMTYPES,
    methodKey,
  );

  if (paramTypes === undefined || paramTypes.length === 0) {
    return undefined;
  }

  const result: (ControllerMethodParameterMetadata | undefined)[] = [];
  let hasAny: boolean = false;

  for (const entry of paramTypes) {
    if (entry === undefined) {
      result.push(undefined);
      continue;
    }

    const parameterType: unknown = entry.metadata['parameterType'];

    if (
      typeof parameterType !== 'string' ||
      !VALID_PARAMETER_TYPES.has(parameterType)
    ) {
      result.push(undefined);
      continue;
    }

    const name: unknown = entry.metadata['name'];

    result.push({
      parameterName:
        typeof name === 'string' ? name : undefined,
      parameterType:
        parameterType as NonCustomRequestMethodParameterType,
      pipeList: [],
    });
    hasAny = true;
  }

  return hasAny ? result : undefined;
}
