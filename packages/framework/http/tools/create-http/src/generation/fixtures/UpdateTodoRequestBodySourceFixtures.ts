import { generateUpdateTodoRequestBodySource } from '../calculations/generateUpdateTodoRequestBodySource.js';

export class UpdateTodoRequestBodySourceFixtures {
  public static get any(): string {
    return generateUpdateTodoRequestBodySource();
  }
}
