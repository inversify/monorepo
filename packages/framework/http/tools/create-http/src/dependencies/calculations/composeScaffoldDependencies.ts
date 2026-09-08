import { type ApiStyle } from '../../models/ApiStyle.js';
import { type DbAdapter } from '../../models/DbAdapter.js';
import { type HttpAdapter } from '../../models/HttpAdapter.js';
import { API_STYLE_DEPENDENCY_SPECS } from '../models/ApiStyleDependencySpecs.js';
import { DB_ADAPTER_DEPENDENCY_SPECS } from '../models/DbAdapterDependencySpecs.js';
import { type DependencyCatalog } from '../models/DependencyCatalog.js';
import {
  type AdapterDependencySpec,
  BASE_DEPENDENCY_NAMES,
  BASE_DEV_DEPENDENCY_NAMES,
  HTTP_ADAPTER_DEPENDENCY_SPECS,
} from '../models/HttpAdapterDependencySpecs.js';
import {
  mergeDependencyRecords,
  pickCatalogVersions,
} from './dependencyCatalogUtils.js';

export interface ComposedScaffoldDependencies {
  dependencies: Record<string, string>;
  devDependencies: Record<string, string>;
}

export function composeScaffoldDependencies(
  catalog: DependencyCatalog,
  httpAdapter: HttpAdapter,
  dbAdapter: DbAdapter,
  apiStyle: ApiStyle,
): ComposedScaffoldDependencies {
  const httpAdapterDependencySpec: AdapterDependencySpec =
    HTTP_ADAPTER_DEPENDENCY_SPECS[httpAdapter];
  const dbAdapterDependencySpec: AdapterDependencySpec =
    DB_ADAPTER_DEPENDENCY_SPECS[dbAdapter];
  const apiStyleDependencySpec: AdapterDependencySpec =
    API_STYLE_DEPENDENCY_SPECS[apiStyle];

  const dependencyNames: string[] = [
    ...BASE_DEPENDENCY_NAMES,
    ...httpAdapterDependencySpec.dependencies,
    ...dbAdapterDependencySpec.dependencies,
    ...apiStyleDependencySpec.dependencies,
  ];
  const devDependencyNames: string[] = [
    ...BASE_DEV_DEPENDENCY_NAMES,
    ...(httpAdapterDependencySpec.devDependencies ?? []),
    ...(dbAdapterDependencySpec.devDependencies ?? []),
    ...(apiStyleDependencySpec.devDependencies ?? []),
  ];

  return {
    dependencies: mergeDependencyRecords(
      pickCatalogVersions(catalog.dependencies, dependencyNames),
    ),
    devDependencies: mergeDependencyRecords(
      pickCatalogVersions(catalog.devDependencies, devDependencyNames),
    ),
  };
}
