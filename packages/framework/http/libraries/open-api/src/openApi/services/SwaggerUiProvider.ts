import {
  buildNormalizedPath,
  ControllerMetadata,
  ControllerMethodMetadata,
  getControllerMetadataList,
  getControllerMethodMetadataList,
  RequestMethodType,
} from '@inversifyjs/http-core';
import {
  OpenApi3Dot1Object,
  OpenApi3Dot1OperationObject,
  OpenApi3Dot1PathItemObject,
  OpenApi3Dot1SchemaObject,
} from '@inversifyjs/open-api-types/v3Dot1';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { Container, Newable } from 'inversify';

import { FilteredByValueType } from '../../common/models/FilteredByValueType';
import { mergeOpenApiPathItemObjectIntoOpenApiPaths } from '../../metadata/actions/mergeOpenApiPathItemObjectIntoOpenApiPaths';
import { ControllerOpenApiMetadata } from '../../metadata/models/ControllerOpenApiMetadata';
import { controllerOpenApiMetadataReflectKey } from '../../reflectMetadata/data/controllerOpenApiMetadataReflectKey';
import { mergeOpenApiTypeSchema } from '../actions/mergeOpenApiTypeSchema';
import { buildSwaggerUiController } from '../calculations/buildSwaggerUiController';
import { BaseSwaggerUiController } from '../controllers/BaseSwagggerUiController';
import { SwaggerUiProviderOptions } from '../models/SwaggerUiProviderOptions';

type OpenApi3Dot1PathItemObjectMethodKeys = keyof FilteredByValueType<
  OpenApi3Dot1PathItemObject,
  OpenApi3Dot1OperationObject
>;

const METHOD_TO_PATH_ITEM_OPERATION_KEYS_MAP: {
  [key in RequestMethodType]: OpenApi3Dot1PathItemObjectMethodKeys[];
} = {
  [RequestMethodType.All]: [
    'delete',
    'get',
    'head',
    'options',
    'patch',
    'post',
    'put',
  ],
  [RequestMethodType.Delete]: ['delete'],
  [RequestMethodType.Get]: ['get'],
  [RequestMethodType.Head]: ['head'],
  [RequestMethodType.Options]: ['options'],
  [RequestMethodType.Patch]: ['patch'],
  [RequestMethodType.Post]: ['post'],
  [RequestMethodType.Put]: ['put'],
};

type MetadataTuple = [
  ControllerMetadata,
  ControllerOpenApiMetadata | undefined,
  ControllerMethodMetadata[],
];

export class SwaggerUiProvider {
  readonly #options: SwaggerUiProviderOptions;

  #provided: boolean;

  constructor(options: SwaggerUiProviderOptions) {
    this.#options = options;
    this.#provided = false;
  }

  public provide(container: Container): void {
    if (this.#provided) {
      throw new Error('Cannot provide docs more than once');
    }

    const metadataTuple: MetadataTuple[] =
      this.#getMetadataTupleList(container);

    this.#buildOpenApiObjectFromPathItemTupleList(
      this.#options.api.openApiObject,
      this.#buildOpenApiPathItemTupleList(metadataTuple),
    );

