import {
  traverse,
  type TraverseJsonSchemaCallbackParams,
  type TraverseJsonSchemaParams,
} from '@inversifyjs/json-schema-utils/2020-12';
import {
  type OpenApi3Dot2CallbackObject,
  type OpenApi3Dot2ComponentsObject,
  type OpenApi3Dot2HeaderObject,
  type OpenApi3Dot2MediaTypeObject,
  type OpenApi3Dot2Object,
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2ParameterObject,
  type OpenApi3Dot2PathItemObject,
  type OpenApi3Dot2PathsObject,
  type OpenApi3Dot2ReferenceObject,
  type OpenApi3Dot2RequestBodyObject,
  type OpenApi3Dot2ResponseObject,
  type OpenApi3Dot2ResponsesObject,
} from '@inversifyjs/open-api-types/v3Dot2';

export function traverseOpenApiObjectJsonSchemas(
  openApiObject: OpenApi3Dot2Object,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApiObject.components !== undefined) {
    traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
      openApiObject.components,
      callback,
    );
  }

  if (openApiObject.paths !== undefined) {
    traverseOpenApi3Dot2PathsObjectJsonSchemas(openApiObject.paths, callback);
  }

  if (openApiObject.webhooks !== undefined) {
    for (const pathItem of Object.values(openApiObject.webhooks)) {
      // Consider OpenApi3Dot2PathItemObject as a superset of OpenApi3Dot2ReferenceObject
      traverseOpenApi3Dot2PathItemObjectJsonSchemas(pathItem, callback);
    }
  }
}

export function traverseOpenApi3Dot2HeaderObjectJsonSchemas(
  openApi3Dot2HeaderObject: OpenApi3Dot2HeaderObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot2HeaderObject.content !== undefined) {
    for (const mediaTypeObject of Object.values(
      openApi3Dot2HeaderObject.content,
    )) {
      if (isNotReferenceObject(mediaTypeObject)) {
        traverseOpenApi3Dot2MediaTypeObjectJsonSchemas(
          mediaTypeObject,
          callback,
        );
      }
    }
  }

  if (openApi3Dot2HeaderObject.schema !== undefined) {
    const params: TraverseJsonSchemaParams = {
      jsonPointer: '',
      schema: openApi3Dot2HeaderObject.schema,
    };

    traverse(params, callback);
  }
}

export function traverseOpenApi3Dot2MediaTypeObjectJsonSchemas(
  openApi3Dot2MediaTypeObject: OpenApi3Dot2MediaTypeObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot2MediaTypeObject.schema !== undefined) {
    const params: TraverseJsonSchemaParams = {
      jsonPointer: '',
      schema: openApi3Dot2MediaTypeObject.schema,
    };

    traverse(params, callback);
  }
}

export function traverseOpenApi3Dot2ComponentsObjectJsonSchemas(
  openApi3Dot2ComponentsObject: OpenApi3Dot2ComponentsObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot2ComponentsObject.callbacks !== undefined) {
    for (const componentsCallback of Object.values(
      openApi3Dot2ComponentsObject.callbacks,
    )) {
      if (isNotReferenceObject(componentsCallback)) {
        traverseOpenApi3Dot2CallbackObjectJsonSchemas(
          componentsCallback,
          callback,
        );
      }
    }
  }

  if (openApi3Dot2ComponentsObject.headers !== undefined) {
    for (const componentsHeader of Object.values(
      openApi3Dot2ComponentsObject.headers,
    )) {
      // Consider OpenApi3Dot2HeaderObject as a superset of OpenApi3Dot2ReferenceObject
      traverseOpenApi3Dot2HeaderObjectJsonSchemas(componentsHeader, callback);
    }
  }

  if (openApi3Dot2ComponentsObject.parameters !== undefined) {
    for (const componentsParameter of Object.values(
      openApi3Dot2ComponentsObject.parameters,
    )) {
      if (isNotReferenceObject(componentsParameter)) {
        traverseOpenApi3Dot2ParameterObjectJsonSchemas(
          componentsParameter,
          callback,
        );
      }
    }
  }

  if (openApi3Dot2ComponentsObject.pathItems !== undefined) {
    for (const componentsPathItem of Object.values(
      openApi3Dot2ComponentsObject.pathItems,
    )) {
      // Consider OpenApi3Dot2PathItemObject as a superset of OpenApi3Dot2ReferenceObject
      traverseOpenApi3Dot2PathItemObjectJsonSchemas(
        componentsPathItem,
        callback,
      );
    }
  }

  if (openApi3Dot2ComponentsObject.requestBodies !== undefined) {
    for (const requestBody of Object.values(
      openApi3Dot2ComponentsObject.requestBodies,
    )) {
      if (isOpenApi3Dot2RequestBodyObject(requestBody)) {
        traverseOpenApi3Dot2RequestBodyObjectJsonSchemas(requestBody, callback);
      }
    }
  }

  if (openApi3Dot2ComponentsObject.responses !== undefined) {
    for (const response of Object.values(
      openApi3Dot2ComponentsObject.responses,
    )) {
      if (isNotReferenceObject(response)) {
        traverseOpenApi3Dot2ResponseObjectJsonSchemas(response, callback);
      }
    }
  }

  if (openApi3Dot2ComponentsObject.schemas !== undefined) {
    for (const schema of Object.values(openApi3Dot2ComponentsObject.schemas)) {
      const params: TraverseJsonSchemaParams = {
        jsonPointer: '',
        schema,
      };

      traverse(params, callback);
    }
  }
}

