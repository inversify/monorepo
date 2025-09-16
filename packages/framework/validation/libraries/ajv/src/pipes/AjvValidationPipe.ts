import { isPromise } from '@inversifyjs/common';
import { Pipe, PipeMetadata } from '@inversifyjs/framework-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import Ajv, { AnySchema } from 'ajv';

import { stringifyAjvErrors } from '../calculations/stringifyAjvErrors';
import { ajvValidationMetadataReflectKey } from '../reflectMetadata/models/ajvValidationMetadataReflectKey';

export class AjvValidationPipe implements Pipe {
  protected readonly _ajv: Ajv;
  readonly #schemaList: AnySchema[];

  constructor(ajv: Ajv, typeList?: AnySchema[]) {
    this._ajv = ajv;
    this.#schemaList = typeList ?? [];
  }

  public async execute(
    input: unknown,
    metadata: PipeMetadata,
  ): Promise<unknown> {
    const parameterSchemaList: AnySchema[] | undefined = getOwnReflectMetadata<
      AnySchema[][]
    >(
      metadata.targetClass,
      ajvValidationMetadataReflectKey,
      metadata.methodName,
    )?.[metadata.parameterIndex];

    if (parameterSchemaList === undefined) {
      return this.#applySchemaList(input, this.#schemaList);
    }

    return this.#applySchemaList(
      await this.#applySchemaList(input, this.#schemaList),
      parameterSchemaList,
    );
  }

  protected async _validate(schema: AnySchema, input: unknown): Promise<void> {
    const result: boolean | Promise<unknown> = this._ajv.validate(
      schema,
      input,
    );

    if (!isPromise(result)) {
      if (result) {
        return;
      }

      throw new InversifyValidationError(
        InversifyValidationErrorKind.validationFailed,
        stringifyAjvErrors(this._ajv.errors ?? []),
      );
    }

    try {
      await result;
    } catch (error: unknown) {
      if (error instanceof Ajv.ValidationError) {
        throw new InversifyValidationError(
          InversifyValidationErrorKind.validationFailed,
          stringifyAjvErrors(error.errors),
        );
      }
    }
  }

  async #applySchemaList(
    input: unknown,
    schemaList: AnySchema[],
  ): Promise<unknown> {
    for (const schema of schemaList) {
      await this._validate(schema, input);
    }

    return input;
  }
}
