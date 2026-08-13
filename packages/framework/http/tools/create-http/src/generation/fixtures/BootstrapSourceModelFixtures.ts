import { HttpAdapter } from '../../models/HttpAdapter.js';
import { createBootstrapSourceModel } from '../calculations/createBootstrapSourceModel.js';
import { type BootstrapSourceModel } from '../models/BootstrapSourceModel.js';

export class BootstrapSourceModelFixtures {
  public static get withHttpAdapterExpress(): BootstrapSourceModel {
    return createBootstrapSourceModel(HttpAdapter.express);
  }

  public static get withHttpAdapterFastify(): BootstrapSourceModel {
    return createBootstrapSourceModel(HttpAdapter.fastify);
  }

  public static get withHttpAdapterHono(): BootstrapSourceModel {
    return createBootstrapSourceModel(HttpAdapter.hono);
  }

  public static get withHttpAdapterUwebsockets(): BootstrapSourceModel {
    return createBootstrapSourceModel(HttpAdapter.uwebsockets);
  }

  public static get withUseCaseExtraInitializeContainerBodyStatements(): BootstrapSourceModel {
    return {
      adapter: BootstrapSourceModelFixtures.withHttpAdapterExpress.adapter,
      applicationType: 'express.Application',
      imports: [
        {
          moduleSpecifier: 'inversify',
          namedImports: [{ name: 'Container' }],
        },
      ],
      initializeContainerBodyStatements: [
        'container.load(new UserContainerModule());',
      ],
      listenStatements: ['app.listen(PORT);'],
    };
  }
}
