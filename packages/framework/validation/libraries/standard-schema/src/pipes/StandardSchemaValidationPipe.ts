import { Pipe, PipeMetadata } from '@inversifyjs/framework-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import { StandardSchemaV1 } from '@standard-schema/spec';

import { standardSchemaValidationMetadataReflectKey } from '../reflectMetadata/models/standardSchemaValidationMetadataReflectKey';

export class StandardSchemaValidationPipe implements Pipe {
  readonly #schemaList: StandardSchemaV1[];

  constructor(typeList?: StandardSchemaV1[]) {
    this.#schemaList = typeList ?? [];
  }

  public async execute(
    input: unknown,
    metadata: PipeMetadata,
  ): Promise<unknown> {
    const parameterSchemaList: StandardSchemaV1[] | undefined =
      getOwnReflectMetadata<StandardSchemaV1[][]>(
        metadata.targetClass,
        standardSchemaValidationMetadataReflectKey,
        metadata.methodName,
      )?.[metadata.parameterIndex];

    if (parameterSchemaList === undefined) {
      return input;
    }

    return this.#applySchemaList(
      await this.#applySchemaList(input, this.#schemaList),
      parameterSchemaList,
    );
  }

  async #applySchemaList(
    input: unknown,
    typeList: StandardSchemaV1[],
  ): Promise<unknown> {
    let result: unknown = input;

    for (const standardSchema of typeList) {
      const parsedResult: StandardSchemaV1.Result<unknown> =
        await standardSchema['~standard'].validate(result);

      if (parsedResult.issues !== undefined) {
        throw new InversifyValidationError(
          InversifyValidationErrorKind.validationFailed,
          parsedResult.issues
            .map((issue: StandardSchemaV1.Issue) => issue.message)
            .join('\n'),
        );
      }

      result = parsedResult.value;
    }

    return result;
  }
}
