import { generateCreateTodoV1RequestBodySource } from '../calculations/generateCreateTodoV1RequestBodySource.js';

export class CreateTodoV1RequestBodySourceFixtures {
  public static get any(): string {
    return generateCreateTodoV1RequestBodySource();
  }
}
