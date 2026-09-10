import { ApiStyle } from '../../models/ApiStyle.js';
import { HttpAdapter } from '../../models/HttpAdapter.js';
import { createTodoControllerSourceModel } from '../calculations/createTodoControllerSourceModel.js';
import { type TodoControllerSourceModel } from '../models/TodoControllerSourceModel.js';

export class TodoControllerSourceModelFixtures {
  public static get withHttpAdapterExpress(): TodoControllerSourceModel {
    return createTodoControllerSourceModel(
      HttpAdapter.express,
      ApiStyle.codeFirst,
    );
  }

  public static get withHttpAdapterFastify(): TodoControllerSourceModel {
    return createTodoControllerSourceModel(
      HttpAdapter.fastify,
      ApiStyle.codeFirst,
    );
  }

  public static get withHttpAdapterHono(): TodoControllerSourceModel {
    return createTodoControllerSourceModel(
      HttpAdapter.hono,
      ApiStyle.codeFirst,
    );
  }

  public static get withHttpAdapterUwebsockets(): TodoControllerSourceModel {
    return createTodoControllerSourceModel(
      HttpAdapter.uwebsockets,
      ApiStyle.codeFirst,
    );
  }

  public static get withSchemaFirstHttpAdapterExpress(): TodoControllerSourceModel {
    return createTodoControllerSourceModel(
      HttpAdapter.express,
      ApiStyle.schemaFirst,
    );
  }
}
