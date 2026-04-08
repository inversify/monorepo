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
import { buildCompositeValidationHandler } from '../../calculations/buildCompositeValidationHandler.js';
import { handleBodyValidation } from '../../calculations/v3Dot1/handleBodyValidation.js';
import { SCHEMA_ID } from '../../models/v3Dot1/schemaId.js';
import { validatedInputParamBodyType } from '../../models/validatedInputParamTypes.js';

const handler: (
  ajv: Ajv,
  openApiObject: OpenApi3Dot1Object,
  inputParam: unknown,
) => unknown = buildCompositeValidationHandler<OpenApi3Dot1Object>([
  [validatedInputParamBodyType, handleBodyValidation],
]);

export class OpenApiValidationPipe implements Pipe {
  readonly #openApiObject: OpenApi3Dot1Object;

  #ajv: Ajv | undefined;

  constructor(openApiObject: OpenApi3Dot1Object) {
    this.#openApiObject = openApiObject;
    this.#ajv = undefined;
  }

  public async execute(
    input: unknown,
    metadata: PipeMetadata,
  ): Promise<unknown> {
    // TODO: Implement async custom decorators, then remove this workaround
    const awaitedInput: unknown = await input;

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
      return awaitedInput;
    }

    const validateMarkers: boolean[] | undefined = getOwnReflectMetadata<
      boolean[]
    >(
      metadata.targetClass,
      openApiValidationMetadataReflectKey,
      metadata.methodName,
    );

    if (validateMarkers?.[metadata.parameterIndex] !== true) {
      return awaitedInput;
    }

    if (awaitedInput === null || typeof awaitedInput !== 'object') {
      return awaitedInput;
    }

    const ajv: Ajv = this.#getOrInitAjv();

    return handler(ajv, this.#openApiObject, awaitedInput);
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
