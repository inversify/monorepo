import { type Pipe, type PipeMetadata } from '@inversifyjs/framework-core';
import {
  type ControllerMethodParameterMetadata,
  getControllerMethodParameterMetadataList,
} from '@inversifyjs/http-core';
import { type OpenApi3Dot1Object } from '@inversifyjs/open-api-types/v3Dot1';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';

import { openApiValidationMetadataReflectKey } from '../../../metadata/models/openApiValidationMetadataReflectKey.js';
import { OpenApi3Dot1Router } from '../../../router/services/v3Dot1/OpenApi3Dot1Router.js';
import { buildCompositeValidationHandler } from '../../calculations/buildCompositeValidationHandler.js';
import { handleBodyValidation } from '../../calculations/v3Dot1/handleBodyValidation.js';
import { handleHeaderValidation } from '../../calculations/v3Dot1/handleHeaderValidation.js';
import { handleParamValidation } from '../../calculations/v3Dot1/handleParamValidation.js';
import { type OpenApiValidationContext } from '../../models/OpenApiValidationContext.js';
import { SCHEMA_ID } from '../../models/v3Dot1/schemaId.js';
import { type ValidationCacheEntry } from '../../models/v3Dot1/ValidationCacheEntry.js';
import {
  validatedInputParamBodyType,
  validatedInputParamHeaderType,
  validatedInputParamParamType,
} from '../../models/validatedInputParamTypes.js';
import { DefaultOpenApiResolver } from '../../services/v3Dot1/DefaultOpenApiResolver.js';
import { ValidationCache } from '../../services/v3Dot1/ValidationCache.js';

const handler: (
  ajv: Ajv,
  openApiObject: OpenApi3Dot1Object,
  validationContext: OpenApiValidationContext,
  inputParam: unknown,
  getEntry: (path: string, method: string) => ValidationCacheEntry,
) => unknown = buildCompositeValidationHandler<
  OpenApi3Dot1Object,
  ValidationCacheEntry
>({
  [validatedInputParamBodyType]: handleBodyValidation,
  [validatedInputParamHeaderType]: handleHeaderValidation,
  [validatedInputParamParamType]: handleParamValidation,
});

export class OpenApiValidationPipe implements Pipe {
  readonly #openApiObject: OpenApi3Dot1Object;
  readonly #validationCache: ValidationCache;
  readonly #validationContext: OpenApiValidationContext;

  #ajv: Ajv | undefined;

  constructor(openApiObject: OpenApi3Dot1Object) {
    this.#openApiObject = openApiObject;
    this.#validationContext = {
      resolver: new DefaultOpenApiResolver(openApiObject),
      router: new OpenApi3Dot1Router(openApiObject),
    };
    this.#validationCache = new ValidationCache();
    this.#ajv = undefined;
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

    const ajv: Ajv = this.#getOrInitAjv();

    return handler(
      ajv,
      this.#openApiObject,
      this.#validationContext,
      input,
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
}
