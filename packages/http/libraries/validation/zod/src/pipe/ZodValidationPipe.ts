import { Pipe, PipeMetadata } from '@inversifyjs/http-core';
import { BadRequestHttpResponse } from '@inversifyjs/http-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { ZodSafeParseResult, ZodType } from 'zod';

import { zodValidationMetadataReflectKey } from '../reflectMetadata/data/zodValidationMetadataReflectKey';

export class ZodValidationPipe implements Pipe {
  readonly #schemaList: ZodType[];

  constructor(schemaList?: ZodType[]) {
    this.#schemaList = schemaList ?? [];
  }

  public execute(input: unknown, metadata: PipeMetadata): unknown {
    const parameterSchemaList: ZodType[] =
      getOwnReflectMetadata<ZodType[][]>(
        metadata.targetClass,
        zodValidationMetadataReflectKey,
        metadata.methodName,
      )?.[metadata.parameterIndex] ?? [];

    return this.#applySchemaList(
      this.#applySchemaList(input, this.#schemaList),
      parameterSchemaList,
    );
  }

  #applySchemaList(input: unknown, schemaList: ZodType[]): unknown {
    let result: unknown = input;

    for (const schema of schemaList) {
      const parsedResult: ZodSafeParseResult<unknown> =
        schema.safeParse(result);

      if (!parsedResult.success) {
        throw new BadRequestHttpResponse(
          parsedResult.error.message,
          undefined,
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
