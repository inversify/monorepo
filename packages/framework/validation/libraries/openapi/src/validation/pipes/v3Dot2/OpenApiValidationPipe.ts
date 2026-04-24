import { type Pipe, type PipeMetadata } from '@inversifyjs/framework-core';
import {
  type ControllerMethodParameterMetadata,
  getControllerMethodParameterMetadataList,
} from '@inversifyjs/http-core';
import { type OpenApi3Dot2Object } from '@inversifyjs/open-api-types/v3Dot2';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { openApiValidationMetadataReflectKey } from '../../../metadata/models/openApiValidationMetadataReflectKey.js';
import { OpenApi3Dot2Router } from '../../../router/services/v3Dot2/OpenApi3Dot2Router.js';
import { buildCompositeValidationHandler } from '../../calculations/buildCompositeValidationHandler.js';
import { handleBodyValidation } from '../../calculations/v3Dot2/handleBodyValidation.js';
import { handleHeaderValidation } from '../../calculations/v3Dot2/handleHeaderValidation.js';
import { handleParamValidation } from '../../calculations/v3Dot2/handleParamValidation.js';
import { handleQueryValidation } from '../../calculations/v3Dot2/handleQueryValidation.js';
import { type OpenApiValidationContext } from '../../models/OpenApiValidationContext.js';
import { SCHEMA_ID } from '../../models/v3Dot2/schemaId.js';
import { type ValidationCacheEntry } from '../../models/v3Dot2/ValidationCacheEntry.js';
import {
  validatedInputParamBodyType,
  validatedInputParamHeaderType,
  validatedInputParamParamType,
  validatedInputParamQueryType,
} from '../../models/validatedInputParamTypes.js';
import { DefaultOpenApiResolver } from '../../services/v3Dot2/DefaultOpenApiResolver.js';
import { ValidationCache } from '../../services/v3Dot2/ValidationCache.js';

const handler: (
  openApiObject: OpenApi3Dot2Object,
  validationContext: OpenApiValidationContext,
  inputParam: unknown,
  getAjv: (coerceTypes: boolean) => Ajv,
  getEntry: (path: string, method: string) => ValidationCacheEntry,
) => unknown = buildCompositeValidationHandler<
  OpenApi3Dot2Object,
  ValidationCacheEntry
>({
  [validatedInputParamBodyType]: [handleBodyValidation, false],
  [validatedInputParamHeaderType]: [handleHeaderValidation, false],
  [validatedInputParamParamType]: [handleParamValidation, false],
  [validatedInputParamQueryType]: [handleQueryValidation, true],
});

export class OpenApiValidationPipe implements Pipe {
  readonly #openApiObject: OpenApi3Dot2Object;
  readonly #validationCache: ValidationCache;
  readonly #validationContext: OpenApiValidationContext;

  #ajv: Ajv | undefined;
  #ajvWithCoercions: Ajv | undefined;

  constructor(openApiObject: OpenApi3Dot2Object) {
    this.#openApiObject = openApiObject;
    this.#validationContext = {
      resolver: new DefaultOpenApiResolver(openApiObject),
      router: new OpenApi3Dot2Router(openApiObject),
    };
    this.#validationCache = new ValidationCache();
    this.#ajv = undefined;
    this.#ajvWithCoercions = undefined;
  }

  public async execute(
    input: unknown,
    metadata: PipeMetadata,
  ): Promise<unknown> {
    const parameterMetadataList: (
      | ControllerMethodParameterMetadata
      | undefined
    )[] = getControllerMethodParameterMetadataList(
      metadata.targetClass,
      metadata.methodName,
    );

    const parameterMetadata: ControllerMethodParameterMetadata | undefined =
      parameterMetadataList[metadata.parameterIndex];

    if (parameterMetadata === undefined) {
      return input;
    }

    const validateMarkers: boolean[] | undefined = getOwnReflectMetadata<
      boolean[]
    >(
      metadata.targetClass,
      openApiValidationMetadataReflectKey,
      metadata.methodName,
    );

    if (validateMarkers?.[metadata.parameterIndex] !== true) {
      return input;
    }

    if (input === null || typeof input !== 'object') {
      return input;
    }

    return handler(
      this.#openApiObject,
      this.#validationContext,
      input,
      (coerceTypes: boolean) =>
        coerceTypes ? this.#getOrInitAjvWithCoercions() : this.#getOrInitAjv(),
      this.#validationCache.getOrCreate.bind(this.#validationCache),
    );
  }

  #getOrInitAjv(): Ajv {
    if (this.#ajv === undefined) {
      this.#ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(this.#ajv);
      this.#ajv.addSchema(this.#openApiObject, SCHEMA_ID);
    }

    return this.#ajv;
  }

  #getOrInitAjvWithCoercions(): Ajv {
    if (this.#ajvWithCoercions === undefined) {
      this.#ajvWithCoercions = new Ajv({
        allErrors: true,
        coerceTypes: true,
        strict: false,
      });
      addFormats(this.#ajvWithCoercions);
      this.#ajvWithCoercions.addSchema(this.#openApiObject, SCHEMA_ID);
    }

    return this.#ajvWithCoercions;
  }
}
