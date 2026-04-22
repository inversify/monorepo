import {
  buildNormalizedPath,
  type ControllerMetadata,
  type ControllerMethodMetadata,
  getControllerMetadataList,
  getControllerMethodMetadataList,
  RequestMethodType,
} from '@inversifyjs/http-core';
import { escapeJsonPointerFragments } from '@inversifyjs/json-schema-pointer';
import { type Logger } from '@inversifyjs/logger';
import {
  type OpenApi3Dot2Object,
  type OpenApi3Dot2OperationObject,
  type OpenApi3Dot2PathItemObject,
  type OpenApi3Dot2SchemaObject,
} from '@inversifyjs/open-api-types/v3Dot2';
import { getOwnReflectMetadata } from '@inversifyjs/reflect-metadata-utils';
import { type Container, type Newable } from 'inversify';

import { type FilteredByValueType } from '../../../common/models/FilteredByValueType.js';
import { mergeOpenApiPathItemObjectIntoOpenApiPaths } from '../../../metadata/actions/v3Dot2/mergeOpenApiPathItemObjectIntoOpenApiPaths.js';
import { type ControllerOpenApiMetadata } from '../../../metadata/models/v3Dot2/ControllerOpenApiMetadata.js';
import { controllerOpenApiMetadataReflectKey } from '../../../reflectMetadata/data/v3Dot2/controllerOpenApiMetadataReflectKey.js';
import { mergeOpenApiTypeSchema } from '../../actions/v3Dot2/mergeOpenApiTypeSchema.js';
import { tryBuildOperationFromPath } from '../../calculations/buildOperationFromPath.js';
import { buildSwaggerUiController } from '../../calculations/buildSwaggerUiController.js';
import { resolveLogger } from '../../calculations/resolveLogger.js';
import { type BaseSwaggerUiController } from '../../controllers/BaseSwagggerUiController.js';
import { type SwaggerUiProviderOptions } from '../../models/v3Dot2/SwaggerUiProviderOptions.js';

type OpenApi3Dot2PathItemObjectMethodKeys = keyof FilteredByValueType<
  OpenApi3Dot2PathItemObject,
  OpenApi3Dot2OperationObject
>;

const METHOD_TO_PATH_ITEM_OPERATION_KEYS_MAP: {
  [key in RequestMethodType]: OpenApi3Dot2PathItemObjectMethodKeys[];
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
  readonly #logger: Logger | undefined;
  readonly #options: SwaggerUiProviderOptions;

  #provided: boolean;

  constructor(options: SwaggerUiProviderOptions) {
    this.#logger = resolveLogger(options.logger);
    this.#options = options;
    this.#provided = false;
  }

  public get openApiObject(): OpenApi3Dot2Object {
    if (!this.#provided) {
      throw new Error(
        'Cannot get OpenAPI object before providing docs, consider calling provide() first',
      );
    }

    return this.#options.api.openApiObject;
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

    const controllerType: Newable<BaseSwaggerUiController<OpenApi3Dot2Object>> =
      this.#buildControllerType(this.#options);

    container.bind(controllerType).toSelf();

    this.#provided = true;
  }

  #buildControllerType(
    options: SwaggerUiProviderOptions,
  ): Newable<BaseSwaggerUiController<OpenApi3Dot2Object>> {
    return buildSwaggerUiController(options);
  }

  #buildOpenApiObjectFromPathItemTupleList(
    object: OpenApi3Dot2Object,
    pathItemTupleList: [string, OpenApi3Dot2PathItemObject][],
  ): void {
    let openApi3Dot2Object: OpenApi3Dot2Object = object;

    for (const [path, pathItemObject] of pathItemTupleList) {
      openApi3Dot2Object = mergeOpenApiPathItemObjectIntoOpenApiPaths(
        openApi3Dot2Object,
        path,
        pathItemObject,
      );
    }
  }

  #buildOpenApiPathItemTupleList(
    metadataTupleList: MetadataTuple[],
  ): [string, OpenApi3Dot2PathItemObject][] {
    const pathToPathItemObjectMap: Map<string, OpenApi3Dot2PathItemObject> =
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
    object: OpenApi3Dot2Object,
    metadataTupleList: MetadataTuple[],
  ): void {
    let objectSchemas: Record<string, OpenApi3Dot2SchemaObject> | undefined =
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
    pathToPathItemObjectMap: Map<string, OpenApi3Dot2PathItemObject>,
    path: string,
  ): OpenApi3Dot2PathItemObject {
    let openApi3Dot2PathItemObject: OpenApi3Dot2PathItemObject | undefined =
      pathToPathItemObjectMap.get(path);

    if (openApi3Dot2PathItemObject === undefined) {
      openApi3Dot2PathItemObject = {};
      pathToPathItemObjectMap.set(path, openApi3Dot2PathItemObject);
    }

    return openApi3Dot2PathItemObject;
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
    pathToPathItemObjectMap: Map<string, OpenApi3Dot2PathItemObject>,
  ): void {
    const operationObject: OpenApi3Dot2PathItemObject | undefined =
      controllerOpenApiMetadata.methodToOperationObjectMap.get(
        methodMetadata.methodKey,
      );

    if (operationObject !== undefined) {
      const normalizedPath: string = buildNormalizedPath(
        `${controllerMetadata.path}/${methodMetadata.path}`,
      );

      const path: string | undefined =
        tryBuildOperationFromPath(normalizedPath);

      if (path === undefined) {
        this.#logger?.warn(
          `Skipping metadata for path ${normalizedPath}. The framework-level wildcard segment (*) has no equivalent in OpenAPI path templates, therefore metadata is skipped`,
        );
      } else {
        const openApi3Dot2PathItemObject: OpenApi3Dot2PathItemObject =
          this.#buildOrGetPathItemObject(pathToPathItemObjectMap, path);

        if (controllerOpenApiMetadata.servers !== undefined) {
          openApi3Dot2PathItemObject.servers = [
            ...controllerOpenApiMetadata.servers,
          ];
        }

        if (controllerOpenApiMetadata.summary !== undefined) {
          openApi3Dot2PathItemObject.summary =
            controllerOpenApiMetadata.summary;
        }

        this.#setPathItemObjectOperations(
          openApi3Dot2PathItemObject,
          methodMetadata.requestMethodType,
          operationObject,
          path,
        );
      }
    }
  }

  #setPathItemObjectOperations(
    openApi3Dot2PathItemObject: OpenApi3Dot2PathItemObject,
    requestMethodType: RequestMethodType,
    operationObject: OpenApi3Dot2OperationObject,
    path: string,
  ): void {
    const keys: OpenApi3Dot2PathItemObjectMethodKeys[] =
      METHOD_TO_PATH_ITEM_OPERATION_KEYS_MAP[requestMethodType];

    for (const key of keys) {
      if (openApi3Dot2PathItemObject[key] !== undefined) {
        const schemaPath: string = escapeJsonPointerFragments(
          'paths',
          path,
          key,
        );
        throw new Error(
          `Duplicated metadata found for operation at #/${schemaPath}`,
        );
      }

      openApi3Dot2PathItemObject[key] = operationObject;
    }
  }
}
