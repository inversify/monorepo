import { ApiStyle } from '../../models/ApiStyle.js';
import { HttpAdapter } from '../../models/HttpAdapter.js';
import { type PnpmWorkspaceSourceModel } from '../models/PnpmWorkspaceSourceModel.js';

const BASE_ALLOW_BUILDS: Readonly<Record<string, boolean>> = {
  '@prisma/engines': true,
  '@scarf/scarf': true,
  prisma: true,
};

export function createPnpmWorkspaceSourceModel(
  httpAdapter: HttpAdapter,
  apiStyle: ApiStyle,
): PnpmWorkspaceSourceModel {
  return {
    allowBuilds: {
      ...BASE_ALLOW_BUILDS,
      ...(apiStyle === ApiStyle.schemaFirst
        ? {
            esbuild: true,
          }
        : {}),
    },
    ...(httpAdapter === HttpAdapter.uwebsockets
      ? {
          // uWebSockets.js is resolved via git under @inversifyjs/http-uwebsockets.
          blockExoticSubdeps: false,
        }
      : {}),
  };
}
