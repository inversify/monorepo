import { Pipe, PipeMetadata } from '@inversifyjs/framework-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import {
  InversifyValidationError,
  InversifyValidationErrorKind,
} from '@inversifyjs/validation-common';
import { ZodSafeParseResult, ZodType } from 'zod';

import { zodValidationMetadataReflectKey } from '../reflectMetadata/data/zodValidationMetadataReflectKey';

export class ZodValidationPipe implements Pipe {
  readonly #typeList: ZodType[];

  constructor(typeList?: ZodType[]) {
    this.#typeList = typeList ?? [];
  }

  public execute(input: unknown, metadata: PipeMetadata): unknown {
    const parameterTypeList: ZodType[] | undefined = getOwnReflectMetadata<
      ZodType[][]
    >(
      metadata.targetClass,
      zodValidationMetadataReflectKey,
      metadata.methodName,
    )?.[metadata.parameterIndex];

    if (parameterTypeList === undefined) {
      return input;
    }

    return this.#applySchemaList(
      this.#applySchemaList(input, this.#typeList),
      parameterTypeList,
    );
  }

  #applySchemaList(input: unknown, typeList: ZodType[]): unknown {
    let result: unknown = input;

    for (const zodType of typeList) {
      const parsedResult: ZodSafeParseResult<unknown> =
        zodType.safeParse(result);

      if (!parsedResult.success) {
        throw new InversifyValidationError(
          InversifyValidationErrorKind.validationFailed,
          parsedResult.error.message,
          {
            cause: parsedResult.error,
          },
        );
      }

      result = parsedResult.data;
    }

    return result;
  }
}