export function traverseOpenApi3Dot2ParameterObjectJsonSchemas(
  param: OpenApi3Dot2ParameterObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (param.content !== undefined) {
    for (const mediaTypeObject of Object.values(param.content)) {
      if (isNotReferenceObject(mediaTypeObject)) {
        traverseOpenApi3Dot2MediaTypeObjectJsonSchemas(
          mediaTypeObject,
          callback,
        );
      }
    }
  }

  if (param.schema !== undefined) {
    traverse({ jsonPointer: '', schema: param.schema }, callback);
  }
}

export function traverseOpenApi3Dot2RequestBodyObjectJsonSchemas(
  openApi3Dot2RequestBodyObject: OpenApi3Dot2RequestBodyObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  for (const mediaTypeObject of Object.values(
    openApi3Dot2RequestBodyObject.content,
  )) {
    if (isNotReferenceObject(mediaTypeObject)) {
      traverseOpenApi3Dot2MediaTypeObjectJsonSchemas(mediaTypeObject, callback);
    }
  }
}

export function traverseOpenApi3Dot2ResponseObjectJsonSchemas(
  openApi3Dot2ResponseBodyObject: OpenApi3Dot2ResponseObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot2ResponseBodyObject.content !== undefined) {
    for (const mediaTypeObject of Object.values(
      openApi3Dot2ResponseBodyObject.content,
    )) {
      if (isNotReferenceObject(mediaTypeObject)) {
        traverseOpenApi3Dot2MediaTypeObjectJsonSchemas(
          mediaTypeObject,
          callback,
        );
      }
    }
  }

  if (openApi3Dot2ResponseBodyObject.headers !== undefined) {
    for (const headerObject of Object.values(
      openApi3Dot2ResponseBodyObject.headers,
    )) {
      // Consider OpenApi3Dot2HeaderObject as a superset of OpenApi3Dot2ReferenceObject
      traverseOpenApi3Dot2HeaderObjectJsonSchemas(headerObject, callback);
    }
  }
}

export function traverseOpenApi3Dot2OperationObjectJsonSchemas(
  openApi3Dot2OperationObject: OpenApi3Dot2OperationObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot2OperationObject.callbacks !== undefined) {
    for (const operationCallback of Object.values(
      openApi3Dot2OperationObject.callbacks,
    )) {
      if (isNotReferenceObject(operationCallback)) {
        traverseOpenApi3Dot2CallbackObjectJsonSchemas(
          operationCallback,
          callback,
        );
      }
    }
  }

  if (openApi3Dot2OperationObject.parameters !== undefined) {
    for (const param of openApi3Dot2OperationObject.parameters) {
      if (isNotReferenceObject(param)) {
        traverseOpenApi3Dot2ParameterObjectJsonSchemas(param, callback);
      }
    }
  }

  if (
    isOpenApi3Dot2RequestBodyObject(openApi3Dot2OperationObject.requestBody)
  ) {
    traverseOpenApi3Dot2RequestBodyObjectJsonSchemas(
      openApi3Dot2OperationObject.requestBody,
      callback,
    );
  }

  if (openApi3Dot2OperationObject.responses !== undefined) {
    traverseOpenApi3Dot2ResponsesObjectJsonSchemas(
      openApi3Dot2OperationObject.responses,
      callback,
    );
  }
}

