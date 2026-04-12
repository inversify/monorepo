import {
  traverse,
  type TraverseJsonSchemaCallbackParams,
  type TraverseJsonSchemaParams,
} from '@inversifyjs/json-schema-utils/2020-12';
import {
  type OpenApi3Dot1CallbackObject,
  type OpenApi3Dot1ComponentsObject,
  type OpenApi3Dot1HeaderObject,
  type OpenApi3Dot1MediaTypeObject,
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1ParameterObject,
  type OpenApi3Dot1PathItemObject,
  type OpenApi3Dot1PathsObject,
  type OpenApi3Dot1ReferenceObject,
  type OpenApi3Dot1RequestBodyObject,
  type OpenApi3Dot1ResponseObject,
  type OpenApi3Dot1ResponsesObject,
} from '@inversifyjs/open-api-types/v3Dot1';

export function traverseOpenApiObjectJsonSchemas(
  openApiObject: OpenApi3Dot1Object,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApiObject.components !== undefined) {
    traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
      openApiObject.components,
      callback,
    );
  }

  if (openApiObject.paths !== undefined) {
    traverseOpenApi3Dot1PathsObjectJsonSchemas(openApiObject.paths, callback);
  }

  if (openApiObject.webhooks !== undefined) {
    for (const pathItem of Object.values(openApiObject.webhooks)) {
      // Consider OpenApi3Dot1PathItemObject as a superset of OpenApi3Dot1ReferenceObject
      traverseOpenApi3Dot1PathItemObjectJsonSchemas(pathItem, callback);
    }
  }
}

export function traverseOpenApi3Dot1HeaderObjectJsonSchemas(
  openApi3Dot1HeaderObject: OpenApi3Dot1HeaderObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot1HeaderObject.content !== undefined) {
    for (const mediaTypeObject of Object.values(
      openApi3Dot1HeaderObject.content,
    )) {
      traverseOpenApi3Dot1MediaTypeObjectJsonSchemas(mediaTypeObject, callback);
    }
  }

  if (openApi3Dot1HeaderObject.schema !== undefined) {
    const params: TraverseJsonSchemaParams = {
      jsonPointer: '',
      schema: openApi3Dot1HeaderObject.schema,
    };

    traverse(params, callback);
  }
}

export function traverseOpenApi3Dot1MediaTypeObjectJsonSchemas(
  openApi3Dot1MediaTypeObject: OpenApi3Dot1MediaTypeObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot1MediaTypeObject.schema !== undefined) {
    const params: TraverseJsonSchemaParams = {
      jsonPointer: '',
      schema: openApi3Dot1MediaTypeObject.schema,
    };

    traverse(params, callback);
  }
}

export function traverseOpenApi3Dot1ComponentsObjectJsonSchemas(
  openApi3Dot1ComponentsObject: OpenApi3Dot1ComponentsObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot1ComponentsObject.callbacks !== undefined) {
    for (const componentsCallback of Object.values(
      openApi3Dot1ComponentsObject.callbacks,
    )) {
      if (isNotReferenceObject(componentsCallback)) {
        traverseOpenApi3Dot1CallbackObjectJsonSchemas(
          componentsCallback,
          callback,
        );
      }
    }
  }

  if (openApi3Dot1ComponentsObject.headers !== undefined) {
    for (const componentsHeader of Object.values(
      openApi3Dot1ComponentsObject.headers,
    )) {
      // Consider OpenApi3Dot1HeaderObject as a superset of OpenApi3Dot1ReferenceObject
      traverseOpenApi3Dot1HeaderObjectJsonSchemas(componentsHeader, callback);
    }
  }

  if (openApi3Dot1ComponentsObject.parameters !== undefined) {
    for (const componentsParameter of Object.values(
      openApi3Dot1ComponentsObject.parameters,
    )) {
      if (isNotReferenceObject(componentsParameter)) {
        traverseOpenApi3Dot1ParameterObjectJsonSchemas(
          componentsParameter,
          callback,
        );
      }
    }
  }

  if (openApi3Dot1ComponentsObject.pathItems !== undefined) {
    for (const componentsPathItem of Object.values(
      openApi3Dot1ComponentsObject.pathItems,
    )) {
      // Consider OpenApi3Dot1PathItemObject as a superset of OpenApi3Dot1ReferenceObject
      traverseOpenApi3Dot1PathItemObjectJsonSchemas(
        componentsPathItem,
        callback,
      );
    }
  }

  if (openApi3Dot1ComponentsObject.requestBodies !== undefined) {
    for (const requestBody of Object.values(
      openApi3Dot1ComponentsObject.requestBodies,
    )) {
      if (isOpenApi3Dot1RequestBodyObject(requestBody)) {
        traverseOpenApi3Dot1RequestBodyObjectJsonSchemas(requestBody, callback);
      }
    }
  }

  if (openApi3Dot1ComponentsObject.responses !== undefined) {
    for (const response of Object.values(
      openApi3Dot1ComponentsObject.responses,
    )) {
      if (isNotReferenceObject(response)) {
        traverseOpenApi3Dot1ResponseObjectJsonSchemas(response, callback);
      }
    }
  }

  if (openApi3Dot1ComponentsObject.schemas !== undefined) {
    for (const schema of Object.values(openApi3Dot1ComponentsObject.schemas)) {
      const params: TraverseJsonSchemaParams = {
        jsonPointer: '',
        schema,
      };

      traverse(params, callback);
    }
  }
}

