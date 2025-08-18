import { ZodType } from 'zod';

export function buildZodValidationMetadata(
  typeList: ZodType[],
  index: number,
): (zodValidationMetadata: ZodType[][]) => ZodType[][] {
  return (zodValidationMetadata: ZodType[][]): ZodType[][] => {
    let zodTypeList: ZodType[] = zodValidationMetadata[index] ?? [];

    zodTypeList = [...zodTypeList, ...typeList];

    zodValidationMetadata[index] = zodTypeList;

    return zodValidationMetadata;
  };
}
