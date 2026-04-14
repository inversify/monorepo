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
import { buildCompositeValidationHandler } from '../../calculations/buildCompositeValidationHandler.js';
import { handleBodyValidation } from '../../calculations/v3Dot2/handleBodyValidation.js';
import { handleHeaderValidation } from '../../calculations/v3Dot2/handleHeaderValidation.js';
import { SCHEMA_ID } from '../../models/v3Dot2/schemaId.js';
import { type ValidationCacheEntry } from '../../models/v3Dot2/ValidationCacheEntry.js';
import {
  validatedInputParamBodyType,
  validatedInputParamHeaderType,
} from '../../models/validatedInputParamTypes.js';
import { type OpenApiResolver } from '../../services/OpenApiResolver.js';
import { DefaultOpenApiResolver } from '../../services/v3Dot2/DefaultOpenApiResolver.js';
import { ValidationCache } from '../../services/v3Dot2/ValidationCache.js';

const handler: (
  ajv: Ajv,
  openApiObject: OpenApi3Dot2Object,
  openApiResolver: OpenApiResolver,
  inputParam: unknown,
  getEntry: (path: string, method: string) => ValidationCacheEntry,
) => unknown = buildCompositeValidationHandler<
  OpenApi3Dot2Object,
  ValidationCacheEntry
>([[validatedInputParamBodyType, handleBodyValidation], [validatedInputParamHeaderType, handleHeaderValidation]]);

export class OpenApiValidationPipe implements Pipe {
  readonly #openApiObject: OpenApi3Dot2Object;
  readonly #openApiResolver: OpenApiResolver;
  readonly #validationCache: ValidationCache;

  #ajv: Ajv | undefined;

  constructor(openApiObject: OpenApi3Dot2Object) {
    this.#openApiObject = openApiObject;
    this.#openApiResolver = new DefaultOpenApiResolver(openApiObject);
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
      this.#openApiResolver,
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
