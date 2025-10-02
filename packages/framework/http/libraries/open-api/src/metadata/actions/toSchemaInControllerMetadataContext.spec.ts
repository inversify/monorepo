import {
  afterAll,
  beforeAll,
  describe,
  expect,
  it,
  Mock,
  vitest,
} from 'vitest';

vitest.mock('./toSchema');

import { toSchema } from './toSchema';
import { toSchemaInControllerOpenApiMetadataContext } from './toSchemaInControllerMetadataContext';

describe(toSchemaInControllerOpenApiMetadataContext, () => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  let targetFixture: Function;
  let toSchemaMock: Mock;
  let mockToSchemaFunction: Mock;

  beforeAll(() => {
    targetFixture = class TestTarget {};
    toSchemaMock = vitest.mocked(toSchema);
    mockToSchemaFunction = vitest.fn();
  });

  describe('when called', () => {
    let result: unknown;

    beforeAll(() => {
      toSchemaMock.mockReturnValueOnce(mockToSchemaFunction);

      result = toSchemaInControllerOpenApiMetadataContext(targetFixture);
    });

    afterAll(() => {
      vitest.clearAllMocks();
    });

    it('should call toSchema() with a callback function', () => {
      expect(toSchemaMock).toHaveBeenCalledExactlyOnceWith(
        expect.any(Function),
      );
    });

    it('should return the result from toSchema()', () => {
      expect(result).toBe(mockToSchemaFunction);
    });
  });
});
