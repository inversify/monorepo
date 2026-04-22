/**
 * Sorts path segments to keep path priority as stated in OpenAPI 3.X specifications.
 * @param firstPathTemplate First path template
 * @param secondPathTemplate Second path template
 * @returns Numeric value indicating the order of the paths for sorting purposes.
 */
export function sortOpenApiPathTemplates(
  firstPathTemplate: string,
  secondPathTemplate: string,
): number {
  let currentFirstPathIndex: number = 0;
  let currentSecondPathIndex: number = 0;

  let firstPathParamStartIndex: number = firstPathTemplate.indexOf('{');
  let secondPathParamStartIndex: number = secondPathTemplate.indexOf('{');

  while (firstPathParamStartIndex !== -1 && secondPathParamStartIndex !== -1) {
    if (firstPathParamStartIndex === -1) {
      return -1;
    }

    if (secondPathParamStartIndex === -1) {
      return 1;
    }

    // Compare slices
    const firstPathSlice: string = firstPathTemplate.slice(
      currentFirstPathIndex,
      firstPathParamStartIndex,
    );
    const secondPathSlice: string = secondPathTemplate.slice(
      currentSecondPathIndex,
      secondPathParamStartIndex,
    );

    if (firstPathSlice < secondPathSlice) {
      return -1;
    }

    if (firstPathSlice > secondPathSlice) {
      return 1;
    }

    // Move the indices to the next slice
    currentFirstPathIndex =
      firstPathTemplate.indexOf('}', firstPathParamStartIndex + 1) + 1;
    currentSecondPathIndex =
      secondPathTemplate.indexOf('}', secondPathParamStartIndex + 1) + 1;

    firstPathParamStartIndex = firstPathTemplate.indexOf(
      '{',
      currentFirstPathIndex,
    );
    secondPathParamStartIndex = secondPathTemplate.indexOf(
      '{',
      currentSecondPathIndex,
    );
  }

  if (firstPathParamStartIndex !== -1) {
    const firstLiteralSlice: string = firstPathTemplate.slice(
      currentFirstPathIndex,
      firstPathParamStartIndex,
    );
    const secondLiteralSlice: string = secondPathTemplate.slice(
      currentSecondPathIndex,
      currentSecondPathIndex + firstLiteralSlice.length,
    );

    if (firstLiteralSlice === secondLiteralSlice) {
      return 1;
    }
  }

  if (secondPathParamStartIndex !== -1) {
    const secondLiteralSlice: string = secondPathTemplate.slice(
      currentSecondPathIndex,
      secondPathParamStartIndex,
    );
    const firstLiteralSlice: string = firstPathTemplate.slice(
      currentFirstPathIndex,
      currentFirstPathIndex + secondLiteralSlice.length,
    );

    if (secondLiteralSlice === firstLiteralSlice) {
      return -1;
    }
  }

  if (firstPathTemplate < secondPathTemplate) {
    return -1;
  }

  if (firstPathTemplate > secondPathTemplate) {
    return 1;
  }

  return 0;
}
