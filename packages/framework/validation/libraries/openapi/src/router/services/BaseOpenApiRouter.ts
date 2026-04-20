import { buildRouterNode } from '../calculations/buildRouterNode.js';
import { findRoute } from '../calculations/findRoute.js';
import { type RouterNode } from '../models/RouterNode.js';
import { type OpenApiRouter } from './OpenApiRouter.js';

export class BaseOpenApiRouter<TOpenApiObject> implements OpenApiRouter {
  protected readonly _openApiObject: TOpenApiObject;

  readonly #methodToRouterNodeObject: Record<string, RouterNode>;

  constructor(
    openApiObject: TOpenApiObject,
    extractMethodToRoutesObject: (
      openApiObject: TOpenApiObject,
    ) => Record<string, string[]>,
  ) {
    this._openApiObject = openApiObject;

    const methodToRoutesObject: Record<string, string[]> =
      extractMethodToRoutesObject(openApiObject);

    this.#methodToRouterNodeObject = {};

    this.#populateMethodToRouterNodeObject(methodToRoutesObject);
  }

  public findRoute(method: string, path: string): string | undefined {
    const routerNode: RouterNode | undefined =
      this.#methodToRouterNodeObject[method];

    if (routerNode === undefined) {
      return undefined;
    }

    return findRoute(routerNode, path);
  }

  #populateMethodToRouterNodeObject(
    methodToRoutesObject: Record<string, string[]>,
  ): void {
    for (const [method, routes] of Object.entries(methodToRoutesObject)) {
      this.#methodToRouterNodeObject[method] = buildRouterNode(routes);
    }
  }
}
