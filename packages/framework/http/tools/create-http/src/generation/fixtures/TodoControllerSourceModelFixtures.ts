import { HttpAdapter } from '../../models/HttpAdapter.js';
import { createTodoControllerSourceModel } from '../calculations/createTodoControllerSourceModel.js';
import { type TodoControllerSourceModel } from '../models/TodoControllerSourceModel.js';

export class TodoControllerSourceModelFixtures {
  public static get withHttpAdapterExpress(): TodoControllerSourceModel {
    return createTodoControllerSourceModel(HttpAdapter.express);
  }

  public static get withHttpAdapterFastify(): TodoControllerSourceModel {
    return createTodoControllerSourceModel(HttpAdapter.fastify);
  }

  public static get withHttpAdapterHono(): TodoControllerSourceModel {
    return createTodoControllerSourceModel(HttpAdapter.hono);
  }

  public static get withHttpAdapterUwebsockets(): TodoControllerSourceModel {
    return createTodoControllerSourceModel(HttpAdapter.uwebsockets);
  }
}
