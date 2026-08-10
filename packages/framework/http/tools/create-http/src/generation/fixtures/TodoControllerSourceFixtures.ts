import { generateTodoControllerSource } from '../calculations/generateTodoControllerSource.js';

export class TodoControllerSourceFixtures {
  public static get any(): string {
    return generateTodoControllerSource();
  }
}
