import { generateUpdateTodoV1RequestBodySource } from '../calculations/generateUpdateTodoV1RequestBodySource.js';

export class UpdateTodoV1RequestBodySourceFixtures {
  public static get any(): string {
    return generateUpdateTodoV1RequestBodySource();
  }
}