    this.#buildOpenApiReferencedSchemasFromMetadataTupleList(
      this.#options.api.openApiObject,
      metadataTuple,
    );

    const controllerType: Newable<BaseSwaggerUiController> =
      this.#buildControllerType(this.#options);

    container.bind(controllerType).toSelf();

    this.#provided = true;
  }

  #buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController> {
    return buildSwaggerUiController(options);
  }

  #buildOpenApiObjectFromPathItemTupleList(
    object: OpenApi3Dot1Object,
    pathItemTupleList: [string, OpenApi3Dot1PathItemObject][],
  ): void {
    let openApi3Dot1Object: OpenApi3Dot1Object = object;

    for (const [path, pathItemObject] of pathItemTupleList) {
      openApi3Dot1Object = mergeOpenApiPathItemObjectIntoOpenApiPaths(
        openApi3Dot1Object,
        path,
        pathItemObject,
      );
    }
  }

  #buildOpenApiPathItemTupleList(
    metadataTupleList: MetadataTuple[],
  ): [string, OpenApi3Dot1PathItemObject][] {
    const pathToPathItemObjectMap: Map<string, OpenApi3Dot1PathItemObject> =
      new Map();

    for (const metadataTuple of metadataTupleList) {
      const [
        controllerMetadata,
        controllerOpenApiMetadata,
        methodMetadataList,
      ]: MetadataTuple = metadataTuple;

      if (controllerOpenApiMetadata !== undefined) {
        for (const methodMetadata of methodMetadataList) {
          this.#setMethodPathItemObject(
            controllerMetadata,
            controllerOpenApiMetadata,
            methodMetadata,
            pathToPathItemObjectMap,
          );
        }
      }
    }

    return [...pathToPathItemObjectMap.entries()];
  }

  #buildOpenApiReferencedSchemasFromMetadataTupleList(
    object: OpenApi3Dot1Object,
    metadataTupleList: MetadataTuple[],
  ): void {
    let objectSchemas: Record<string, OpenApi3Dot1SchemaObject> | undefined =
      object.components?.schemas;

    if (objectSchemas === undefined) {
      objectSchemas = {};

      if (object.components === undefined) {
        object.components = {};
      }

      object.components.schemas = objectSchemas;
    }

    for (const [, controllerOpenApiMetadata] of metadataTupleList) {
      if (controllerOpenApiMetadata !== undefined) {
        for (const type of controllerOpenApiMetadata.references) {
          mergeOpenApiTypeSchema(objectSchemas, type);
        }
      }
    }
  }

  #buildOrGetPathItemObject(
    pathToPathItemObjectMap: Map<string, OpenApi3Dot1PathItemObject>,
    path: string,
  ): OpenApi3Dot1PathItemObject {
    let openApi3Dot1PathItemObject: OpenApi3Dot1PathItemObject | undefined =
      pathToPathItemObjectMap.get(path);

    if (openApi3Dot1PathItemObject === undefined) {
      openApi3Dot1PathItemObject = {};
      pathToPathItemObjectMap.set(path, openApi3Dot1PathItemObject);
    }

    return openApi3Dot1PathItemObject;
  }

  #getMetadataTupleList(container: Container): MetadataTuple[] {
    const metadataTupleList: MetadataTuple[] = [];

    const controllerMetadataList: ControllerMetadata[] | undefined =
      getControllerMetadataList();

    if (controllerMetadataList !== undefined) {
      const filteredControllerMetadata: ControllerMetadata[] =
        controllerMetadataList.filter(
          (controllerMetadata: ControllerMetadata): boolean =>
            container.isBound(controllerMetadata.serviceIdentifier),
        );

      for (const controllerMetadata of filteredControllerMetadata) {
        const methodMetadata: ControllerMethodMetadata[] =
          getControllerMethodMetadataList(controllerMetadata.target);

        metadataTupleList.push([
          controllerMetadata,
          getOwnReflectMetadata<ControllerOpenApiMetadata>(
            controllerMetadata.target,
            controllerOpenApiMetadataReflectKey,
          ),
          methodMetadata,
        ]);
      }
    }

    return metadataTupleList;
  }

  #setMethodPathItemObject(
    controllerMetadata: ControllerMetadata,
    controllerOpenApiMetadata: ControllerOpenApiMetadata,
    methodMetadata: ControllerMethodMetadata,
    pathToPathItemObjectMap: Map<string, OpenApi3Dot1PathItemObject>,
  ): void {
    const operationObject: OpenApi3Dot1PathItemObject | undefined =
      controllerOpenApiMetadata.methodToPathItemObjectMap.get(
        methodMetadata.methodKey,
      );

    if (operationObject !== undefined) {
      const path: string = buildNormalizedPath(
        `${controllerMetadata.path}/${methodMetadata.path}`,
      );

      const openApi3Dot1PathItemObject: OpenApi3Dot1PathItemObject =
        this.#buildOrGetPathItemObject(pathToPathItemObjectMap, path);

      if (controllerOpenApiMetadata.summary !== undefined) {
        openApi3Dot1PathItemObject.summary = controllerOpenApiMetadata.summary;
      }

      this.#setPathItemObjectOperations(
        openApi3Dot1PathItemObject,
        methodMetadata.requestMethodType,
        operationObject,
        path,
      );
    }
  }

  #setPathItemObjectOperations(
    openApi3Dot1PathItemObject: OpenApi3Dot1PathItemObject,
    requestMethodType: RequestMethodType,
    operationObject: OpenApi3Dot1OperationObject,
    path: string,
  ): void {
    const keys: OpenApi3Dot1PathItemObjectMethodKeys[] =
      METHOD_TO_PATH_ITEM_OPERATION_KEYS_MAP[requestMethodType];

    for (const key of keys) {
      if (openApi3Dot1PathItemObject[key] !== undefined) {
        // TODO: Add json-pointer package to properly escape pointer segments
        throw new Error(
          `Duplicated metadata found for operation at #/paths/${path}/${key}`,
        );
      }

      openApi3Dot1PathItemObject[key] = operationObject;
    }
  }
}
