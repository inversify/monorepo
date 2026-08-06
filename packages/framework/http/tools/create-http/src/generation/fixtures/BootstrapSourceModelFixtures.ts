import { createBootstrapSourceModel } from '../calculations/createBootstrapSourceModel.js';
import { type BootstrapSourceModel } from '../models/BootstrapSourceModel.js';

export class BootstrapSourceModelFixtures {
  public static get withHttpAdapterExpress(): BootstrapSourceModel {
    return createBootstrapSourceModel('express');
  }

  public static get withHttpAdapterFastify(): BootstrapSourceModel {
    return createBootstrapSourceModel('fastify');
  }

  public static get withHttpAdapterHono(): BootstrapSourceModel {
    return createBootstrapSourceModel('hono');
  }

  public static get withHttpAdapterUwebsockets(): BootstrapSourceModel {
    return createBootstrapSourceModel('uwebsockets');
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
