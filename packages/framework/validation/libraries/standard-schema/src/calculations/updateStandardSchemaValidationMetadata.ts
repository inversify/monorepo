import { StandardSchemaV1 } from '@standard-schema/spec';

export function updateStandardSchemaValidationMetadata(
  typeList: StandardSchemaV1[],
  index: number,
): (metadata: StandardSchemaV1[][]) => StandardSchemaV1[][] {
  return (metadata: StandardSchemaV1[][]): StandardSchemaV1[][] => {
    let standardSchemaV1List: StandardSchemaV1[] | undefined = metadata[index];

    if (standardSchemaV1List === undefined) {
      standardSchemaV1List = [];

      metadata[index] = standardSchemaV1List;
    }

    standardSchemaV1List.push(...typeList);

    return metadata;
  };
}