export function traverseOpenApi3Dot2ResponsesObjectJsonSchemas(
  openApi3Dot2ResponsesBodyObject: OpenApi3Dot2ResponsesObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  for (const responseObject of Object.values(openApi3Dot2ResponsesBodyObject)) {
    if (isNotReferenceObject(responseObject)) {
      traverseOpenApi3Dot2ResponseObjectJsonSchemas(responseObject, callback);
    }
  }
}

export function traverseOpenApi3Dot2PathItemObjectJsonSchemas(
  openApi3Dot2PathItemObject: OpenApi3Dot2PathItemObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  const handlers: Partial<
    Record<
      keyof OpenApi3Dot2PathItemObject,
      (
        openApi3Dot2PathItemObject: OpenApi3Dot2OperationObject,
        callback: (params: TraverseJsonSchemaCallbackParams) => void,
      ) => void
    >
  > = {
    delete: traverseOpenApi3Dot2OperationObjectJsonSchemas,
    get: traverseOpenApi3Dot2OperationObjectJsonSchemas,
    head: traverseOpenApi3Dot2OperationObjectJsonSchemas,
    options: traverseOpenApi3Dot2OperationObjectJsonSchemas,
    patch: traverseOpenApi3Dot2OperationObjectJsonSchemas,
    post: traverseOpenApi3Dot2OperationObjectJsonSchemas,
    put: traverseOpenApi3Dot2OperationObjectJsonSchemas,
    query: traverseOpenApi3Dot2OperationObjectJsonSchemas,
    trace: traverseOpenApi3Dot2OperationObjectJsonSchemas,
  };

  if (openApi3Dot2PathItemObject.additionalOperations !== undefined) {
    for (const additionalOperation of Object.values(
      openApi3Dot2PathItemObject.additionalOperations,
    )) {
      traverseOpenApi3Dot2OperationObjectJsonSchemas(
        additionalOperation,
        callback,
      );
    }
  }

  if (openApi3Dot2PathItemObject.parameters !== undefined) {
    for (const param of openApi3Dot2PathItemObject.parameters) {
      if (isNotReferenceObject(param)) {
        traverseOpenApi3Dot2ParameterObjectJsonSchemas(param, callback);
      }
    }
  }

  for (const key of Object.keys(
    openApi3Dot2PathItemObject,
  ) as (keyof OpenApi3Dot2PathItemObject)[]) {
    const handler:
      | ((
          openApi3Dot2PathItemObject: OpenApi3Dot2OperationObject,
          callback: (params: TraverseJsonSchemaCallbackParams) => void,
        ) => void)
      | undefined = handlers[key];

    if (handler !== undefined) {
      handler(
        openApi3Dot2PathItemObject[key] as OpenApi3Dot2OperationObject,
        callback,
      );
    }
  }
}

export function traverseOpenApi3Dot2CallbackObjectJsonSchemas(
  openApi3Dot2CallbackObject: OpenApi3Dot2CallbackObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  for (const pathItem of Object.values(openApi3Dot2CallbackObject)) {
    // Consider OpenApi3Dot2PathItemObject as a superset of OpenApi3Dot2ReferenceObject
    traverseOpenApi3Dot2PathItemObjectJsonSchemas(pathItem, callback);
  }
}

export function traverseOpenApi3Dot2PathsObjectJsonSchemas(
  openApi3Dot2PathsObject: OpenApi3Dot2PathsObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  for (const pathItem of Object.values(openApi3Dot2PathsObject)) {
    // Consider OpenApi3Dot2PathItemObject as a superset of OpenApi3Dot2ReferenceObject
    traverseOpenApi3Dot2PathItemObjectJsonSchemas(pathItem, callback);
  }
}

function isNotReferenceObject<T>(
  value: T | OpenApi3Dot2ReferenceObject,
): value is T {
  return (value as Partial<OpenApi3Dot2ReferenceObject>).$ref === undefined;
}

function isOpenApi3Dot2RequestBodyObject(
  openApi3Dot2RequestBodyOrReferenceObject:
    | OpenApi3Dot2RequestBodyObject
    | OpenApi3Dot2ReferenceObject
    | undefined,
): openApi3Dot2RequestBodyOrReferenceObject is OpenApi3Dot2RequestBodyObject {
  return (
    openApi3Dot2RequestBodyOrReferenceObject !== undefined &&
    (
      openApi3Dot2RequestBodyOrReferenceObject as Partial<OpenApi3Dot2RequestBodyObject>
    ).content !== undefined
  );
}
