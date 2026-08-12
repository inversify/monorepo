import { createTodoControllerSourceModel } from '../calculations/createTodoControllerSourceModel.js';
import { type TodoControllerSourceModel } from '../models/TodoControllerSourceModel.js';

export class TodoControllerSourceModelFixtures {
  public static get withHttpAdapterExpress(): TodoControllerSourceModel {
    return createTodoControllerSourceModel('express');
  }

  public static get withHttpAdapterFastify(): TodoControllerSourceModel {
    return createTodoControllerSourceModel('fastify');
  }

  public static get withHttpAdapterHono(): TodoControllerSourceModel {
    return createTodoControllerSourceModel('hono');
  }

  public static get withHttpAdapterUwebsockets(): TodoControllerSourceModel {
    return createTodoControllerSourceModel('uwebsockets');
  }
}
