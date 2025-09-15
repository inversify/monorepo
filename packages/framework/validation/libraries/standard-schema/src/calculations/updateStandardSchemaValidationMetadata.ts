import { StandardSchemaV1 } from '@standard-schema/spec';

export function updateStandardSchemaValidationMetadata(
  typeList: StandardSchemaV1[],
  index: number,
): (zodValidationMetadata: StandardSchemaV1[][]) => StandardSchemaV1[][] {
  return (
    zodValidationMetadata: StandardSchemaV1[][],
  ): StandardSchemaV1[][] => {
    let standardSchemaV1List: StandardSchemaV1[] | undefined =
      zodValidationMetadata[index];

    if (standardSchemaV1List === undefined) {
      standardSchemaV1List = [];

      zodValidationMetadata[index] = standardSchemaV1List;
    }

    standardSchemaV1List.push(...typeList);

    return zodValidationMetadata;
  };
}
