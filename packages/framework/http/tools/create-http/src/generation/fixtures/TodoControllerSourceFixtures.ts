import { generateTodoControllerSource } from '../calculations/generateTodoControllerSource.js';
import { TodoControllerSourceModelFixtures } from './TodoControllerSourceModelFixtures.js';

export class TodoControllerSourceFixtures {
  public static async withHttpAdapterExpress(): Promise<string> {
    return generateTodoControllerSource(
      TodoControllerSourceModelFixtures.withHttpAdapterExpress,
    );
  }

  public static async withHttpAdapterUwebsockets(): Promise<string> {
    return generateTodoControllerSource(
      TodoControllerSourceModelFixtures.withHttpAdapterUwebsockets,
    );
  }
}
