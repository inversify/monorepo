import { beforeAll, describe, expect, it } from 'vitest';

import { ApiStyle } from '../../models/ApiStyle.js';
import { OpenApiSchemaBindingKind } from '../models/OpenApiSchemaBindingKind.js';
import { type StatusControllerSourceModel } from '../models/StatusControllerSourceModel.js';
import { createStatusControllerSourceModel } from './createStatusControllerSourceModel.js';

describe(createStatusControllerSourceModel, () => {
  describe('when called with code-first', () => {
    let result: StatusControllerSourceModel;

    beforeAll(() => {
      result = createStatusControllerSourceModel(ApiStyle.codeFirst);
    });

    it('should import the class model and use toSchema', () => {
      expect(result).toStrictEqual({
        apiTypeImport: {
          moduleSpecifier: '../models/StatusV1.js',
          namedImports: [{ name: 'StatusV1' }],
        },
        openApiSchemaBindingKind: OpenApiSchemaBindingKind.toSchema,
      });
    });
  });

  describe('when called with schema-first', () => {
    let result: StatusControllerSourceModel;

    beforeAll(() => {
      result = createStatusControllerSourceModel(ApiStyle.schemaFirst);
    });

    it('should import generated types and use component refs', () => {
      expect(result).toStrictEqual({
        apiTypeImport: {
          isTypeOnly: true,
          moduleSpecifier: '../../../generated/api/index.js',
          namedImports: [{ name: 'StatusV1' }],
        },
        openApiSchemaBindingKind: OpenApiSchemaBindingKind.componentRef,
      });
    });
  });
});
