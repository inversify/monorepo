import { ZodType } from 'zod';

export function buildZodValidationMetadata(
  typeList: ZodType[],
  index: number,
): (zodValidationMetadata: ZodType[][]) => ZodType[][] {
  return (zodValidationMetadata: ZodType[][]): ZodType[][] => {
    let zodTypeList: ZodType[] | undefined = zodValidationMetadata[index];

    if (zodTypeList === undefined) {
      zodTypeList = [];

      zodValidationMetadata[index] = zodTypeList;
    }

    zodTypeList.push(...typeList);

    return zodValidationMetadata;
  };
}
