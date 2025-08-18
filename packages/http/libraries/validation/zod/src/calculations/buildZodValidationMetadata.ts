import { ZodSchema } from 'zod';

export function buildZodValidationMetadata(
  schemaList: ZodSchema[],
  index: number,
): (zodValidationMetadata: ZodSchema[][]) => ZodSchema[][] {
  return (zodValidationMetadata: ZodSchema[][]): ZodSchema[][] => {
    let zodSchemaList: ZodSchema[] = zodValidationMetadata[index] ?? [];

    zodSchemaList = [...zodSchemaList, ...schemaList];

    zodValidationMetadata[index] = zodSchemaList;

    return zodValidationMetadata;
  };
}
