import { HttpResponse, Pipe, PipeMetadata } from '@inversifyjs/http-core';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { SafeParseReturnType, ZodSchema } from 'zod';
import { zodValidationMetadataReflectKey } from '../reflectMetadata/data/zodValidationMetadataReflectKey';

export class ZodValidationPipe implements Pipe {
  constructor(private readonly schemaList: ZodSchema[]) {}

  public execute(input: unknown, metadata: PipeMetadata): unknown {
    let result: unknown = input;

    const parameterSchemaList: ZodSchema[] =
      getOwnReflectMetadata<ZodSchema[][]>(
        metadata.targetClass,
        zodValidationMetadataReflectKey,
        metadata.methodName,
      )?.[metadata.parameterIndex] ?? [];

    const combinedSchemaList: ZodSchema[] = [
      ...this.schemaList,
      ...parameterSchemaList,
    ];

    for (const schema of combinedSchemaList) {
      const parsedResult: SafeParseReturnType<unknown, unknown> =
        schema.safeParse(result);

      if (!parsedResult.success) {
        throw new Error();
      }

      result = parsedResult.data;
    }

    return result;
  }

  public getHttpResponse(): HttpResponse {
      
  }
}
