import { type HttpAdapter } from '../../models/HttpAdapter.js';
import { type BootstrapSourceModel } from '../models/BootstrapSourceModel.js';
import {
  HTTP_ADAPTER_BOOTSTRAP_SPECS,
  type HttpAdapterBootstrapSpec,
} from '../models/HttpAdapterBootstrapSpecs.js';

export function createBootstrapSourceModel(
  httpAdapter: HttpAdapter,
): BootstrapSourceModel {
  const bootstrapSpec: HttpAdapterBootstrapSpec =
    HTTP_ADAPTER_BOOTSTRAP_SPECS[httpAdapter];

  return {
    adapter: {
      className: bootstrapSpec.adapterClassName,
      optionsObjectLiteral: bootstrapSpec.adapterOptionsObjectLiteral,
    },
    ...(bootstrapSpec.applicationType === undefined
      ? {}
      : { applicationType: bootstrapSpec.applicationType }),
    imports: [
      {
        moduleSpecifier: bootstrapSpec.adapterModuleSpecifier,
        namedImports: [{ name: bootstrapSpec.adapterClassName }],
      },
      ...(bootstrapSpec.extraImports ?? []),
      {
        moduleSpecifier: 'inversify',
        namedImports: [{ name: 'Container' }],
      },
    ],
    listenStatements: bootstrapSpec.listenStatements,
  };
}
