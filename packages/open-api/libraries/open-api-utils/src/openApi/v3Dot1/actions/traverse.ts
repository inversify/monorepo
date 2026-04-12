import {
  traverse,
  type TraverseJsonSchemaCallbackParams,
  type TraverseJsonSchemaParams,
} from '@inversifyjs/json-schema-utils/2020-12';
import {
  type HttpStatusCode,
  type HttpStatusCodeWildCard,
  type OpenApi3Dot1CallbackObject,
  type OpenApi3Dot1ComponentsObject,
  type OpenApi3Dot1MediaTypeObject,
  type OpenApi3Dot1Object,
  type OpenApi3Dot1OperationObject,
  type OpenApi3Dot1PathItemObject,
  type OpenApi3Dot1PathsObject,
  type OpenApi3Dot1ReferenceObject,
  type OpenApi3Dot1RequestBodyObject,
  type OpenApi3Dot1ResponseObject,
  type OpenApi3Dot1ResponsesObject,
  type OpenApi3Dot1SchemaObject,
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
    for (const key of Object.keys(openApiObject.webhooks)) {
      // Consider OpenApi3Dot1PathItemObject as a superset of OpenApi3Dot1ReferenceObject
      traverseOpenApi3Dot1PathItemObjectJsonSchemas(
        openApiObject.webhooks[key] as OpenApi3Dot1PathItemObject,
        callback,
      );
    }
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
    for (const key of Object.keys(openApi3Dot1ComponentsObject.callbacks)) {
      const openApi3Dot1CallbackOrReferenceObject:
        | OpenApi3Dot1CallbackObject
        | OpenApi3Dot1ReferenceObject
        | undefined = openApi3Dot1ComponentsObject.callbacks[key];

      if (isOpenApi3Dot1CallbackObject(openApi3Dot1CallbackOrReferenceObject)) {
        traverseOpenApi3Dot1CallbackObjectJsonSchemas(
          openApi3Dot1CallbackOrReferenceObject,
          callback,
        );
      }
    }
  }

  if (openApi3Dot1ComponentsObject.pathItems !== undefined) {
    for (const key of Object.keys(openApi3Dot1ComponentsObject.pathItems)) {
      // Consider OpenApi3Dot1PathItemObject as a superset of OpenApi3Dot1ReferenceObject
      traverseOpenApi3Dot1PathItemObjectJsonSchemas(
        openApi3Dot1ComponentsObject.pathItems[
          key
        ] as OpenApi3Dot1PathItemObject,
        callback,
      );
    }
  }

  if (openApi3Dot1ComponentsObject.requestBodies !== undefined) {
    for (const key of Object.keys(openApi3Dot1ComponentsObject.requestBodies)) {
      const requestBody:
        | OpenApi3Dot1RequestBodyObject
        | OpenApi3Dot1ReferenceObject
        | undefined = openApi3Dot1ComponentsObject.requestBodies[key];

      if (isOpenApi3Dot1RequestBodyObject(requestBody)) {
        traverseOpenApi3Dot1RequestBodyObjectJsonSchemas(requestBody, callback);
      }
    }
  }

  if (openApi3Dot1ComponentsObject.schemas !== undefined) {
    for (const key of Object.keys(openApi3Dot1ComponentsObject.schemas)) {
      const params: TraverseJsonSchemaParams = {
        jsonPointer: '',
        schema: openApi3Dot1ComponentsObject.schemas[
          key
        ] as OpenApi3Dot1SchemaObject,
      };

      traverse(params, callback);
    }
  }
}

export function traverseOpenApi3Dot1RequestBodyObjectJsonSchemas(
  openApi3Dot1RequestBodyObject: OpenApi3Dot1RequestBodyObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  for (const key of Object.keys(openApi3Dot1RequestBodyObject.content)) {
    traverseOpenApi3Dot1MediaTypeObjectJsonSchemas(
      openApi3Dot1RequestBodyObject.content[key] as OpenApi3Dot1MediaTypeObject,
      callback,
    );
  }
}

export function traverseOpenApi3Dot1ResponseObjectJsonSchemas(
  openApi3Dot1ResponseBodyObject: OpenApi3Dot1ResponseObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot1ResponseBodyObject.content !== undefined) {
    for (const key of Object.keys(openApi3Dot1ResponseBodyObject.content)) {
      traverseOpenApi3Dot1MediaTypeObjectJsonSchemas(
        openApi3Dot1ResponseBodyObject.content[
          key
        ] as OpenApi3Dot1MediaTypeObject,
        callback,
      );
    }
  }
}

export function traverseOpenApi3Dot1OperationObjectJsonSchemas(
  openApi3Dot1OperationObject: OpenApi3Dot1OperationObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot1OperationObject.callbacks !== undefined) {
    for (const key of Object.keys(openApi3Dot1OperationObject.callbacks)) {
      const openApi3Dot1CallbackOrReferenceObject:
        | OpenApi3Dot1CallbackObject
        | OpenApi3Dot1ReferenceObject
        | undefined = openApi3Dot1OperationObject.callbacks[key];

      if (isOpenApi3Dot1CallbackObject(openApi3Dot1CallbackOrReferenceObject)) {
        traverseOpenApi3Dot1CallbackObjectJsonSchemas(
          openApi3Dot1CallbackOrReferenceObject,
          callback,
        );
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
  openApi3Dot1ResponsesBodyObject: OpenApi3Dot1ResponsesObject | undefined,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  if (openApi3Dot1ResponsesBodyObject !== undefined) {
    for (const key of Object.keys(openApi3Dot1ResponsesBodyObject) as (
      | HttpStatusCode
      | HttpStatusCodeWildCard
    )[]) {
      traverseOpenApi3Dot1ResponseObjectJsonSchemas(
        openApi3Dot1ResponsesBodyObject[key] as OpenApi3Dot1ResponseObject,
        callback,
      );
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
  for (const key of Object.keys(openApi3Dot1CallbackObject)) {
    // Consider OpenApi3Dot1PathItemObject as a superset of OpenApi3Dot1ReferenceObject
    traverseOpenApi3Dot1PathItemObjectJsonSchemas(
      openApi3Dot1CallbackObject[key] as OpenApi3Dot1PathItemObject,
      callback,
    );
  }
}

export function traverseOpenApi3Dot1PathsObjectJsonSchemas(
  openApi3Dot1PathsObject: OpenApi3Dot1PathsObject,
  callback: (params: TraverseJsonSchemaCallbackParams) => void,
): void {
  for (const key of Object.keys(openApi3Dot1PathsObject)) {
    // Consider OpenApi3Dot1PathItemObject as a superset of OpenApi3Dot1ReferenceObject
    traverseOpenApi3Dot1PathItemObjectJsonSchemas(
      openApi3Dot1PathsObject[key] as OpenApi3Dot1PathItemObject,
      callback,
    );
  }
}

function isOpenApi3Dot1CallbackObject(
  openApi3Dot1CallbackObject:
    | OpenApi3Dot1CallbackObject
    | OpenApi3Dot1ReferenceObject
    | undefined,
): openApi3Dot1CallbackObject is OpenApi3Dot1CallbackObject {
  return (
    openApi3Dot1CallbackObject !== undefined &&
    typeof openApi3Dot1CallbackObject.$ref !== 'string'
  );
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
