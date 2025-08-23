import { Pipe, PipeMetadata } from '@inversifyjs/framework-core';
import { BadRequestHttpResponse } from '@inversifyjs/http-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { ZodSafeParseResult, ZodType } from 'zod';

import { zodValidationMetadataReflectKey } from '../reflectMetadata/data/zodValidationMetadataReflectKey';

export class ZodValidationPipe implements Pipe {
  readonly #typeList: ZodType[];

  constructor(typeList?: ZodType[]) {
    this.#typeList = typeList ?? [];
  }

  public execute(input: unknown, metadata: PipeMetadata): unknown {
    const parameterTypeList: ZodType[] =
      getOwnReflectMetadata<ZodType[][]>(
        metadata.targetClass,
        zodValidationMetadataReflectKey,
        metadata.methodName,
      )?.[metadata.parameterIndex] ?? [];

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
