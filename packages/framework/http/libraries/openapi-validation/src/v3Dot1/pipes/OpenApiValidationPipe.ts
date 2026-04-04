import { type Pipe, type PipeMetadata } from '@inversifyjs/framework-core';
import {
  buildNormalizedPath,
  type ControllerMetadata,
  type ControllerMethodMetadata,
  type ControllerMethodParameterMetadata,
  getControllerMetadataList,
  getControllerMethodMetadataList,
  getControllerMethodParameterMetadataList,
  RequestMethodParameterType,
  RequestMethodType,
} from '@inversifyjs/http-core';
import {
  type ControllerOpenApiMetadata,
  getControllerOpenApiMetadata,
} from '@inversifyjs/http-open-api';
import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import {
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1RequestBodyObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import Ajv, { type ErrorObject, type ValidateFunction } from 'ajv';
import addFormats from 'ajv-formats';

import { openApiValidationMetadataReflectKey } from '../../common/reflectMetadata/openApiValidationMetadataReflectKey.js';

const SCHEMA_ID: string = 'openapi-v3dot1-spec';

export class OpenApiValidationPipe implements Pipe {
  readonly #openApiObject: OpenApi3Dot1Object;
  readonly #requestContentTypeProvider: (() => string | undefined) | undefined;

  #ajv: Ajv | undefined;

  constructor(
    openApiObject: OpenApi3Dot1Object,
    requestContentTypeProvider?: () => string | undefined,
  ) {
    this.#openApiObject = openApiObject;
    this.#requestContentTypeProvider = requestContentTypeProvider;
    this.#ajv = undefined;
  }

  public execute(input: unknown, metadata: PipeMetadata): unknown {
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

    if (parameterMetadata.parameterType !== RequestMethodParameterType.Body) {
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

    const ajv: Ajv = this.#getOrInitAjv();

    const contentType: string = this.#resolveContentType(metadata);

    const controllerOpenApiMetadata: ControllerOpenApiMetadata | undefined =
      getControllerOpenApiMetadata(metadata.targetClass);

    if (controllerOpenApiMetadata === undefined) {
      return input;
    }

    const operationObject: OpenApi3Dot1OperationObject | undefined =
      controllerOpenApiMetadata.methodToOperationObjectMap.get(
        metadata.methodName,
      );

    if (operationObject === undefined) {
      return input;
    }

    const controllerMetadata: ControllerMetadata | undefined =
      getControllerMetadataList()?.find(
        (cm: ControllerMetadata): boolean => cm.target === metadata.targetClass,
      );

    if (controllerMetadata === undefined) {
      return input;
    }

    const methodMetadata: ControllerMethodMetadata | undefined =
      getControllerMethodMetadataList(metadata.targetClass).find(
        (mm: ControllerMethodMetadata): boolean =>
          mm.methodKey === metadata.methodName,
      );

    if (methodMetadata === undefined) {
      return input;
    }

    const path: string = buildNormalizedPath(
      `${controllerMetadata.path}/${methodMetadata.path}`,
    );

    const httpMethod: string =
      methodMetadata.requestMethodType === RequestMethodType.All
        ? 'post'
        : methodMetadata.requestMethodType;

    const pointer: string = `${SCHEMA_ID}#/${escapeJsonPointerFragments('paths', path, httpMethod, 'requestBody', 'content', contentType, 'schema')}`;

    const validate: ValidateFunction | undefined = ajv.getSchema(pointer);

    if (validate === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        `Unable to find schema for pointer: ${pointer}`,
      );
    }

    const valid: boolean = validate(input);

    if (!valid) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        (validate.errors ?? [])
          .map(
            (error: ErrorObject): string =>
              `[schema: ${error.schemaPath}, instance: ${error.instancePath}]: "${error.message ?? '-'}"`,
          )
          .join('\n'),
      );
    }

    return input;
  }

  #getOrInitAjv(): Ajv {
    if (this.#ajv === undefined) {
      this.#ajv = new Ajv({ allErrors: true, strict: false });
      addFormats(this.#ajv);
      this.#ajv.addSchema(this.#openApiObject, SCHEMA_ID);
    }

    return this.#ajv;
  }

  #resolveContentType(metadata: PipeMetadata): string {
    const controllerOpenApiMetadata: ControllerOpenApiMetadata | undefined =
      getControllerOpenApiMetadata(metadata.targetClass);

    if (controllerOpenApiMetadata === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        'No OpenAPI metadata found for controller',
      );
    }

    const operationObject: OpenApi3Dot1OperationObject | undefined =
      controllerOpenApiMetadata.methodToOperationObjectMap.get(
        metadata.methodName,
      );

    if (operationObject === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        'No OpenAPI operation found for method',
      );
    }

    const requestBody: OpenApi3Dot1RequestBodyObject | undefined =
      operationObject.requestBody as OpenApi3Dot1RequestBodyObject | undefined;

    if (requestBody === undefined) {
      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        'No request body defined in OpenAPI spec for this operation',
      );
    }

    const declaredContentTypes: string[] = Object.keys(requestBody.content);

    const rawContentType: string | undefined =
      this.#requestContentTypeProvider?.();

    if (rawContentType !== undefined) {
      const baseMediaType: string = rawContentType.split(';')[0] ?? '';
      const baseContentType: string = baseMediaType.trim().toLowerCase();

      if (!declaredContentTypes.includes(baseContentType)) {
        throw new InversifyValidationError(
          InversifyValidationErrorKind.validationFailed,
          `Unsupported content type: ${baseContentType}. Supported: ${declaredContentTypes.join(', ')}`,
        );
      }

      return baseContentType;
    }

    if (declaredContentTypes.length === 1) {
      const singleContentType: string | undefined = declaredContentTypes[0];

      if (singleContentType !== undefined) {
        return singleContentType;
      }
    }

    throw new InversifyValidationError(
      InversifyValidationErrorKind.validationFailed,
      `Cannot determine content type: multiple content types declared (${declaredContentTypes.join(', ')}) but no Content-Type header provided`,
    );
  }
}