export function traverseOpenApi3Dot1ParameterObjectJsonSchemas(
  param: OpenApi3Dot1ParameterObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (param.content !== undefined) {
    for (const mediaTypeObject of Object.values(param.content)) {
      traverseOpenApi3Dot1MediaTypeObjectJsonSchemas(mediaTypeObject, callback);
    }
  }

  if (param.schema !== undefined) {
    traverse({ jsonPointer: '', schema: param.schema }, callback);
  }
}

export function traverseOpenApi3Dot1RequestBodyObjectJsonSchemas(
  openApi3Dot1RequestBodyObject: OpenApi3Dot1RequestBodyObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  for (const mediaTypeObject of Object.values(
    openApi3Dot1RequestBodyObject.content,
  )) {
    traverseOpenApi3Dot1MediaTypeObjectJsonSchemas(mediaTypeObject, callback);
  }
}

export function traverseOpenApi3Dot1ResponseObjectJsonSchemas(
  openApi3Dot1ResponseBodyObject: OpenApi3Dot1ResponseObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot1ResponseBodyObject.content !== undefined) {
    for (const mediaTypeObject of Object.values(
      openApi3Dot1ResponseBodyObject.content,
    )) {
      traverseOpenApi3Dot1MediaTypeObjectJsonSchemas(mediaTypeObject, callback);
    }
  }

  if (openApi3Dot1ResponseBodyObject.headers !== undefined) {
    for (const headerObject of Object.values(
      openApi3Dot1ResponseBodyObject.headers,
    )) {
      // Consider OpenApi3Dot1HeaderObject as a superset of OpenApi3Dot1ReferenceObject
      traverseOpenApi3Dot1HeaderObjectJsonSchemas(headerObject, callback);
    }
  }
}

export function traverseOpenApi3Dot1OperationObjectJsonSchemas(
  openApi3Dot1OperationObject: OpenApi3Dot1OperationObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot1OperationObject.callbacks !== undefined) {
    for (const operationCallback of Object.values(
      openApi3Dot1OperationObject.callbacks,
    )) {
      if (isNotReferenceObject(operationCallback)) {
        traverseOpenApi3Dot1CallbackObjectJsonSchemas(
          operationCallback,
          callback,
        );
      }
    }
  }

  if (openApi3Dot1OperationObject.parameters !== undefined) {
    for (const param of openApi3Dot1OperationObject.parameters) {
      if (isNotReferenceObject(param)) {
        traverseOpenApi3Dot1ParameterObjectJsonSchemas(param, callback);
      }
    }
  }

  if (
    isOpenApi3Dot1RequestBodyObject(openApi3Dot1OperationObject.requestBody)
  ) {
    traverseOpenApi3Dot1RequestBodyObjectJsonSchemas(
      openApi3Dot1OperationObject.requestBody,
      callback,
    );
  }

  if (openApi3Dot1OperationObject.responses !== undefined) {
    traverseOpenApi3Dot1ResponsesObjectJsonSchemas(
      openApi3Dot1OperationObject.responses,
      callback,
    );
  }
}

