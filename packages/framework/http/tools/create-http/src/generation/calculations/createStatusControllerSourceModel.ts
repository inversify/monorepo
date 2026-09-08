import { ApiStyle } from '../../models/ApiStyle.js';
import { OpenApiSchemaBindingKind } from '../models/OpenApiSchemaBindingKind.js';
import { type StatusControllerSourceModel } from '../models/StatusControllerSourceModel.js';

export function createStatusControllerSourceModel(
  apiStyle: ApiStyle,
): StatusControllerSourceModel {
  if (apiStyle === ApiStyle.schemaFirst) {
    return {
      apiTypeImport: {
        isTypeOnly: true,
        moduleSpecifier: '../../../generated/api/index.js',
        namedImports: [{ name: 'StatusV1' }],
      },
      openApiSchemaBindingKind: OpenApiSchemaBindingKind.componentRef,
    };
  }

  return {
    apiTypeImport: {
      moduleSpecifier: '../models/StatusV1.js',
      namedImports: [{ name: 'StatusV1' }],
    },
    openApiSchemaBindingKind: OpenApiSchemaBindingKind.toSchema,
  };
}
