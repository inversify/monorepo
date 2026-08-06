import { type HttpAdapter } from '../../models/HttpAdapter.js';
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
): ComposedScaffoldDependencies {
  const adapterDependencySpec: AdapterDependencySpec =
    HTTP_ADAPTER_DEPENDENCY_SPECS[httpAdapter];

  const dependencyNames: string[] = [
    ...BASE_DEPENDENCY_NAMES,
    ...adapterDependencySpec.dependencies,
  ];
  const devDependencyNames: string[] = [
    ...BASE_DEV_DEPENDENCY_NAMES,
    ...(adapterDependencySpec.devDependencies ?? []),
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
