import { AnySchema } from 'ajv';

export function updateAjvValidationMetadata(
  typeList: AnySchema[],
  index: number,
): (metadata: AnySchema[][]) => AnySchema[][] {
  return (metadata: AnySchema[][]): AnySchema[][] => {
    let schemaList: AnySchema[] | undefined = metadata[index];

    if (schemaList === undefined) {
      schemaList = [];

      metadata[index] = schemaList;
    }

    schemaList.push(...typeList);

    return metadata;
  };
}
