import { DB_ADAPTER_DEPENDENCY_SPECS } from '../../dependencies/models/DbAdapterDependencySpecs.js';
import { HTTP_ADAPTER_DEPENDENCY_SPECS } from '../../dependencies/models/HttpAdapterDependencySpecs.js';
import { type DbAdapter } from '../../models/DbAdapter.js';
import { type HttpAdapter } from '../../models/HttpAdapter.js';
import { type YarnRcSourceModel } from '../models/YarnRcSourceModel.js';

export function createYarnRcSourceModel(
  httpAdapter: HttpAdapter,
  dbAdapter: DbAdapter,
): YarnRcSourceModel {
  const builtDependencyNames: string[] = [
    ...new Set<string>([
      ...(HTTP_ADAPTER_DEPENDENCY_SPECS[httpAdapter].builtDependencies ?? []),
      ...(DB_ADAPTER_DEPENDENCY_SPECS[dbAdapter].builtDependencies ?? []),
    ]),
  ].sort((leftPackageName: string, rightPackageName: string) =>
    leftPackageName.localeCompare(rightPackageName),
  );

  const dependenciesMeta: Record<string, { built: true }> = {};

  for (const packageName of builtDependencyNames) {
    dependenciesMeta[packageName] = {
      built: true,
    };
  }

  return {
    dependenciesMeta,
  };
}