export function traverseOpenApi3Dot1ResponsesObjectJsonSchemas(
  openApi3Dot1ResponsesBodyObject: OpenApi3Dot1ResponsesObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  for (const responseObject of Object.values(openApi3Dot1ResponsesBodyObject)) {
    if (isNotReferenceObject(responseObject)) {
      traverseOpenApi3Dot1ResponseObjectJsonSchemas(responseObject, callback);
    }
  }
}

export function traverseOpenApi3Dot1PathItemObjectJsonSchemas(
  openApi3Dot1PathItemObject: OpenApi3Dot1PathItemObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  const handlers: Partial<
    Record<
      keyof OpenApi3Dot1PathItemObject,
      (
        openApi3Dot1PathItemObject: OpenApi3Dot1OperationObject,
        callback: (params: TraverseJsonSchemaCallbackParams) => void,
      ) => void
    >
  > = {
    delete: traverseOpenApi3Dot1OperationObjectJsonSchemas,
    get: traverseOpenApi3Dot1OperationObjectJsonSchemas,
    head: traverseOpenApi3Dot1OperationObjectJsonSchemas,
    options: traverseOpenApi3Dot1OperationObjectJsonSchemas,
    patch: traverseOpenApi3Dot1OperationObjectJsonSchemas,
    post: traverseOpenApi3Dot1OperationObjectJsonSchemas,
    put: traverseOpenApi3Dot1OperationObjectJsonSchemas,
    trace: traverseOpenApi3Dot1OperationObjectJsonSchemas,
  };

  if (openApi3Dot1PathItemObject.parameters !== undefined) {
    for (const param of openApi3Dot1PathItemObject.parameters) {
      if (isNotReferenceObject(param)) {
        traverseOpenApi3Dot1ParameterObjectJsonSchemas(param, callback);
      }
    }
  }

  for (const key of Object.keys(
    openApi3Dot1PathItemObject,
  ) as (keyof OpenApi3Dot1PathItemObject)[]) {
    const handler:
      | ((
          openApi3Dot1PathItemObject: OpenApi3Dot1OperationObject,
          callback: (params: TraverseJsonSchemaCallbackParams) => void,
        ) => void)
      | undefined = handlers[key];

    if (handler !== undefined) {
      handler(
        openApi3Dot1PathItemObject[key] as OpenApi3Dot1OperationObject,
        callback,
      );
    }
  }
}

export function traverseOpenApi3Dot1CallbackObjectJsonSchemas(
  openApi3Dot1CallbackObject: OpenApi3Dot1CallbackObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  for (const pathItem of Object.values(openApi3Dot1CallbackObject)) {
    // Consider OpenApi3Dot1PathItemObject as a superset of OpenApi3Dot1ReferenceObject
    traverseOpenApi3Dot1PathItemObjectJsonSchemas(pathItem, callback);
  }
}

export function traverseOpenApi3Dot1PathsObjectJsonSchemas(
  openApi3Dot1PathsObject: OpenApi3Dot1PathsObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  for (const pathItem of Object.values(openApi3Dot1PathsObject)) {
    // Consider OpenApi3Dot1PathItemObject as a superset of OpenApi3Dot1ReferenceObject
    traverseOpenApi3Dot1PathItemObjectJsonSchemas(pathItem, callback);
  }
}

function isNotReferenceObject<T>(
  value: T | OpenApi3Dot1ReferenceObject,
): value is T {
  return (value as Partial<OpenApi3Dot1ReferenceObject>).$ref === undefined;
}

function isOpenApi3Dot1RequestBodyObject(
  openApi3Dot1RequestBodyOrReferenceObject:
    | OpenApi3Dot1RequestBodyObject
    | OpenApi3Dot1ReferenceObject
    | undefined,
): openApi3Dot1RequestBodyOrReferenceObject is OpenApi3Dot1RequestBodyObject {
  return (
    openApi3Dot1RequestBodyOrReferenceObject !== undefined &&
    (
      openApi3Dot1RequestBodyOrReferenceObject as Partial<OpenApi3Dot1RequestBodyObject>
    ).content !== undefined
  );
}
