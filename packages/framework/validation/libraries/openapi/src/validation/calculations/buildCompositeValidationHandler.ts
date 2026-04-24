import type Ajv from 'ajv';

import { type OpenApiValidationContext } from '../models/OpenApiValidationContext.js';
import { type ValidationInputParam } from '../models/ValidatedDecoratorResult.js';
import {
  type validatedInputParamBodyType,
  type validatedInputParamHeaderType,
  type validatedInputParamParamType,
  type validatedInputParamQueryType,
} from '../models/validatedInputParamTypes.js';
import { type ValidationHandler } from '../models/ValidationHandler.js';

type ValidatedInputParamType =
  | typeof validatedInputParamBodyType
  | typeof validatedInputParamHeaderType
  | typeof validatedInputParamParamType
  | typeof validatedInputParamQueryType;

export function buildCompositeValidationHandler<
  TOpenApiObject,
  TValidationCacheEntry,
>(handlers: {
  [TKey in ValidatedInputParamType]?: [
    ValidationHandler<
      TOpenApiObject,
      ValidationInputParam & { type: TKey },
      TValidationCacheEntry
    >,
    boolean,
  ];
}) {
  return (
    openApiObject: TOpenApiObject,
    validationContext: OpenApiValidationContext,
    inputParam: unknown,
    getAjv: (coerceTypes: boolean) => Ajv,
    getEntry: (path: string, method: string) => TValidationCacheEntry,
  ): unknown => {
    if (inputParam === null || typeof inputParam !== 'object') {
      return inputParam;
    }

    const discriminatorValue: unknown = (
      inputParam as Partial<ValidationInputParam>
    ).type;

    const handlerAndCoerceTypes:
      | [
          ValidationHandler<
            TOpenApiObject,
            ValidationInputParam,
            TValidationCacheEntry
          >,
          boolean,
        ]
      | undefined = handlers[discriminatorValue as ValidatedInputParamType] as
      | [
          ValidationHandler<
            TOpenApiObject,
            ValidationInputParam,
            TValidationCacheEntry
          >,
          boolean,
        ]
      | undefined;

    if (handlerAndCoerceTypes === undefined) {
      return inputParam;
    }

    const [handler, coerceTypes]: [
      ValidationHandler<
        TOpenApiObject,
        ValidationInputParam,
        TValidationCacheEntry
      >,
      boolean,
    ] = handlerAndCoerceTypes;

    return handler(
      getAjv(coerceTypes),
      openApiObject,
      validationContext,
      inputParam as ValidationInputParam,
      getEntry,
    );
  };
}
